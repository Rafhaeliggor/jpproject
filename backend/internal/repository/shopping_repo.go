package repository

import (
	"database/sql"
	"strings"

	"github.com/rafhaeliggor/jpproject/backend/internal/models"
)

type ShoppingRepo struct{ db *sql.DB }

func NewShoppingRepo(db *sql.DB) *ShoppingRepo { return &ShoppingRepo{db: db} }

func (r *ShoppingRepo) Create(item *models.ShoppingItem, groupID int) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	res, err := tx.Exec(
		`INSERT INTO shopping_items (name, description, location, price, currency, image_url, added_by, group_id)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
		item.Name, item.Description, item.Location, item.Price, item.Currency,
		item.ImageURL, nullableInt(item.AddedBy), nullableInt(groupID),
	)
	if err != nil {
		return err
	}
	id, _ := res.LastInsertId()
	item.ID = int(id)

	if err := insertItemTags(tx, item.ID, item.Tags); err != nil {
		return err
	}
	return tx.Commit()
}

func (r *ShoppingRepo) List(groupID int, search string) ([]*models.ShoppingItem, error) {
	if groupID == 0 {
		return nil, nil
	}
	query := `SELECT id, name, description, location, price, currency, image_url, COALESCE(added_by,0), created_at FROM shopping_items WHERE group_id=?`
	args := []interface{}{groupID}
	if search != "" {
		query += ` AND name LIKE ?`
		args = append(args, "%"+search+"%")
	}
	query += ` ORDER BY created_at DESC`

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []*models.ShoppingItem
	for rows.Next() {
		item := &models.ShoppingItem{}
		if err := rows.Scan(&item.ID, &item.Name, &item.Description, &item.Location,
			&item.Price, &item.Currency, &item.ImageURL, &item.AddedBy, &item.CreatedAt); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	for _, item := range items {
		item.Tags, _ = r.getItemTags(item.ID)
	}
	return items, nil
}

func (r *ShoppingRepo) FindByID(id int) (*models.ShoppingItem, error) {
	item := &models.ShoppingItem{}
	err := r.db.QueryRow(
		`SELECT id, name, description, location, price, currency, image_url, COALESCE(added_by,0), created_at
		 FROM shopping_items WHERE id=?`, id,
	).Scan(&item.ID, &item.Name, &item.Description, &item.Location,
		&item.Price, &item.Currency, &item.ImageURL, &item.AddedBy, &item.CreatedAt)
	if err != nil {
		return nil, err
	}
	item.Tags, _ = r.getItemTags(item.ID)
	return item, nil
}

func (r *ShoppingRepo) Update(item *models.ShoppingItem) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	_, err = tx.Exec(
		`UPDATE shopping_items SET name=?, description=?, location=?, price=?, currency=?, image_url=? WHERE id=?`,
		item.Name, item.Description, item.Location, item.Price, item.Currency, item.ImageURL, item.ID,
	)
	if err != nil {
		return err
	}

	if _, err = tx.Exec(`DELETE FROM shopping_item_tags WHERE item_id=?`, item.ID); err != nil {
		return err
	}
	if err = insertItemTags(tx, item.ID, item.Tags); err != nil {
		return err
	}
	return tx.Commit()
}

func (r *ShoppingRepo) Delete(id int) error {
	_, err := r.db.Exec(`DELETE FROM shopping_items WHERE id=?`, id)
	return err
}

func (r *ShoppingRepo) getItemTags(itemID int) ([]string, error) {
	rows, err := r.db.Query(`SELECT tag FROM shopping_item_tags WHERE item_id=? ORDER BY tag`, itemID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var tags []string
	for rows.Next() {
		var t string
		if err := rows.Scan(&t); err != nil {
			return nil, err
		}
		tags = append(tags, t)
	}
	return tags, rows.Err()
}

func insertItemTags(tx *sql.Tx, itemID int, tags []string) error {
	for _, tag := range tags {
		tag = strings.TrimSpace(tag)
		if tag == "" {
			continue
		}
		if _, err := tx.Exec(
			`INSERT IGNORE INTO shopping_item_tags (item_id, tag) VALUES (?, ?)`, itemID, tag,
		); err != nil {
			return err
		}
	}
	return nil
}
