package repository

import (
	"database/sql"

	"github.com/rafhaeliggor/jpproject/backend/internal/models"
)

type LocationRepo struct{ db *sql.DB }

func NewLocationRepo(db *sql.DB) *LocationRepo { return &LocationRepo{db: db} }

func (r *LocationRepo) Create(loc *models.Location, groupID int) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	res, err := tx.Exec(
		`INSERT INTO locations (name, address, city, duration_label, duration_minutes, description, image_url, lat, lng, created_by, group_id)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		loc.Name, loc.Address, loc.City, loc.DurationLabel, loc.DurationMinutes,
		loc.Description, loc.ImageURL, loc.Lat, loc.Lng, nullableInt(loc.CreatedBy), nullableInt(groupID),
	)
	if err != nil {
		return err
	}
	id, _ := res.LastInsertId()
	loc.ID = int(id)

	if err := insertTags(tx, "location_tags", "location_id", loc.ID, loc.Tags); err != nil {
		return err
	}
	return tx.Commit()
}

func (r *LocationRepo) List(groupID int) ([]*models.Location, error) {
	if groupID == 0 {
		return nil, nil
	}
	rows, err := r.db.Query(
		`SELECT id, name, address, city, duration_label, duration_minutes, description, image_url, lat, lng, COALESCE(created_by,0), created_at FROM locations WHERE group_id=? ORDER BY id`,
		groupID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var locs []*models.Location
	for rows.Next() {
		loc := &models.Location{}
		if err := rows.Scan(&loc.ID, &loc.Name, &loc.Address, &loc.City, &loc.DurationLabel,
			&loc.DurationMinutes, &loc.Description, &loc.ImageURL, &loc.Lat, &loc.Lng,
			&loc.CreatedBy, &loc.CreatedAt); err != nil {
			return nil, err
		}
		locs = append(locs, loc)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	for _, loc := range locs {
		loc.Tags, _ = r.getTags(loc.ID)
		loc.VoterIDs, _ = r.getVoters(loc.ID)
		loc.InItinerary, _ = r.isInItinerary(loc.ID)
	}
	return locs, nil
}

func (r *LocationRepo) FindByID(id int) (*models.Location, error) {
	loc := &models.Location{}
	err := r.db.QueryRow(
		`SELECT id, name, address, city, duration_label, duration_minutes, description, image_url, lat, lng, COALESCE(created_by,0), created_at
		 FROM locations WHERE id=?`, id,
	).Scan(&loc.ID, &loc.Name, &loc.Address, &loc.City, &loc.DurationLabel,
		&loc.DurationMinutes, &loc.Description, &loc.ImageURL, &loc.Lat, &loc.Lng,
		&loc.CreatedBy, &loc.CreatedAt)
	if err != nil {
		return nil, err
	}
	loc.Tags, _ = r.getTags(loc.ID)
	loc.VoterIDs, _ = r.getVoters(loc.ID)
	loc.InItinerary, _ = r.isInItinerary(loc.ID)
	return loc, nil
}

func (r *LocationRepo) Update(loc *models.Location) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	_, err = tx.Exec(
		`UPDATE locations SET name=?, address=?, city=?, duration_label=?, duration_minutes=?, description=?, image_url=?, lat=?, lng=? WHERE id=?`,
		loc.Name, loc.Address, loc.City, loc.DurationLabel, loc.DurationMinutes,
		loc.Description, loc.ImageURL, loc.Lat, loc.Lng, loc.ID,
	)
	if err != nil {
		return err
	}

	if _, err = tx.Exec(`DELETE FROM location_tags WHERE location_id=?`, loc.ID); err != nil {
		return err
	}
	if err = insertTags(tx, "location_tags", "location_id", loc.ID, loc.Tags); err != nil {
		return err
	}
	return tx.Commit()
}

func (r *LocationRepo) Delete(id int) error {
	_, err := r.db.Exec(`DELETE FROM locations WHERE id=?`, id)
	return err
}

func (r *LocationRepo) Vote(locationID, userID int) error {
	_, err := r.db.Exec(
		`INSERT IGNORE INTO location_votes (location_id, user_id) VALUES (?, ?)`,
		locationID, userID,
	)
	return err
}

func (r *LocationRepo) RemoveVote(locationID, userID int) error {
	_, err := r.db.Exec(
		`DELETE FROM location_votes WHERE location_id=? AND user_id=?`,
		locationID, userID,
	)
	return err
}

func (r *LocationRepo) AddToItinerary(locationID, userID int) error {
	_, err := r.db.Exec(
		`INSERT IGNORE INTO itinerary_items (location_id, added_by) VALUES (?, ?)`,
		locationID, userID,
	)
	return err
}

func (r *LocationRepo) RemoveFromItinerary(locationID int) error {
	_, err := r.db.Exec(`DELETE FROM itinerary_items WHERE location_id=?`, locationID)
	return err
}

func (r *LocationRepo) GetItinerary(groupID int) ([]*models.Location, error) {
	if groupID == 0 {
		return nil, nil
	}
	rows, err := r.db.Query(
		`SELECT l.id, l.name, l.address, l.city, l.duration_label, l.duration_minutes,
		        l.description, l.image_url, l.lat, l.lng, COALESCE(l.created_by,0), l.created_at
		 FROM locations l
		 INNER JOIN itinerary_items ii ON ii.location_id = l.id
		 WHERE l.group_id=?
		 ORDER BY ii.added_at`,
		groupID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var locs []*models.Location
	for rows.Next() {
		loc := &models.Location{}
		if err := rows.Scan(&loc.ID, &loc.Name, &loc.Address, &loc.City, &loc.DurationLabel,
			&loc.DurationMinutes, &loc.Description, &loc.ImageURL, &loc.Lat, &loc.Lng,
			&loc.CreatedBy, &loc.CreatedAt); err != nil {
			return nil, err
		}
		loc.InItinerary = true
		loc.Tags, _ = r.getTags(loc.ID)
		loc.VoterIDs, _ = r.getVoters(loc.ID)
		locs = append(locs, loc)
	}
	return locs, rows.Err()
}

func (r *LocationRepo) getTags(locationID int) ([]string, error) {
	rows, err := r.db.Query(`SELECT tag FROM location_tags WHERE location_id=? ORDER BY tag`, locationID)
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

func (r *LocationRepo) getVoters(locationID int) ([]int, error) {
	rows, err := r.db.Query(`SELECT user_id FROM location_votes WHERE location_id=?`, locationID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var ids []int
	for rows.Next() {
		var id int
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		ids = append(ids, id)
	}
	return ids, rows.Err()
}

func (r *LocationRepo) isInItinerary(locationID int) (bool, error) {
	var count int
	err := r.db.QueryRow(`SELECT COUNT(*) FROM itinerary_items WHERE location_id=?`, locationID).Scan(&count)
	return count > 0, err
}

func insertTags(tx *sql.Tx, table, idCol string, id int, tags []string) error {
	for _, tag := range tags {
		if tag == "" {
			continue
		}
		if _, err := tx.Exec(
			`INSERT IGNORE INTO `+table+` (`+idCol+`, tag) VALUES (?, ?)`, id, tag,
		); err != nil {
			return err
		}
	}
	return nil
}
