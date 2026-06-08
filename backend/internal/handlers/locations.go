package handlers

import (
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/rafhaeliggor/jpproject/backend/internal/middleware"
	"github.com/rafhaeliggor/jpproject/backend/internal/models"
	"github.com/rafhaeliggor/jpproject/backend/internal/repository"
)

type LocationHandler struct {
	locations *repository.LocationRepo
}

func NewLocationHandler(locations *repository.LocationRepo) *LocationHandler {
	return &LocationHandler{locations: locations}
}

func (h *LocationHandler) List(w http.ResponseWriter, r *http.Request) {
	groupID := middleware.GroupIDFromContext(r.Context())
	locs, err := h.locations.List(groupID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not list locations")
		return
	}
	if locs == nil {
		locs = []*models.Location{}
	}
	writeJSON(w, http.StatusOK, locs)
}

func (h *LocationHandler) Get(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid id")
		return
	}
	loc, err := h.locations.FindByID(id)
	if err != nil {
		writeError(w, http.StatusNotFound, "location not found")
		return
	}
	writeJSON(w, http.StatusOK, loc)
}

func (h *LocationHandler) Create(w http.ResponseWriter, r *http.Request) {
	var loc models.Location
	if err := decode(r, &loc); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if loc.Name == "" {
		writeError(w, http.StatusBadRequest, "name is required")
		return
	}
	loc.CreatedBy = middleware.UserIDFromContext(r.Context())
	groupID := middleware.GroupIDFromContext(r.Context())
	if err := h.locations.Create(&loc, groupID); err != nil {
		writeError(w, http.StatusInternalServerError, "could not create location")
		return
	}
	writeJSON(w, http.StatusCreated, loc)
}

func (h *LocationHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid id")
		return
	}
	var loc models.Location
	if err := decode(r, &loc); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	loc.ID = id
	if err := h.locations.Update(&loc); err != nil {
		writeError(w, http.StatusInternalServerError, "could not update location")
		return
	}
	updated, _ := h.locations.FindByID(id)
	writeJSON(w, http.StatusOK, updated)
}

func (h *LocationHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid id")
		return
	}
	if err := h.locations.Delete(id); err != nil {
		writeError(w, http.StatusInternalServerError, "could not delete location")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *LocationHandler) Vote(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid id")
		return
	}
	userID := middleware.UserIDFromContext(r.Context())
	if err := h.locations.Vote(id, userID); err != nil {
		writeError(w, http.StatusInternalServerError, "could not vote")
		return
	}
	loc, _ := h.locations.FindByID(id)
	writeJSON(w, http.StatusOK, loc)
}

func (h *LocationHandler) RemoveVote(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid id")
		return
	}
	userID := middleware.UserIDFromContext(r.Context())
	if err := h.locations.RemoveVote(id, userID); err != nil {
		writeError(w, http.StatusInternalServerError, "could not remove vote")
		return
	}
	loc, _ := h.locations.FindByID(id)
	writeJSON(w, http.StatusOK, loc)
}

func (h *LocationHandler) GetItinerary(w http.ResponseWriter, r *http.Request) {
	groupID := middleware.GroupIDFromContext(r.Context())
	locs, err := h.locations.GetItinerary(groupID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not get itinerary")
		return
	}
	if locs == nil {
		locs = []*models.Location{}
	}
	writeJSON(w, http.StatusOK, locs)
}

func (h *LocationHandler) AddToItinerary(w http.ResponseWriter, r *http.Request) {
	var body struct {
		LocationID int `json:"location_id"`
	}
	if err := decode(r, &body); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	userID := middleware.UserIDFromContext(r.Context())
	groupID := middleware.GroupIDFromContext(r.Context())
	if err := h.locations.AddToItinerary(body.LocationID, userID); err != nil {
		writeError(w, http.StatusInternalServerError, "could not add to itinerary")
		return
	}
	locs, _ := h.locations.GetItinerary(groupID)
	if locs == nil {
		locs = []*models.Location{}
	}
	writeJSON(w, http.StatusOK, locs)
}

func (h *LocationHandler) RemoveFromItinerary(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "locationId"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid id")
		return
	}
	groupID := middleware.GroupIDFromContext(r.Context())
	if err := h.locations.RemoveFromItinerary(id); err != nil {
		writeError(w, http.StatusInternalServerError, "could not remove from itinerary")
		return
	}
	locs, _ := h.locations.GetItinerary(groupID)
	if locs == nil {
		locs = []*models.Location{}
	}
	writeJSON(w, http.StatusOK, locs)
}
