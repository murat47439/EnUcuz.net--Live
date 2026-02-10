package models

import (
	"database/sql"
	"time"
)

type Category struct {
	ID          int           `json:"id" db:"id"`
	Name        string        `json:"name" db:"name"`
	ParentID    *int          `json:"parent_id,omitempty" db:"parent_id"`
	SubCategory []Category    `json:"subCategories,omitempty"`
	DeletedAt   *sql.NullTime `json:"-" db:"deleted_at"`
	CreatedAt   time.Time     `json:"created_at,omitempty" db:"created_at"`
}
