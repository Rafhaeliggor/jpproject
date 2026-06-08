package handlers

import (
	"database/sql"
	"net/http"
	"strings"
	"unicode"

	"github.com/rafhaeliggor/jpproject/backend/internal/middleware"
	"github.com/rafhaeliggor/jpproject/backend/internal/models"
	"github.com/rafhaeliggor/jpproject/backend/internal/repository"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	users     *repository.UserRepo
	groups    *repository.GroupRepo
	jwtSecret string
}

func NewAuthHandler(users *repository.UserRepo, groups *repository.GroupRepo, jwtSecret string) *AuthHandler {
	return &AuthHandler{users: users, groups: groups, jwtSecret: jwtSecret}
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req models.RegisterRequest
	if err := decode(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	req.Name = strings.TrimSpace(req.Name)
	req.Email = strings.ToLower(strings.TrimSpace(req.Email))
	req.Password = strings.TrimSpace(req.Password)

	if req.Name == "" || req.Email == "" || req.Password == "" {
		writeError(w, http.StatusBadRequest, "name, email and password are required")
		return
	}
	if len(req.Password) < 6 {
		writeError(w, http.StatusBadRequest, "password must be at least 6 characters")
		return
	}

	exists, err := h.users.EmailExists(req.Email)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "server error")
		return
	}
	if exists {
		writeError(w, http.StatusConflict, "email already registered")
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "server error")
		return
	}

	user := &models.User{
		Name:     req.Name,
		Email:    req.Email,
		Initials: initials(req.Name),
		Color:    randomColor(req.Email),
	}

	if err := h.users.Create(user, string(hash)); err != nil {
		writeError(w, http.StatusInternalServerError, "could not create user")
		return
	}

	groupID := 0

	token, err := middleware.GenerateToken(user.ID, user.Email, user.Name, groupID, h.jwtSecret)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not generate token")
		return
	}

	writeJSON(w, http.StatusCreated, models.AuthResponse{Token: token, User: *user})
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req models.LoginRequest
	if err := decode(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	req.Email = strings.ToLower(strings.TrimSpace(req.Email))

	user, hash, err := h.users.FindByEmail(req.Email)
	if err == sql.ErrNoRows {
		writeError(w, http.StatusUnauthorized, "invalid email or password")
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, "server error")
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(req.Password)); err != nil {
		writeError(w, http.StatusUnauthorized, "invalid email or password")
		return
	}

	groupID, err := h.groups.FindByUser(user.ID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "server error")
		return
	}

	token, err := middleware.GenerateToken(user.ID, user.Email, user.Name, groupID, h.jwtSecret)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not generate token")
		return
	}

	writeJSON(w, http.StatusOK, models.AuthResponse{Token: token, User: *user})
}

func (h *AuthHandler) Me(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserIDFromContext(r.Context())
	user, err := h.users.FindByID(userID)
	if err != nil {
		writeError(w, http.StatusNotFound, "user not found")
		return
	}
	writeJSON(w, http.StatusOK, user)
}

func initials(name string) string {
	parts := strings.Fields(name)
	if len(parts) == 0 {
		return "?"
	}
	result := ""
	for i, p := range parts {
		if i >= 2 {
			break
		}
		runes := []rune(p)
		if len(runes) > 0 {
			result += strings.ToUpper(string(unicode.ToUpper(runes[0])))
		}
	}
	return result
}

var colors = []string{"#6366f1", "#ec4899", "#14b8a6", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444"}

func randomColor(seed string) string {
	sum := 0
	for _, c := range seed {
		sum += int(c)
	}
	return colors[sum%len(colors)]
}
