package repository

import (
	"database/sql"

	"github.com/rafhaeliggor/jpproject/backend/internal/models"
)

type FlightRepo struct{ db *sql.DB }

func NewFlightRepo(db *sql.DB) *FlightRepo { return &FlightRepo{db: db} }

func (r *FlightRepo) Create(f *models.Flight, groupID int) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	res, err := tx.Exec(
		`INSERT INTO flights (airline, category, airport, departure_date, return_date, connection_count, travel_duration, price, currency, logo_url, color, added_by, group_id)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		f.Airline, f.Category, f.Airport, nullableDate(f.DepartureDate), nullableDate(f.ReturnDate),
		f.ConnectionCount, f.TravelDuration, f.Price, f.Currency,
		f.LogoURL, f.Color, nullableInt(f.AddedBy), nullableInt(groupID),
	)
	if err != nil {
		return err
	}
	id, _ := res.LastInsertId()
	f.ID = int(id)

	for _, conn := range f.Connections {
		if _, err := tx.Exec(
			`INSERT INTO flight_connections (flight_id, order_index, title, location, arrival_time, departure_time)
			 VALUES (?, ?, ?, ?, ?, ?)`,
			f.ID, conn.OrderIndex, conn.Title, conn.Location, conn.ArrivalTime, conn.DepartureTime,
		); err != nil {
			return err
		}
	}
	return tx.Commit()
}

func (r *FlightRepo) List(groupID int) ([]*models.Flight, error) {
	if groupID == 0 {
		return nil, nil
	}
	rows, err := r.db.Query(
		`SELECT id, airline, category, airport, COALESCE(DATE_FORMAT(departure_date,'%Y-%m-%d'),''),
		        COALESCE(DATE_FORMAT(return_date,'%Y-%m-%d'),''),
		        connection_count, travel_duration, price, currency, logo_url, color, COALESCE(added_by,0), created_at
		 FROM flights WHERE group_id=? ORDER BY id`,
		groupID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var flights []*models.Flight
	for rows.Next() {
		f := &models.Flight{}
		if err := rows.Scan(&f.ID, &f.Airline, &f.Category, &f.Airport,
			&f.DepartureDate, &f.ReturnDate, &f.ConnectionCount, &f.TravelDuration,
			&f.Price, &f.Currency, &f.LogoURL, &f.Color, &f.AddedBy, &f.CreatedAt); err != nil {
			return nil, err
		}
		flights = append(flights, f)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	for _, f := range flights {
		f.Connections, _ = r.getConnections(f.ID)
	}
	return flights, nil
}

func (r *FlightRepo) FindByID(id int) (*models.Flight, error) {
	f := &models.Flight{}
	err := r.db.QueryRow(
		`SELECT id, airline, category, airport, COALESCE(DATE_FORMAT(departure_date,'%Y-%m-%d'),''),
		        COALESCE(DATE_FORMAT(return_date,'%Y-%m-%d'),''),
		        connection_count, travel_duration, price, currency, logo_url, color, COALESCE(added_by,0), created_at
		 FROM flights WHERE id=?`, id,
	).Scan(&f.ID, &f.Airline, &f.Category, &f.Airport,
		&f.DepartureDate, &f.ReturnDate, &f.ConnectionCount, &f.TravelDuration,
		&f.Price, &f.Currency, &f.LogoURL, &f.Color, &f.AddedBy, &f.CreatedAt)
	if err != nil {
		return nil, err
	}
	f.Connections, _ = r.getConnections(f.ID)
	return f, nil
}

func (r *FlightRepo) Update(f *models.Flight) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	_, err = tx.Exec(
		`UPDATE flights SET airline=?, category=?, airport=?, departure_date=?, return_date=?,
		 connection_count=?, travel_duration=?, price=?, currency=?, logo_url=?, color=? WHERE id=?`,
		f.Airline, f.Category, f.Airport, nullableDate(f.DepartureDate), nullableDate(f.ReturnDate),
		f.ConnectionCount, f.TravelDuration, f.Price, f.Currency, f.LogoURL, f.Color, f.ID,
	)
	if err != nil {
		return err
	}

	if _, err = tx.Exec(`DELETE FROM flight_connections WHERE flight_id=?`, f.ID); err != nil {
		return err
	}
	for _, conn := range f.Connections {
		if _, err := tx.Exec(
			`INSERT INTO flight_connections (flight_id, order_index, title, location, arrival_time, departure_time)
			 VALUES (?, ?, ?, ?, ?, ?)`,
			f.ID, conn.OrderIndex, conn.Title, conn.Location, conn.ArrivalTime, conn.DepartureTime,
		); err != nil {
			return err
		}
	}
	return tx.Commit()
}

func (r *FlightRepo) Delete(id int) error {
	_, err := r.db.Exec(`DELETE FROM flights WHERE id=?`, id)
	return err
}

func (r *FlightRepo) getConnections(flightID int) ([]models.FlightConnection, error) {
	rows, err := r.db.Query(
		`SELECT id, flight_id, order_index, title, location, arrival_time, departure_time
		 FROM flight_connections WHERE flight_id=? ORDER BY order_index`, flightID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var conns []models.FlightConnection
	for rows.Next() {
		c := models.FlightConnection{}
		if err := rows.Scan(&c.ID, &c.FlightID, &c.OrderIndex, &c.Title, &c.Location, &c.ArrivalTime, &c.DepartureTime); err != nil {
			return nil, err
		}
		conns = append(conns, c)
	}
	return conns, rows.Err()
}
