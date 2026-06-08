package handlers

import (
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/rafhaeliggor/jpproject/backend/internal/middleware"
	"github.com/rafhaeliggor/jpproject/backend/internal/models"
	"github.com/rafhaeliggor/jpproject/backend/internal/repository"
)

type UserHandler struct {
	users  *repository.UserRepo
	groups *repository.GroupRepo
}

func NewUserHandler(users *repository.UserRepo, groups *repository.GroupRepo) *UserHandler {
	return &UserHandler{users: users, groups: groups}
}

func (h *UserHandler) List(w http.ResponseWriter, r *http.Request) {
	groupID := middleware.GroupIDFromContext(r.Context())
	if groupID == 0 {
		writeJSON(w, http.StatusOK, []*models.User{})
		return
	}

	users, err := h.groups.ListMembers(groupID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not list users")
		return
	}
	if users == nil {
		users = []*models.User{}
	}
	writeJSON(w, http.StatusOK, users)
}

func (h *UserHandler) Get(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid id")
		return
	}
	user, err := h.users.FindByID(id)
	if err != nil {
		writeError(w, http.StatusNotFound, "user not found")
		return
	}
	writeJSON(w, http.StatusOK, user)
}

func (h *UserHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid id")
		return
	}

	callerID := middleware.UserIDFromContext(r.Context())
	if callerID != id {
		writeError(w, http.StatusForbidden, "cannot update another user")
		return
	}

	var body struct {
		Name      string `json:"name"`
		AvatarURL string `json:"avatar_url"`
		Color     string `json:"color"`
	}
	if err := decode(r, &body); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if err := h.users.Update(id, body.Name, body.AvatarURL, body.Color); err != nil {
		writeError(w, http.StatusInternalServerError, "could not update user")
		return
	}

	user, _ := h.users.FindByID(id)
	writeJSON(w, http.StatusOK, user)
}

func (h *UserHandler) GetSettings(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid id")
		return
	}
	settings, err := h.users.GetSettings(id)
	if err != nil {
		writeError(w, http.StatusNotFound, "settings not found")
		return
	}
	writeJSON(w, http.StatusOK, settings)
}

func (h *UserHandler) UpdateSettings(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid id")
		return
	}

	callerID := middleware.UserIDFromContext(r.Context())
	if callerID != id {
		writeError(w, http.StatusForbidden, "cannot update another user's settings")
		return
	}

	var s models.UserSettings
	if err := decode(r, &s); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	s.UserID = id

	if err := h.users.UpdateSettings(&s); err != nil {
		writeError(w, http.StatusInternalServerError, "could not update settings")
		return
	}
	writeJSON(w, http.StatusOK, s)
}
