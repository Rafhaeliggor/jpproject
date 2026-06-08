package repository

import (
	"crypto/rand"
	"database/sql"
	"encoding/hex"

	"github.com/rafhaeliggor/jpproject/backend/internal/models"
)

type GroupRepo struct{ db *sql.DB }

func NewGroupRepo(db *sql.DB) *GroupRepo { return &GroupRepo{db: db} }

func generateCode() string {
	b := make([]byte, 4)
	rand.Read(b)
	return hex.EncodeToString(b)
}

func (r *GroupRepo) Create(name string, userID int) (*models.Group, error) {
	code := generateCode()

	res, err := r.db.Exec(
		"INSERT INTO `groups` (name, invite_code, created_by) VALUES (?, ?, ?)",
		name, code, nullableInt(userID),
	)
	if err != nil {
		return nil, err
	}
	id, _ := res.LastInsertId()
	groupID := int(id)

	if err := r.AddMember(groupID, userID, "owner"); err != nil {
		return nil, err
	}

	return r.FindByID(groupID)
}

func (r *GroupRepo) FindByInviteCode(code string) (*models.Group, error) {
	g := &models.Group{}
	err := r.db.QueryRow(
		"SELECT id, name, invite_code, COALESCE(created_by,0), DATE_FORMAT(created_at,'%Y-%m-%dT%H:%i:%sZ') FROM `groups` WHERE invite_code=?",
		code,
	).Scan(&g.ID, &g.Name, &g.InviteCode, &g.CreatedBy, &g.CreatedAt)
	if err != nil {
		return nil, err
	}
	return g, nil
}

func (r *GroupRepo) FindByUser(userID int) (int, error) {
	var groupID int
	err := r.db.QueryRow(
		"SELECT group_id FROM group_members WHERE user_id=?", userID,
	).Scan(&groupID)
	if err == sql.ErrNoRows {
		return 0, nil
	}
	return groupID, err
}

func (r *GroupRepo) AddMember(groupID, userID int, role string) error {
	_, err := r.db.Exec(
		"INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE group_id=VALUES(group_id)",
		groupID, userID, role,
	)
	return err
}

func (r *GroupRepo) ListMembers(groupID int) ([]*models.User, error) {
	rows, err := r.db.Query(
		`SELECT u.id, u.name, u.email, u.initials, u.avatar_url, u.color, u.created_at
		 FROM users u
		 INNER JOIN group_members gm ON gm.user_id = u.id
		 WHERE gm.group_id = ?
		 ORDER BY gm.joined_at`, groupID,
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

func (r *GroupRepo) RemoveMember(userID int) error {
	_, err := r.db.Exec("DELETE FROM group_members WHERE user_id=?", userID)
	return err
}

func (r *GroupRepo) FindByID(id int) (*models.Group, error) {
	g := &models.Group{}
	err := r.db.QueryRow(
		"SELECT id, name, invite_code, COALESCE(created_by,0), DATE_FORMAT(created_at,'%Y-%m-%dT%H:%i:%sZ') FROM `groups` WHERE id=?",
		id,
	).Scan(&g.ID, &g.Name, &g.InviteCode, &g.CreatedBy, &g.CreatedAt)
	if err != nil {
		return nil, err
	}
	return g, nil
}
