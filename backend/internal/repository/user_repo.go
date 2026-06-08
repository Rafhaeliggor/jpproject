package repository

import (
	"database/sql"
	"fmt"

	"github.com/rafhaeliggor/jpproject/backend/internal/models"
)

type UserRepo struct{ db *sql.DB }

func NewUserRepo(db *sql.DB) *UserRepo { return &UserRepo{db: db} }

func (r *UserRepo) Create(u *models.User, passwordHash string) error {
	result, err := r.db.Exec(
		`INSERT INTO users (name, email, password_hash, initials, avatar_url, color)
		 VALUES (?, ?, ?, ?, ?, ?)`,
		u.Name, u.Email, passwordHash, u.Initials, u.AvatarURL, u.Color,
	)
	if err != nil {
		return err
	}
	id, err := result.LastInsertId()
	if err != nil {
		return err
	}
	u.ID = int(id)

	_, err = r.db.Exec(
		`INSERT INTO user_settings (user_id) VALUES (?)`, u.ID,
	)
	return err
}

func (r *UserRepo) FindByEmail(email string) (*models.User, string, error) {
	u := &models.User{}
	var hash string
	err := r.db.QueryRow(
		`SELECT id, name, email, password_hash, initials, avatar_url, color, created_at
		 FROM users WHERE email = ?`, email,
	).Scan(&u.ID, &u.Name, &u.Email, &hash, &u.Initials, &u.AvatarURL, &u.Color, &u.CreatedAt)
	if err != nil {
		return nil, "", err
	}
	return u, hash, nil
}

func (r *UserRepo) FindByID(id int) (*models.User, error) {
	u := &models.User{}
	err := r.db.QueryRow(
		`SELECT id, name, email, initials, avatar_url, color, created_at
		 FROM users WHERE id = ?`, id,
	).Scan(&u.ID, &u.Name, &u.Email, &u.Initials, &u.AvatarURL, &u.Color, &u.CreatedAt)
	if err != nil {
		return nil, err
	}
	return u, nil
}

func (r *UserRepo) List() ([]*models.User, error) {
	rows, err := r.db.Query(
		`SELECT id, name, email, initials, avatar_url, color, created_at FROM users ORDER BY id`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []*models.User
	for rows.Next() {
		u := &models.User{}
		if err := rows.Scan(&u.ID, &u.Name, &u.Email, &u.Initials, &u.AvatarURL, &u.Color, &u.CreatedAt); err != nil {
			return nil, err
		}
		users = append(users, u)
	}
	return users, rows.Err()
}

func (r *UserRepo) Update(id int, name, avatarURL, color string) error {
	_, err := r.db.Exec(
		`UPDATE users SET name=?, avatar_url=?, color=? WHERE id=?`,
		name, avatarURL, color, id,
	)
	return err
}

func (r *UserRepo) GetSettings(userID int) (*models.UserSettings, error) {
	s := &models.UserSettings{}
	err := r.db.QueryRow(
		`SELECT user_id, font, contrast, vlibras_enabled, keyboard_nav_enabled, a11y_contrast_enabled
		 FROM user_settings WHERE user_id = ?`, userID,
	).Scan(&s.UserID, &s.Font, &s.Contrast, &s.VLibrasEnabled, &s.KeyboardNavEnabled, &s.A11yContrastEnabled)
	if err != nil {
		return nil, err
	}
	return s, nil
}

func (r *UserRepo) UpdateSettings(s *models.UserSettings) error {
	res, err := r.db.Exec(
		`UPDATE user_settings SET font=?, contrast=?, vlibras_enabled=?, keyboard_nav_enabled=?, a11y_contrast_enabled=?
		 WHERE user_id=?`,
		s.Font, s.Contrast, s.VLibrasEnabled, s.KeyboardNavEnabled, s.A11yContrastEnabled, s.UserID,
	)
	if err != nil {
		return err
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return fmt.Errorf("settings not found for user %d", s.UserID)
	}
	return nil
}

func (r *UserRepo) EmailExists(email string) (bool, error) {
	var count int
	err := r.db.QueryRow(`SELECT COUNT(*) FROM users WHERE email=?`, email).Scan(&count)
	return count > 0, err
}
