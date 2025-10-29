package models

import "database/sql"

type Attribute struct {
	ID        int          `json:"id,omitempty" db:"id"`
	Name      string       `json:"name" db:"name"`
	DeletedAt sql.NullTime `json:"deleted_at" db:"deleted_at"`
}
type CategoryAttribute struct {
	ID            int          `json:"id,omitempty" db:"id"`
	CategoryID    int          `json:"category_id" db:"category_id"`
	CategoryName  string       `json:"category_name,omitempty" db:"category_name"`
	AttributeID   int          `json:"attribute_id" db:"attribute_id"`
	AttributeName string       `json:"attribute_name,omitempty" db:"attribute_name"`
	AllowCustom   bool         `json:"allow_custom" db:"allow_custom"`
	Required      bool         `json:"required" db:"required"`
	Varianter     bool         `json:"varianter" db:"varianter"`
	Slicer        bool         `json:"slicer" db:"slicer"`
	DeletedAt     sql.NullTime `json:"-" db:"deleted_at"`
}
type ProductAttribute struct {
	ID            int          `json:"id,omitempty" db:"id"`
	AttributeID   int          `json:"attribute_id" db:"attribute_id"`
	AttributeName string       `json:"attribute_name,omitempty" db:"attribute_name"`
	ProductID     int          `json:"product_id" db:"product_id"`
	Value         string       `json:"value" db:"value"`
	DeletedAt     sql.NullTime `json:"-" db:"deleted_at"`
}
