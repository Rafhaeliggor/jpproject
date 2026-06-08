package handlers

import (
	"database/sql"
	"net/http"

	"github.com/rafhaeliggor/jpproject/backend/internal/middleware"
	"github.com/rafhaeliggor/jpproject/backend/internal/models"
	"github.com/rafhaeliggor/jpproject/backend/internal/repository"
)

type GroupHandler struct {
	groups    *repository.GroupRepo
	users     *repository.UserRepo
	jwtSecret string
}

func NewGroupHandler(groups *repository.GroupRepo, users *repository.UserRepo, jwtSecret string) *GroupHandler {
	return &GroupHandler{groups: groups, users: users, jwtSecret: jwtSecret}
}

func (h *GroupHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserIDFromContext(r.Context())

	var body struct {
		Name string `json:"name"`
	}
	if err := decode(r, &body); err != nil || body.Name == "" {
		writeError(w, http.StatusBadRequest, "name is required")
		return
	}

	group, err := h.groups.Create(body.Name, userID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not create group")
		return
	}

	members, err := h.groups.ListMembers(group.ID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not list members")
		return
	}

	user, err := h.users.FindByID(userID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not find user")
		return
	}

	token, err := middleware.GenerateToken(user.ID, user.Email, user.Name, group.ID, h.jwtSecret)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not generate token")
		return
	}

	memberList := make([]models.User, 0, len(members))
	for _, m := range members {
		memberList = append(memberList, *m)
	}

	writeJSON(w, http.StatusCreated, map[string]interface{}{
		"token": token,
		"group": models.GroupInfo{Group: *group, Members: memberList},
	})
}

func (h *GroupHandler) Join(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserIDFromContext(r.Context())

	var body struct {
		InviteCode string `json:"invite_code"`
	}
	if err := decode(r, &body); err != nil || body.InviteCode == "" {
		writeError(w, http.StatusBadRequest, "invite_code is required")
		return
	}

	group, err := h.groups.FindByInviteCode(body.InviteCode)
	if err == sql.ErrNoRows {
		writeError(w, http.StatusNotFound, "invalid invite code")
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not find group")
		return
	}

	if err := h.groups.AddMember(group.ID, userID, "member"); err != nil {
		writeError(w, http.StatusInternalServerError, "could not join group")
		return
	}

	members, err := h.groups.ListMembers(group.ID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not list members")
		return
	}

	user, err := h.users.FindByID(userID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not find user")
		return
	}

	token, err := middleware.GenerateToken(user.ID, user.Email, user.Name, group.ID, h.jwtSecret)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not generate token")
		return
	}

	memberList := make([]models.User, 0, len(members))
	for _, m := range members {
		memberList = append(memberList, *m)
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"token": token,
		"group": models.GroupInfo{Group: *group, Members: memberList},
	})
}

func (h *GroupHandler) Leave(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserIDFromContext(r.Context())

	if err := h.groups.RemoveMember(userID); err != nil {
		writeError(w, http.StatusInternalServerError, "could not leave group")
		return
	}

	user, err := h.users.FindByID(userID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not find user")
		return
	}

	token, err := middleware.GenerateToken(user.ID, user.Email, user.Name, 0, h.jwtSecret)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not generate token")
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{"token": token})
}

func (h *GroupHandler) Me(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserIDFromContext(r.Context())

	groupID, err := h.groups.FindByUser(userID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not find group")
		return
	}
	if groupID == 0 {
		writeError(w, http.StatusNotFound, "user is not in a group")
		return
	}

	group, err := h.groups.FindByID(groupID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not find group")
		return
	}

	members, err := h.groups.ListMembers(groupID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not list members")
		return
	}

	memberList := make([]models.User, 0, len(members))
	for _, m := range members {
		memberList = append(memberList, *m)
	}

	writeJSON(w, http.StatusOK, models.GroupInfo{Group: *group, Members: memberList})
}
