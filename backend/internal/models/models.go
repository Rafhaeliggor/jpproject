package models

import "time"

type User struct {
	ID           int       `json:"id"`
	Name         string    `json:"name"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	Initials     string    `json:"initials"`
	AvatarURL    string    `json:"avatar_url"`
	Color        string    `json:"color"`
	CreatedAt    time.Time `json:"created_at"`
}

type UserSettings struct {
	UserID               int    `json:"user_id"`
	Font                 string `json:"font"`
	Contrast             string `json:"contrast"`
	VLibrasEnabled       bool   `json:"vlibras_enabled"`
	KeyboardNavEnabled   bool   `json:"keyboard_nav_enabled"`
	A11yContrastEnabled  bool   `json:"a11y_contrast_enabled"`
}

type Location struct {
	ID              int       `json:"id"`
	Name            string    `json:"name"`
	Address         string    `json:"address"`
	City            string    `json:"city"`
	DurationLabel   string    `json:"duration_label"`
	DurationMinutes int       `json:"duration_minutes"`
	Description     string    `json:"description"`
	ImageURL        string    `json:"image_url"`
	Lat             float64   `json:"lat"`
	Lng             float64   `json:"lng"`
	Tags            []string  `json:"tags"`
	VoterIDs        []int     `json:"voter_ids"`
	CreatedBy       int       `json:"created_by"`
	CreatedAt       time.Time `json:"created_at"`
	InItinerary     bool      `json:"in_itinerary"`
}

type ItineraryItem struct {
	ID         int       `json:"id"`
	LocationID int       `json:"location_id"`
	AddedBy    int       `json:"added_by"`
	AddedAt    time.Time `json:"added_at"`
	Location   *Location `json:"location,omitempty"`
}

type FlightConnection struct {
	ID            int    `json:"id"`
	FlightID      int    `json:"flight_id"`
	OrderIndex    int    `json:"order_index"`
	Title         string `json:"title"`
	Location      string `json:"location"`
	ArrivalTime   string `json:"arrival_time"`
	DepartureTime string `json:"departure_time"`
}

type Flight struct {
	ID              int                `json:"id"`
	Airline         string             `json:"airline"`
	Category        string             `json:"category"`
	Airport         string             `json:"airport"`
	DepartureDate   string             `json:"departure_date"`
	ReturnDate      string             `json:"return_date"`
	ConnectionCount int                `json:"connection_count"`
	TravelDuration  string             `json:"travel_duration"`
	Price           float64            `json:"price"`
	Currency        string             `json:"currency"`
	LogoURL         string             `json:"logo_url"`
	Color           string             `json:"color"`
	AddedBy         int                `json:"added_by"`
	Connections     []FlightConnection `json:"connections"`
	CreatedAt       time.Time          `json:"created_at"`
}

type ShoppingItem struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Location    string    `json:"location"`
	Price       float64   `json:"price"`
	Currency    string    `json:"currency"`
	ImageURL    string    `json:"image_url"`
	Tags        []string  `json:"tags"`
	AddedBy     int       `json:"added_by"`
	CreatedAt   time.Time `json:"created_at"`
}

type BudgetCategory struct {
	ID         int     `json:"id"`
	Name       string  `json:"name"`
	Amount     float64 `json:"amount"`
	Currency   string  `json:"currency"`
	Percentage int     `json:"percentage"`
}

type Accommodation struct {
	ID            int       `json:"id"`
	Name          string    `json:"name"`
	Type          string    `json:"type"`
	Address       string    `json:"address"`
	City          string    `json:"city"`
	CheckIn       string    `json:"check_in"`
	CheckOut      string    `json:"check_out"`
	Nights        int       `json:"nights"`
	PricePerNight float64   `json:"price_per_night"`
	TotalPrice    float64   `json:"total_price"`
	Currency      string    `json:"currency"`
	Rating        int       `json:"rating"`
	ImageURL      string    `json:"image_url"`
	Notes         string    `json:"notes"`
	Tags          []string  `json:"tags"`
	AddedBy       int       `json:"added_by"`
	CreatedAt     time.Time `json:"created_at"`
}

type RegisterRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AuthResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

type Group struct {
	ID         int    `json:"id"`
	Name       string `json:"name"`
	InviteCode string `json:"invite_code"`
	CreatedBy  int    `json:"created_by"`
	CreatedAt  string `json:"created_at"`
}

type GroupMember struct {
	GroupID  int    `json:"group_id"`
	UserID   int    `json:"user_id"`
	Role     string `json:"role"`
	JoinedAt string `json:"joined_at"`
}

type GroupInfo struct {
	Group   Group  `json:"group"`
	Members []User `json:"members"`
}
