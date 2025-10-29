package models

type Store struct {
	ID          int    `json:"id" db:"id"`
	OwnerID     int    `json:"user_id,omitempty" db:"user_id"`
	Owner       *User  `json:"owner"`
	Name        string `json:"name" db:"name"`
	Slug        string `json:"slug" db:"slug"`
	Description string `json:"description,omitempty" db:"description"`
	Email       string `json:"email,omitempty" db:"email"`
	Phone       int    `json:"phone,omitempty" db:"phone"`
	Status      int    `json:"status,omitempty" db:"status"`
}
