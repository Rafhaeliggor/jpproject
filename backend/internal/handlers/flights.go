package handlers

import (
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/rafhaeliggor/jpproject/backend/internal/middleware"
	"github.com/rafhaeliggor/jpproject/backend/internal/models"
	"github.com/rafhaeliggor/jpproject/backend/internal/repository"
)

type FlightHandler struct {
	flights *repository.FlightRepo
}

func NewFlightHandler(flights *repository.FlightRepo) *FlightHandler {
	return &FlightHandler{flights: flights}
}

func (h *FlightHandler) List(w http.ResponseWriter, r *http.Request) {
	groupID := middleware.GroupIDFromContext(r.Context())
	flights, err := h.flights.List(groupID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not list flights")
		return
	}
	if flights == nil {
		flights = []*models.Flight{}
	}
	writeJSON(w, http.StatusOK, flights)
}

func (h *FlightHandler) Get(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid id")
		return
	}
	f, err := h.flights.FindByID(id)
	if err != nil {
		writeError(w, http.StatusNotFound, "flight not found")
		return
	}
	writeJSON(w, http.StatusOK, f)
}

func (h *FlightHandler) Create(w http.ResponseWriter, r *http.Request) {
	var f models.Flight
	if err := decode(r, &f); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if f.Airline == "" {
		writeError(w, http.StatusBadRequest, "airline is required")
		return
	}
	f.AddedBy = middleware.UserIDFromContext(r.Context())
	groupID := middleware.GroupIDFromContext(r.Context())
	if f.Currency == "" {
		f.Currency = "BRL"
	}
	if err := h.flights.Create(&f, groupID); err != nil {
		writeError(w, http.StatusInternalServerError, "could not create flight")
		return
	}
	writeJSON(w, http.StatusCreated, f)
}

func (h *FlightHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid id")
		return
	}
	var f models.Flight
	if err := decode(r, &f); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	f.ID = id
	if err := h.flights.Update(&f); err != nil {
		writeError(w, http.StatusInternalServerError, "could not update flight")
		return
	}
	updated, _ := h.flights.FindByID(id)
	writeJSON(w, http.StatusOK, updated)
}

func (h *FlightHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid id")
		return
	}
	if err := h.flights.Delete(id); err != nil {
		writeError(w, http.StatusInternalServerError, "could not delete flight")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
