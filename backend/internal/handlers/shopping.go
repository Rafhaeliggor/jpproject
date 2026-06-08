package handlers

import (
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/rafhaeliggor/jpproject/backend/internal/middleware"
	"github.com/rafhaeliggor/jpproject/backend/internal/models"
	"github.com/rafhaeliggor/jpproject/backend/internal/repository"
)

type ShoppingHandler struct {
	shopping *repository.ShoppingRepo
}

func NewShoppingHandler(shopping *repository.ShoppingRepo) *ShoppingHandler {
	return &ShoppingHandler{shopping: shopping}
}

func (h *ShoppingHandler) List(w http.ResponseWriter, r *http.Request) {
	groupID := middleware.GroupIDFromContext(r.Context())
	search := r.URL.Query().Get("q")
	items, err := h.shopping.List(groupID, search)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not list items")
		return
	}
	if items == nil {
		items = []*models.ShoppingItem{}
	}
	writeJSON(w, http.StatusOK, items)
}

func (h *ShoppingHandler) Get(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid id")
		return
	}
	item, err := h.shopping.FindByID(id)
	if err != nil {
		writeError(w, http.StatusNotFound, "item not found")
		return
	}
	writeJSON(w, http.StatusOK, item)
}

func (h *ShoppingHandler) Create(w http.ResponseWriter, r *http.Request) {
	var item models.ShoppingItem
	if err := decode(r, &item); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if item.Name == "" {
		writeError(w, http.StatusBadRequest, "name is required")
		return
	}
	item.AddedBy = middleware.UserIDFromContext(r.Context())
	groupID := middleware.GroupIDFromContext(r.Context())
	if item.Currency == "" {
		item.Currency = "JPY"
	}
	if err := h.shopping.Create(&item, groupID); err != nil {
		writeError(w, http.StatusInternalServerError, "could not create item")
		return
	}
	writeJSON(w, http.StatusCreated, item)
}

func (h *ShoppingHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid id")
		return
	}
	var item models.ShoppingItem
	if err := decode(r, &item); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	item.ID = id
	if err := h.shopping.Update(&item); err != nil {
		writeError(w, http.StatusInternalServerError, "could not update item")
		return
	}
	updated, _ := h.shopping.FindByID(id)
	writeJSON(w, http.StatusOK, updated)
}

func (h *ShoppingHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid id")
		return
	}
	if err := h.shopping.Delete(id); err != nil {
		writeError(w, http.StatusInternalServerError, "could not delete item")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
