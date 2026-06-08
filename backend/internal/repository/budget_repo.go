package repository

import (
	"database/sql"

	"github.com/rafhaeliggor/jpproject/backend/internal/models"
)

type BudgetRepo struct{ db *sql.DB }

func NewBudgetRepo(db *sql.DB) *BudgetRepo { return &BudgetRepo{db: db} }

func (r *BudgetRepo) List(groupID int) ([]*models.BudgetCategory, error) {
	if groupID == 0 {
		return nil, nil
	}
	rows, err := r.db.Query(
		`SELECT id, name, amount, currency, percentage FROM budget_categories WHERE group_id=? ORDER BY id`,
		groupID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var cats []*models.BudgetCategory
	for rows.Next() {
		c := &models.BudgetCategory{}
		if err := rows.Scan(&c.ID, &c.Name, &c.Amount, &c.Currency, &c.Percentage); err != nil {
			return nil, err
		}
		cats = append(cats, c)
	}
	return cats, rows.Err()
}

func (r *BudgetRepo) FindByID(id int) (*models.BudgetCategory, error) {
	c := &models.BudgetCategory{}
	err := r.db.QueryRow(
		`SELECT id, name, amount, currency, percentage FROM budget_categories WHERE id=?`, id,
	).Scan(&c.ID, &c.Name, &c.Amount, &c.Currency, &c.Percentage)
	if err != nil {
		return nil, err
	}
	return c, nil
}

func (r *BudgetRepo) Update(c *models.BudgetCategory) error {
	_, err := r.db.Exec(
		`UPDATE budget_categories SET name=?, amount=?, currency=?, percentage=? WHERE id=?`,
		c.Name, c.Amount, c.Currency, c.Percentage, c.ID,
	)
	return err
}

func (r *BudgetRepo) HasAny(groupID int) (bool, error) {
	if groupID == 0 {
		return false, nil
	}
	var count int
	err := r.db.QueryRow(`SELECT COUNT(*) FROM budget_categories WHERE group_id=?`, groupID).Scan(&count)
	return count > 0, err
}

func (r *BudgetRepo) Create(c *models.BudgetCategory, groupID int) error {
	res, err := r.db.Exec(
		`INSERT INTO budget_categories (name, amount, currency, percentage, group_id) VALUES (?, ?, ?, ?, ?)`,
		c.Name, c.Amount, c.Currency, c.Percentage, nullableInt(groupID),
	)
	if err != nil {
		return err
	}
	id, _ := res.LastInsertId()
	c.ID = int(id)
	return nil
}
