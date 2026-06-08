package database

import (
	"database/sql"
	"fmt"
	"log"
	"strings"
)

func Migrate(db *sql.DB) {
	statements := []string{
		`CREATE TABLE IF NOT EXISTS users (
			id INT AUTO_INCREMENT PRIMARY KEY,
			name VARCHAR(255) NOT NULL,
			email VARCHAR(255) NOT NULL UNIQUE,
			password_hash VARCHAR(255) NOT NULL,
			initials VARCHAR(10) NOT NULL,
			avatar_url VARCHAR(500) DEFAULT '',
			color VARCHAR(7) DEFAULT '#6366f1',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

		`CREATE TABLE IF NOT EXISTS user_settings (
			user_id INT NOT NULL PRIMARY KEY,
			font VARCHAR(50) DEFAULT 'inter',
			contrast VARCHAR(20) DEFAULT 'normal',
			vlibras_enabled TINYINT(1) DEFAULT 0,
			keyboard_nav_enabled TINYINT(1) DEFAULT 1,
			a11y_contrast_enabled TINYINT(1) DEFAULT 0,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

		`CREATE TABLE IF NOT EXISTS locations (
			id INT AUTO_INCREMENT PRIMARY KEY,
			name VARCHAR(255) NOT NULL,
			address VARCHAR(500) DEFAULT '',
			city VARCHAR(100) DEFAULT '',
			duration_label VARCHAR(50) DEFAULT '',
			duration_minutes INT DEFAULT 0,
			description TEXT,
			image_url VARCHAR(500) DEFAULT '',
			lat DECIMAL(10,8) DEFAULT 0,
			lng DECIMAL(11,8) DEFAULT 0,
			created_by INT,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

		`CREATE TABLE IF NOT EXISTS location_tags (
			location_id INT NOT NULL,
			tag VARCHAR(100) NOT NULL,
			PRIMARY KEY (location_id, tag),
			FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

		`CREATE TABLE IF NOT EXISTS itinerary_items (
			id INT AUTO_INCREMENT PRIMARY KEY,
			location_id INT NOT NULL UNIQUE,
			added_by INT,
			added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
			FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE SET NULL
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

		`CREATE TABLE IF NOT EXISTS location_votes (
			location_id INT NOT NULL,
			user_id INT NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY (location_id, user_id),
			FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

		`CREATE TABLE IF NOT EXISTS flights (
			id INT AUTO_INCREMENT PRIMARY KEY,
			airline VARCHAR(255) NOT NULL,
			category VARCHAR(50) DEFAULT 'Econômica',
			airport VARCHAR(255) DEFAULT '',
			departure_date DATE,
			return_date DATE,
			connection_count INT DEFAULT 0,
			travel_duration VARCHAR(50) DEFAULT '',
			price DECIMAL(10,2) DEFAULT 0,
			currency VARCHAR(3) DEFAULT 'BRL',
			logo_url VARCHAR(500) DEFAULT '',
			color VARCHAR(7) DEFAULT '#6366f1',
			added_by INT,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE SET NULL
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

		`CREATE TABLE IF NOT EXISTS flight_connections (
			id INT AUTO_INCREMENT PRIMARY KEY,
			flight_id INT NOT NULL,
			order_index INT NOT NULL,
			title VARCHAR(100) DEFAULT '',
			location VARCHAR(255) DEFAULT '',
			arrival_time VARCHAR(50) DEFAULT '',
			departure_time VARCHAR(50) DEFAULT '',
			FOREIGN KEY (flight_id) REFERENCES flights(id) ON DELETE CASCADE
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

		`CREATE TABLE IF NOT EXISTS shopping_items (
			id INT AUTO_INCREMENT PRIMARY KEY,
			name VARCHAR(255) NOT NULL,
			description TEXT,
			location VARCHAR(255) DEFAULT '',
			price DECIMAL(10,2) DEFAULT 0,
			currency VARCHAR(3) DEFAULT 'JPY',
			image_url VARCHAR(500) DEFAULT '',
			added_by INT,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE SET NULL
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

		`CREATE TABLE IF NOT EXISTS shopping_item_tags (
			item_id INT NOT NULL,
			tag VARCHAR(100) NOT NULL,
			PRIMARY KEY (item_id, tag),
			FOREIGN KEY (item_id) REFERENCES shopping_items(id) ON DELETE CASCADE
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

		`CREATE TABLE IF NOT EXISTS budget_categories (
			id INT AUTO_INCREMENT PRIMARY KEY,
			name VARCHAR(100) NOT NULL,
			amount DECIMAL(10,2) DEFAULT 0,
			currency VARCHAR(3) DEFAULT 'BRL',
			percentage INT DEFAULT 0,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

		`CREATE TABLE IF NOT EXISTS accommodations (
			id INT AUTO_INCREMENT PRIMARY KEY,
			name VARCHAR(255) NOT NULL,
			type VARCHAR(50) DEFAULT 'Hotel',
			address VARCHAR(500) DEFAULT '',
			city VARCHAR(100) DEFAULT '',
			check_in DATE,
			check_out DATE,
			nights INT DEFAULT 0,
			price_per_night DECIMAL(10,2) DEFAULT 0,
			total_price DECIMAL(10,2) DEFAULT 0,
			currency VARCHAR(3) DEFAULT 'BRL',
			rating INT DEFAULT 0,
			image_url VARCHAR(500) DEFAULT '',
			notes TEXT,
			added_by INT,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE SET NULL
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

		`CREATE TABLE IF NOT EXISTS accommodation_tags (
			accommodation_id INT NOT NULL,
			tag VARCHAR(100) NOT NULL,
			PRIMARY KEY (accommodation_id, tag),
			FOREIGN KEY (accommodation_id) REFERENCES accommodations(id) ON DELETE CASCADE
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

		`CREATE TABLE IF NOT EXISTS ` + "`groups`" + ` (
			id INT AUTO_INCREMENT PRIMARY KEY,
			name VARCHAR(255) NOT NULL,
			invite_code VARCHAR(12) NOT NULL UNIQUE,
			created_by INT,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

		`CREATE TABLE IF NOT EXISTS group_members (
			group_id INT NOT NULL,
			user_id INT NOT NULL,
			role ENUM('owner','member') DEFAULT 'member',
			joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY (group_id, user_id),
			UNIQUE KEY uq_user_group (user_id),
			FOREIGN KEY (group_id) REFERENCES ` + "`groups`" + `(id) ON DELETE CASCADE,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

	}

	for _, stmt := range statements {
		if _, err := db.Exec(stmt); err != nil {
			log.Fatalf("migration error: %v\nStatement: %s", err, stmt)
		}
	}

	for _, col := range []struct{ table string }{
		{"locations"}, {"flights"}, {"shopping_items"}, {"budget_categories"}, {"accommodations"},
	} {
		addColumnIfNotExists(db, col.table, "group_id", "INT")
	}

	log.Println("Database migrations completed")
}

func addColumnIfNotExists(db *sql.DB, table, column, definition string) {
	stmt := fmt.Sprintf("ALTER TABLE %s ADD COLUMN %s %s", table, column, definition)
	if _, err := db.Exec(stmt); err != nil {
		if !strings.Contains(err.Error(), "Duplicate column name") {
			log.Fatalf("migration error: %v\nStatement: %s", err, stmt)
		}
	}
}
