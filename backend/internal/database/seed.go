package database

import (
	"database/sql"
	"log"

	"github.com/rafhaeliggor/jpproject/backend/internal/models"
	"github.com/rafhaeliggor/jpproject/backend/internal/repository"
	"golang.org/x/crypto/bcrypt"
)

func Seed(db *sql.DB) {
	userRepo := repository.NewUserRepo(db)
	locationRepo := repository.NewLocationRepo(db)
	flightRepo := repository.NewFlightRepo(db)
	shoppingRepo := repository.NewShoppingRepo(db)
	budgetRepo := repository.NewBudgetRepo(db)

	accommodationRepo := repository.NewAccommodationRepo(db)

	seedUsers(userRepo)
	_ = locationRepo
	_ = flightRepo
	_ = shoppingRepo
	_ = budgetRepo
	_ = accommodationRepo

	log.Println("Seed data loaded")
}

func seedUsers(r *repository.UserRepo) {
	users := []struct {
		name, email, color string
	}{
		{"Marcello Catchau", "marcello@jpproject.com", "#6366f1"},
		{"Iggor Rafhael", "iggor@jpproject.com", "#ec4899"},
		{"Livia No-Gueira", "livia@jpproject.com", "#14b8a6"},
		{"Paulo Fighter", "paulo@jpproject.com", "#f59e0b"},
		{"Beatriz", "bia@jpproject.com", "#10b981"},
	}

	hash, _ := bcrypt.GenerateFromPassword([]byte("senha123"), bcrypt.DefaultCost)

	for _, u := range users {
		exists, _ := r.EmailExists(u.email)
		if exists {
			continue
		}
		user := &models.User{
			Name:     u.name,
			Email:    u.email,
			Initials: initials2(u.name),
			Color:    u.color,
		}
		if err := r.Create(user, string(hash)); err != nil {
			log.Printf("seed user error: %v", err)
		}
	}
}

func seedLocations(r *repository.LocationRepo) {
	locs, _ := r.List(0)
	if len(locs) > 0 {
		return
	}

	locations := []models.Location{
		{
			Name:            "Templo Sensoji",
			Address:         "2 Chome-3-1 Asakusa, Taito City, Tokyo",
			City:            "Tokyo",
			DurationLabel:   "2h",
			DurationMinutes: 120,
			Description:     "O Sensoji é o templo budista mais antigo de Tokyo, fundado em 628 d.C. É um dos mais visitados do Japão, com mais de 30 milhões de visitantes por ano.",
			ImageURL:        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Sensoji_Thunder_Gate.jpg/1280px-Sensoji_Thunder_Gate.jpg",
			Lat:             35.7147651,
			Lng:             139.7966553,
			Tags:            []string{"Templo", "História", "Tokyo", "Budismo"},
		},
		{
			Name:            "Torii de Miyajima",
			Address:         "Miyajima-cho, Hatsukaichi, Hiroshima",
			City:            "Hiroshima",
			DurationLabel:   "3h",
			DurationMinutes: 180,
			Description:     "O Torii flutuante do Santuário Itsukushima é um dos ícones mais reconhecidos do Japão. Construído sobre o mar, cria a ilusão de flutuar durante a maré alta.",
			ImageURL:        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Itsukushima_torii_distance.jpg/1280px-Itsukushima_torii_distance.jpg",
			Lat:             34.2958,
			Lng:             132.3194,
			Tags:            []string{"Santuário", "História", "Hiroshima", "Natureza"},
		},
	}

	for i := range locations {
		if err := r.Create(&locations[i], 0); err != nil {
			log.Printf("seed location error: %v", err)
		}
	}
}

func seedFlights(r *repository.FlightRepo) {
	flights, _ := r.List(0)
	if len(flights) > 0 {
		return
	}

	data := []models.Flight{
		{
			Airline:         "TAP Air Portugal",
			Category:        "Executiva",
			Airport:         "Aeroporto de Lisboa (LIS)",
			DepartureDate:   "2027-02-10",
			ReturnDate:      "2027-02-24",
			ConnectionCount: 1,
			TravelDuration:  "22h30",
			Price:           12030,
			Currency:        "BRL",
			LogoURL:         "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/TAP_Air_Portugal_logo.svg/200px-TAP_Air_Portugal_logo.svg.png",
			Color:           "#1B7A4E",
			Connections: []models.FlightConnection{
				{OrderIndex: 1, Title: "Conexão 1", Location: "Lisboa, Portugal (LIS)", ArrivalTime: "06:30", DepartureTime: "08:00"},
				{OrderIndex: 2, Title: "Conexão 2", Location: "Tóquio, Japão (NRT)", ArrivalTime: "10:30", DepartureTime: ""},
			},
		},
	}

	for i := range data {
		if err := r.Create(&data[i], 0); err != nil {
			log.Printf("seed flight error: %v", err)
		}
	}
}

func seedShopping(r *repository.ShoppingRepo) {
	items, _ := r.List(0, "")
	if len(items) > 0 {
		return
	}

	data := []models.ShoppingItem{
		{Name: "Kit Kat Matcha", Description: "Chocolate branco com sabor de chá verde matcha, exclusivo japonês.", Location: "Lojas de conveniência (7-Eleven, FamilyMart)", Price: 800, Currency: "JPY", ImageURL: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Kit_Kat_matcha_2010.jpg/320px-Kit_Kat_matcha_2010.jpg", Tags: []string{"Alimentação", "Presente"}},
	}

	for i := range data {
		if err := r.Create(&data[i], 0); err != nil {
			log.Printf("seed shopping error: %v", err)
		}
	}
}

func seedBudget(r *repository.BudgetRepo) {
	has, _ := r.HasAny(0)
	if has {
		return
	}

	categories := []models.BudgetCategory{
		{Name: "Passagem", Amount: 12030, Currency: "BRL", Percentage: 12},
		{Name: "Alimentação", Amount: 5000, Currency: "BRL", Percentage: 38},
	}

	for i := range categories {
		if err := r.Create(&categories[i], 0); err != nil {
			log.Printf("seed budget error: %v", err)
		}
	}
}

func initials2(name string) string {
	parts := splitWords(name)
	result := ""
	for i, p := range parts {
		if i >= 2 {
			break
		}
		if len(p) > 0 {
			result += string([]rune(p)[0])
		}
	}
	if result == "" {
		return "?"
	}
	return result
}

func seedAccommodations(r *repository.AccommodationRepo) {
	has, _ := r.HasAny(0)
	if has {
		return
	}

	data := []models.Accommodation{
		{
			Name: "APA Hotel Shinjuku Kabukicho", Type: "Hotel",
			Address: "2-18-8 Kabukicho, Shinjuku", City: "Tokyo",
			CheckIn: "2027-02-10", CheckOut: "2027-02-14",
			PricePerNight: 380, Currency: "BRL", Rating: 4,
			Notes: "Próximo à estação Shinjuku. Check-in a partir das 15h.",
			Tags:  []string{"Central", "Metrô"},
		},
	}

	for i := range data {
		if err := r.Create(&data[i], 0); err != nil {
			log.Printf("seed accommodation error: %v", err)
		}
	}
}

func splitWords(s string) []string {
	var words []string
	word := ""
	for _, c := range s {
		if c == ' ' {
			if word != "" {
				words = append(words, word)
				word = ""
			}
		} else {
			word += string(c)
		}
	}
	if word != "" {
		words = append(words, word)
	}
	return words
}
