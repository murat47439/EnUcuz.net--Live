package models

import (
	"database/sql"
	"time"
)

type Brand struct {
	ID        int           `json:"id" db:"id"`
	Name      string        `json:"name" db:"name"`
	DeletedAt *sql.NullTime `json:"-" db:"deleted_at"`
	CreatedAt time.Time     `json:"created_at" db:"created_at"`
}
