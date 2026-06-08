package handlers

import (
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/rafhaeliggor/jpproject/backend/internal/middleware"
	"github.com/rafhaeliggor/jpproject/backend/internal/models"
	"github.com/rafhaeliggor/jpproject/backend/internal/repository"
)

type AccommodationHandler struct {
	repo *repository.AccommodationRepo
}

func NewAccommodationHandler(repo *repository.AccommodationRepo) *AccommodationHandler {
	return &AccommodationHandler{repo: repo}
}

func (h *AccommodationHandler) List(w http.ResponseWriter, r *http.Request) {
	groupID := middleware.GroupIDFromContext(r.Context())
	items, err := h.repo.List(groupID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not list accommodations")
		return
	}
	if items == nil {
		items = []*models.Accommodation{}
	}
	writeJSON(w, http.StatusOK, items)
}

func (h *AccommodationHandler) Get(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid id")
		return
	}
	a, err := h.repo.FindByID(id)
	if err != nil {
		writeError(w, http.StatusNotFound, "accommodation not found")
		return
	}
	writeJSON(w, http.StatusOK, a)
}

func (h *AccommodationHandler) Create(w http.ResponseWriter, r *http.Request) {
	var a models.Accommodation
	if err := decode(r, &a); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if a.Name == "" {
		writeError(w, http.StatusBadRequest, "name is required")
		return
	}
	if a.Type == "" {
		a.Type = "Hotel"
	}
	if a.Currency == "" {
		a.Currency = "BRL"
	}
	a.AddedBy = middleware.UserIDFromContext(r.Context())
	groupID := middleware.GroupIDFromContext(r.Context())
	if err := h.repo.Create(&a, groupID); err != nil {
		writeError(w, http.StatusInternalServerError, "could not create accommodation")
		return
	}
	writeJSON(w, http.StatusCreated, a)
}

func (h *AccommodationHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid id")
		return
	}
	var a models.Accommodation
	if err := decode(r, &a); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	a.ID = id
	if err := h.repo.Update(&a); err != nil {
		writeError(w, http.StatusInternalServerError, "could not update accommodation")
		return
	}
	updated, _ := h.repo.FindByID(id)
	writeJSON(w, http.StatusOK, updated)
}

func (h *AccommodationHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid id")
		return
	}
	if err := h.repo.Delete(id); err != nil {
		writeError(w, http.StatusInternalServerError, "could not delete accommodation")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
