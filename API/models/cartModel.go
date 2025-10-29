package models

import "github.com/shopspring/decimal"

type Cart struct {
	ID     int `json:"id" db:"id"`
	UserID int `json:"user_id" db:"user_id"`
	Status int `json:"status,omitempty" db:"status"`
}
type CartDetail struct {
	ID        int             `json:"id" db:"id"`
	CartID    int             `json:"cart_id" db:"cart_id"`
	ProductID int             `json:"product_id" db:"product_id"`
	Product   *Product        `json:"product,omitempty"`
	Quantity  int             `json:"quantity" db:"quantity"`
	Price     decimal.Decimal `json:"price" db:"price"`
	Discount  decimal.Decimal `json:"discount" db:"discount"`
	Total     decimal.Decimal `json:"total" db:"total"`
	Status    int             `json:"status,omitempty" db:"status"`
}
