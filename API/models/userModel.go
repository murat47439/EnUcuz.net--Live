package models

import (
	"database/sql"
)

type User struct {
	ID          int           `db:"id"  json:"id,omitempty"`
	Email       string        `db:"email" json:"email"`
	Phone       string        `db:"phone" json:"phone"`
	Name        string        `db:"name" json:"name"`
	Surname     string        `db:"surname" json:"surname"`
	Gender      int           `db:"gender" json:"gender,omitempty"`
	Role        Role          `db:"role" json:"role"`
	Verified    int           `db:"verified" json:"verified"`
	ApplicantID string        `db:"sumsub_applicant_id" json:"applicantId,omitempty"`
	Password    string        `db:"password" json:"password,omitempty"`
	DeletedAt   *sql.NullTime `json:"-" db:"deleted_at"`
}

type NewUser struct {
	Email     string `json:"email"`
	Phone     string `json:"phone"`
	Name      string `json:"name"`
	Surname   string `json:"surname"`
	Gender    int    `json:"gender,omitempty"`
	Password  string `json:"password,omitempty"`
	Kvkk      bool   `json:"kvkk,omitempty" `
	Contact   bool   `json:"contact,omitempty"`
	Role      Role   `db:"role" json:"-"`
	IpAddress string ``
	UserAgent string ``
}

type Role int16

const (
	UserRole Role = iota
	AdminRole
	SellerRole
)
