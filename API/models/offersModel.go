package models

import (
	"database/sql"
	"time"
)

type OffersModel struct {
	ID        int           `json:"id" db:"id"`
	ProductID int           `json:"productId" db:"product_id"`
	BidderID  int           `json:"bidderId" db:"bidder_id"`
	SellerID  int           `json:"sellerId" db:"seller_id"`
	Price     int64         `json:"price" db:"offer_price"`
	ParentID  int           `json:"parentId" db:"parent_id"`
	CreatedBy int           `json:"createdBy" db:"created_by"`
	Status    int           `json:"status" db:"status"`
	CreatedAt time.Time     `json:"createdAt" db:"created_at"`
	UpdatedAt *sql.NullTime `json:"updatedAt" db:"updated_at"`
	ExpiresAt time.Time     `json:"expiresAt" db:"expires_at"`
}
type NewOffer struct {
	ProductID int `json:"productId" db:"product_id"`
	BidderID  int ` db:"bidder_id"`
	SellerID  int ` db:"seller_id"`
	ParentID  int `db:"parent_id"`
	CreatedBy int ` db:"created_by"`

	Price int64 `json:"price" db:"price"`
}
type UpdateOffer struct {
	ID     int
	Action string `json:"action"`
}
type CounterOffer struct {
	Price     int64 `json:"price" db:"price"`
	CreatedBy int   ` db:"created_by"`
}
