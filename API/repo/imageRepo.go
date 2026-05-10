package repo

import (
	"context"

	"github.com/jmoiron/sqlx"
)

type ImageRepo struct {
	db *sqlx.DB
}

func NewImageRepo(db *sqlx.DB) *ImageRepo {
	return &ImageRepo{
		db: db,
	}
}

func (ir *ImageRepo) AuthDelete(ctx context.Context, userID int, imageID string) (bool, error) {
	query := `SELECT EXISTS(SELECT 1 FROM products.product_images WHERE user_id = $1 AND product_url = $2)`
	var exists bool
	err := ir.db.QueryRowContext(ctx, query, userID, imageID).Scan(&exists)
	if err != nil {
		return false, err
	}
	return exists, nil
}
