package models

import (
	"database/sql"
)

type Product struct {
	ID          int                `json:"id" db:"id"`
	Name        string             `json:"name" db:"name"`
	Description string             `json:"description,omitempty" db:"description"`
	Stock       int                `json:"stock,omitempty" db:"stock"`
	Price       float64            `json:"price" db:"price"`
	Brand       *string            `json:"brand_name,omitempty" db:"brand_name"`
	BrandID     int                `json:"brand_id,omitempty" db:"brand_id"`
	ImageUrl    string             `json:"image_url" db:"image_url"`
	ImageURLs   []string           `json:"image_urls" db:"image_urls"`
	SellerID    int                `json:"seller_id" db:"seller_id"`
	SellerName  string             `json:"seller_name,omitempty" db:"seller_name"`
	SellerPhone string             `json:"seller_phone,omitempty" db:"seller_phone"`
	CategoryId  int                `json:"category_id,omitempty" db:"category_id"`
	Category    *string            `json:"category_name,omitempty" db:"category_name"`
	Status      *string            `json:"status,omitempty" db:"status"`
	CreatedAt   sql.NullTime       `json:"created_at" db:"created_at"`
	UpdatedAt   sql.NullTime       `json:"updated_at" db:"updated_at"`
	DeletedAt   sql.NullTime       `json:"-" db:"deleted_at"`
	Attributes  []ProductAttribute `json:"attributes,omitempty" db:"attributes"`
}
type NewProduct struct {
	ID          int
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Stock       int     `json:"stock"`
	Price       float64 `json:"price"`
	BrandID     int     `json:"brand_id"`
	CategoryID  int     `json:"category_id"`
	SellerID    int
	ImageURLs   []string  `json:"image_url"`
	Features    []Feature `json:"features"`
}
type UpdProduct struct {
	ID          int
	Name        string `json:"name"`
	Description string `json:"description"`
	Stock       int    `json:"stock"`
	PriceGet    string `json:"price"`
	Price       float64
}
type Feature struct {
	Key   *FeatureKey `json:"key"`
	Value string      `json:"value"`
}

type FeatureKey struct {
	Label string `json:"label"`
	Value int    `json:"value"`
}
