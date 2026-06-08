package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	chiMiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/rafhaeliggor/jpproject/backend/internal/config"
	"github.com/rafhaeliggor/jpproject/backend/internal/database"
	"github.com/rafhaeliggor/jpproject/backend/internal/handlers"
	"github.com/rafhaeliggor/jpproject/backend/internal/middleware"
	"github.com/rafhaeliggor/jpproject/backend/internal/repository"
)

func main() {
	cfg := config.Load()
	db := database.Connect(cfg)
	defer db.Close()

	database.Migrate(db)
	database.Seed(db)

	userRepo := repository.NewUserRepo(db)
	groupRepo := repository.NewGroupRepo(db)
	locationRepo := repository.NewLocationRepo(db)
	flightRepo := repository.NewFlightRepo(db)
	shoppingRepo := repository.NewShoppingRepo(db)
	budgetRepo := repository.NewBudgetRepo(db)
	accommodationRepo := repository.NewAccommodationRepo(db)

	authHandler := handlers.NewAuthHandler(userRepo, groupRepo, cfg.JWTSecret)
	userHandler := handlers.NewUserHandler(userRepo, groupRepo)
	groupHandler := handlers.NewGroupHandler(groupRepo, userRepo, cfg.JWTSecret)
	locationHandler := handlers.NewLocationHandler(locationRepo)
	flightHandler := handlers.NewFlightHandler(flightRepo)
	shoppingHandler := handlers.NewShoppingHandler(shoppingRepo)
	budgetHandler := handlers.NewBudgetHandler(budgetRepo)
	accommodationHandler := handlers.NewAccommodationHandler(accommodationRepo)

	authMW := middleware.NewAuthMiddleware(cfg.JWTSecret)

	r := chi.NewRouter()

	r.Use(chiMiddleware.RequestID)
	r.Use(chiMiddleware.Logger)
	r.Use(chiMiddleware.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Post("/api/auth/register", authHandler.Register)
	r.Post("/api/auth/login", authHandler.Login)

	r.Group(func(r chi.Router) {
		r.Use(authMW.Authenticate)

		r.Get("/api/auth/me", authHandler.Me)

		r.Get("/api/users", userHandler.List)
		r.Get("/api/users/{id}", userHandler.Get)
		r.Put("/api/users/{id}", userHandler.Update)
		r.Get("/api/users/{id}/settings", userHandler.GetSettings)
		r.Put("/api/users/{id}/settings", userHandler.UpdateSettings)

		r.Post("/api/groups", groupHandler.Create)
		r.Post("/api/groups/join", groupHandler.Join)
		r.Get("/api/groups/me", groupHandler.Me)
		r.Delete("/api/groups/me", groupHandler.Leave)

		r.Get("/api/locations", locationHandler.List)
		r.Post("/api/locations", locationHandler.Create)
		r.Get("/api/locations/{id}", locationHandler.Get)
		r.Put("/api/locations/{id}", locationHandler.Update)
		r.Delete("/api/locations/{id}", locationHandler.Delete)
		r.Post("/api/locations/{id}/vote", locationHandler.Vote)
		r.Delete("/api/locations/{id}/vote", locationHandler.RemoveVote)

		r.Get("/api/itinerary", locationHandler.GetItinerary)
		r.Post("/api/itinerary", locationHandler.AddToItinerary)
		r.Delete("/api/itinerary/{locationId}", locationHandler.RemoveFromItinerary)

		r.Get("/api/flights", flightHandler.List)
		r.Post("/api/flights", flightHandler.Create)
		r.Get("/api/flights/{id}", flightHandler.Get)
		r.Put("/api/flights/{id}", flightHandler.Update)
		r.Delete("/api/flights/{id}", flightHandler.Delete)

		r.Get("/api/shopping", shoppingHandler.List)
		r.Post("/api/shopping", shoppingHandler.Create)
		r.Get("/api/shopping/{id}", shoppingHandler.Get)
		r.Put("/api/shopping/{id}", shoppingHandler.Update)
		r.Delete("/api/shopping/{id}", shoppingHandler.Delete)

		r.Get("/api/budget", budgetHandler.List)
		r.Post("/api/budget", budgetHandler.Create)
		r.Put("/api/budget/{id}", budgetHandler.Update)

		r.Get("/api/accommodations", accommodationHandler.List)
		r.Post("/api/accommodations", accommodationHandler.Create)
		r.Get("/api/accommodations/{id}", accommodationHandler.Get)
		r.Put("/api/accommodations/{id}", accommodationHandler.Update)
		r.Delete("/api/accommodations/{id}", accommodationHandler.Delete)
	})

	addr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("Server running on http://localhost%s", addr)
	if err := http.ListenAndServe(addr, r); err != nil {
		log.Fatalf("server error: %v", err)
	}
}
