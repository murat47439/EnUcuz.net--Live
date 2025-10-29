package models

import "database/sql"

type User struct {
	ID        int           `db:"id"  json:"id,omitempty"`
	Email     string        `db:"email" json:"email"`
	Phone     string        `db:"phone" json:"phone"`
	Name      string        `db:"name" json:"name"`
	Surname   string        `db:"surname" json:"surname"`
	Gender    int           `db:"gender" json:"gender,omitempty"`
	Role      int           `db:"role" json:"-"`
	Password  string        `db:"password" json:"password,omitempty"`
	DeletedAt *sql.NullTime `json:"-" db:"deleted_at"`
}
