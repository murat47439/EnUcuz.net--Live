package models

import (
	"database/sql"
	"time"
)

type Favori struct {
	ID        int           `json:"id" db:"id"`
	UserID    int           `json:"user_id" db:"user_id"`
	ProductID int           `json:"product_id" db:"product_id"`
	Product   *Product      `json:"product"`
	CreatedAt time.Time     `json:"created_at,omitempty" db:"created_at"`
	DeletedAt *sql.NullTime `json:"-" db:"deleted_at"`
}
