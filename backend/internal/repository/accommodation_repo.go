package repository

import (
	"database/sql"
	"strings"
	"time"

	"github.com/rafhaeliggor/jpproject/backend/internal/models"
)

type AccommodationRepo struct{ db *sql.DB }

func NewAccommodationRepo(db *sql.DB) *AccommodationRepo { return &AccommodationRepo{db: db} }

func (r *AccommodationRepo) Create(a *models.Accommodation, groupID int) error {
	a.Nights = calcNights(a.CheckIn, a.CheckOut)
	if a.TotalPrice == 0 && a.PricePerNight > 0 && a.Nights > 0 {
		a.TotalPrice = a.PricePerNight * float64(a.Nights)
	}

	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	res, err := tx.Exec(
		`INSERT INTO accommodations (name, type, address, city, check_in, check_out, nights,
		 price_per_night, total_price, currency, rating, image_url, notes, added_by, group_id)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		a.Name, a.Type, a.Address, a.City,
		nullableDate(a.CheckIn), nullableDate(a.CheckOut), a.Nights,
		a.PricePerNight, a.TotalPrice, a.Currency, a.Rating,
		a.ImageURL, a.Notes, nullableInt(a.AddedBy), nullableInt(groupID),
	)
	if err != nil {
		return err
	}
	id, _ := res.LastInsertId()
	a.ID = int(id)

	if err := insertAccomTags(tx, a.ID, a.Tags); err != nil {
		return err
	}
	return tx.Commit()
}

func (r *AccommodationRepo) List(groupID int) ([]*models.Accommodation, error) {
	if groupID == 0 {
		return nil, nil
	}
	rows, err := r.db.Query(
		`SELECT id, name, type, address, city,
		        COALESCE(DATE_FORMAT(check_in,'%Y-%m-%d'),''),
		        COALESCE(DATE_FORMAT(check_out,'%Y-%m-%d'),''),
		        nights, price_per_night, total_price, currency, rating,
		        image_url, COALESCE(notes,''), COALESCE(added_by,0), created_at
		 FROM accommodations WHERE group_id=? ORDER BY check_in ASC, id ASC`,
		groupID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []*models.Accommodation
	for rows.Next() {
		a := &models.Accommodation{}
		if err := rows.Scan(
			&a.ID, &a.Name, &a.Type, &a.Address, &a.City,
			&a.CheckIn, &a.CheckOut, &a.Nights,
			&a.PricePerNight, &a.TotalPrice, &a.Currency, &a.Rating,
			&a.ImageURL, &a.Notes, &a.AddedBy, &a.CreatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, a)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	for _, a := range items {
		a.Tags, _ = r.getTags(a.ID)
	}
	return items, nil
}

func (r *AccommodationRepo) FindByID(id int) (*models.Accommodation, error) {
	a := &models.Accommodation{}
	err := r.db.QueryRow(
		`SELECT id, name, type, address, city,
		        COALESCE(DATE_FORMAT(check_in,'%Y-%m-%d'),''),
		        COALESCE(DATE_FORMAT(check_out,'%Y-%m-%d'),''),
		        nights, price_per_night, total_price, currency, rating,
		        image_url, COALESCE(notes,''), COALESCE(added_by,0), created_at
		 FROM accommodations WHERE id=?`, id,
	).Scan(
		&a.ID, &a.Name, &a.Type, &a.Address, &a.City,
		&a.CheckIn, &a.CheckOut, &a.Nights,
		&a.PricePerNight, &a.TotalPrice, &a.Currency, &a.Rating,
		&a.ImageURL, &a.Notes, &a.AddedBy, &a.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	a.Tags, _ = r.getTags(a.ID)
	return a, nil
}

func (r *AccommodationRepo) Update(a *models.Accommodation) error {
	a.Nights = calcNights(a.CheckIn, a.CheckOut)
	if a.TotalPrice == 0 && a.PricePerNight > 0 && a.Nights > 0 {
		a.TotalPrice = a.PricePerNight * float64(a.Nights)
	}

	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	_, err = tx.Exec(
		`UPDATE accommodations SET name=?, type=?, address=?, city=?, check_in=?, check_out=?,
		 nights=?, price_per_night=?, total_price=?, currency=?, rating=?, image_url=?, notes=?
		 WHERE id=?`,
		a.Name, a.Type, a.Address, a.City,
		nullableDate(a.CheckIn), nullableDate(a.CheckOut), a.Nights,
		a.PricePerNight, a.TotalPrice, a.Currency, a.Rating,
		a.ImageURL, a.Notes, a.ID,
	)
	if err != nil {
		return err
	}
	if _, err = tx.Exec(`DELETE FROM accommodation_tags WHERE accommodation_id=?`, a.ID); err != nil {
		return err
	}
	if err = insertAccomTags(tx, a.ID, a.Tags); err != nil {
		return err
	}
	return tx.Commit()
}

func (r *AccommodationRepo) Delete(id int) error {
	_, err := r.db.Exec(`DELETE FROM accommodations WHERE id=?`, id)
	return err
}

func (r *AccommodationRepo) HasAny(groupID int) (bool, error) {
	if groupID == 0 {
		return false, nil
	}
	var count int
	err := r.db.QueryRow(`SELECT COUNT(*) FROM accommodations WHERE group_id=?`, groupID).Scan(&count)
	return count > 0, err
}

func (r *AccommodationRepo) getTags(id int) ([]string, error) {
	rows, err := r.db.Query(`SELECT tag FROM accommodation_tags WHERE accommodation_id=? ORDER BY tag`, id)
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

func insertAccomTags(tx *sql.Tx, id int, tags []string) error {
	for _, tag := range tags {
		tag = strings.TrimSpace(tag)
		if tag == "" {
			continue
		}
		if _, err := tx.Exec(
			`INSERT IGNORE INTO accommodation_tags (accommodation_id, tag) VALUES (?, ?)`, id, tag,
		); err != nil {
			return err
		}
	}
	return nil
}


func calcNights(checkIn, checkOut string) int {
	if checkIn == "" || checkOut == "" {
		return 0
	}
	in, err1 := time.Parse("2006-01-02", checkIn)
	out, err2 := time.Parse("2006-01-02", checkOut)
	if err1 != nil || err2 != nil || !out.After(in) {
		return 0
	}
	return int(out.Sub(in).Hours() / 24)
}
