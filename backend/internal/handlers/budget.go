package handlers

import (
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/rafhaeliggor/jpproject/backend/internal/middleware"
	"github.com/rafhaeliggor/jpproject/backend/internal/models"
	"github.com/rafhaeliggor/jpproject/backend/internal/repository"
)

type BudgetHandler struct {
	budget *repository.BudgetRepo
}

func NewBudgetHandler(budget *repository.BudgetRepo) *BudgetHandler {
	return &BudgetHandler{budget: budget}
}

func (h *BudgetHandler) Create(w http.ResponseWriter, r *http.Request) {
	var cat models.BudgetCategory
	if err := decode(r, &cat); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if cat.Name == "" {
		writeError(w, http.StatusBadRequest, "name is required")
		return
	}
	groupID := middleware.GroupIDFromContext(r.Context())
	if err := h.budget.Create(&cat, groupID); err != nil {
		writeError(w, http.StatusInternalServerError, "could not create budget category")
		return
	}
	writeJSON(w, http.StatusCreated, &cat)
}

func (h *BudgetHandler) List(w http.ResponseWriter, r *http.Request) {
	groupID := middleware.GroupIDFromContext(r.Context())
	cats, err := h.budget.List(groupID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not list budget categories")
		return
	}
	if cats == nil {
		cats = []*models.BudgetCategory{}
	}
	writeJSON(w, http.StatusOK, cats)
}

func (h *BudgetHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid id")
		return
	}
	var cat models.BudgetCategory
	if err := decode(r, &cat); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	cat.ID = id
	if err := h.budget.Update(&cat); err != nil {
		writeError(w, http.StatusInternalServerError, "could not update budget category")
		return
	}
	updated, _ := h.budget.FindByID(id)
	writeJSON(w, http.StatusOK, updated)
}
