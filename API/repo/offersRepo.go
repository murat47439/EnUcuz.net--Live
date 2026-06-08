package repo

import (
	"Store-Dio/models"
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/jmoiron/sqlx"
)

type OffersRepo struct {
	db *sqlx.DB
}

func NewOffersRepo(db *sqlx.DB) *OffersRepo {
	return &OffersRepo{
		db: db,
	}
}

func (of *OffersRepo) NewOffer(ctx context.Context, tx *sqlx.Tx, data *models.NewOffer) (int, error) {
	query := `INSERT INTO offers.offers(product_id,parent_id,created_by,bidder_id,seller_id,offer_price,status, created_at, expires_at) VALUES ($1, $2, $3, $4, $5, $6, $7 ,NOW(), NOW() + INTERVAL '24 hours') RETURNING id`
	var id int
	err := tx.QueryRowContext(ctx, query, data.ProductID, data.ParentID, data.CreatedBy, data.BidderID, data.SellerID, data.Price, models.OfferPending).Scan(&id)
	if err != nil {
		return 0, fmt.Errorf("Database error %w", err)
	}
	return id, nil
}
func (of *OffersRepo) ExistsOffer(ctx context.Context, tx *sqlx.Tx, productId, bidderId, sellerId int) (bool, error) {
	var exists bool
	query := `SELECT EXISTS(SELECT 1 FROM offers.offers WHERE product_id = $1 AND status = $2 AND expires_at > NOW() AND bidder_id = $3 AND seller_id = $4)`
	err := tx.QueryRowContext(ctx, query, productId, models.OfferPending, bidderId, sellerId).Scan(&exists)
	if err != nil {
		if err == sql.ErrNoRows {
			return false, nil
		}
		return false, fmt.Errorf("Database Error : %w", err)
	}
	return exists, nil
}
func (of *OffersRepo) ExistsOfferForChat(ctx context.Context, tx *sqlx.Tx, productId, bidderId, sellerId int) (bool, error) {
	var exists bool
	query := `SELECT EXISTS(SELECT 1 FROM offers.offers WHERE product_id = $1 AND status = $2 AND bidder_id = $3 AND seller_id = $4)`
	err := tx.QueryRowContext(ctx, query, productId, models.OfferAccepted, bidderId, sellerId).Scan(&exists)
	if err != nil {
		if err == sql.ErrNoRows {
			return false, nil
		}
		return false, fmt.Errorf("Database Error : %w", err)
	}
	return exists, nil
}
func (of *OffersRepo) UpdateOffer(ctx context.Context, tx *sqlx.Tx, status models.OfferStatus, id int) error {
	query := `UPDATE offers.offers SET status = $1, updated_at = NOW() WHERE id = $2 AND  status = $3 AND expires_at > NOW()`

	res, err := tx.ExecContext(ctx, query, status, id, models.OfferPending)
	if err != nil {
		return fmt.Errorf("Database error : %w", err)
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("Offers Not Found")
	}
	return nil
}
func (of *OffersRepo) RejectOtherOffers(ctx context.Context, tx *sqlx.Tx, id int) error {
	query := `UPDATE offers.offers
			SET status = $1
			WHERE product_id = (
				SELECT product_id FROM offers.offers WHERE id = $2
			)
			AND id <> $2
			AND status = $3
			AND expires_at > NOW()`
	_, err := tx.ExecContext(ctx, query, models.OfferRejected, id, models.OfferPending)
	if err != nil {
		return fmt.Errorf("Database error : %w", err)
	}
	return nil
}
func (of *OffersRepo) LockAndGetPendingOffer(ctx context.Context, tx *sqlx.Tx, offerId int) (*models.OffersModel, error) {
	query := `SELECT id, product_id, bidder_id, seller_id, offer_price, status, expires_at,created_by FROM offers.offers WHERE id = $1 AND status = $2 AND expires_at > NOW() FOR UPDATE`
	var offer models.OffersModel
	err := tx.QueryRowContext(ctx, query, offerId, models.OfferPending).Scan(&offer.ID,
		&offer.ProductID,
		&offer.BidderID,
		&offer.SellerID,
		&offer.Price,
		&offer.Status,
		&offer.ExpiresAt,
		&offer.CreatedBy)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("offer not found or already processed")
		}
		return nil, fmt.Errorf("database error: %w", err)
	}
	return &offer, nil
}

//	func (of *OffersRepo) GetOffer(ctx context.Context, offerId int, users int) (*models.OffersModel, error) {
//		query := `SELECT id, product_id, bidder_id, seller_id, offer_price, status, expires_at FROM offers WHERE (seller_id = $1 OR bidder_id = $1) AND id = $2`
//		var offer models.OffersModel
//		err := of.db.GetContext(ctx, &offer, query, users, offerId)
//		if err != nil {
//			if err == sql.ErrNoRows {
//				return nil, fmt.Errorf("Offer Not Found")
//			}
//			return nil, fmt.Errorf("Database Error %w", err)
//		}
//		return &offer, nil
//	}
func (of *OffersRepo) GetOffersBySeller(ctx context.Context, page, seller_id int) ([]*models.OffersModel, error) {
	limit := 50
	query := `SELECT o.id, o.product_id, o.bidder_id, o.seller_id, o.offer_price, o.status, o.expires_at, o.created_by, o.created_at,
		seller.name  AS seller_name,
		bidder.name  AS bidder_name

		FROM offers.offers o
		LEFT JOIN users.users seller ON seller.id = o.seller_id
		LEFT JOIN users.users bidder ON bidder.id = o.bidder_id

		WHERE o.seller_id = $1
		ORDER BY o.created_at DESC
		LIMIT $2 OFFSET $3;`
	offset := (page - 1) * 50
	var offers []*models.OffersModel
	rows, err := of.db.QueryxContext(ctx, query, seller_id, limit, offset)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("Offers Not Found")
		}
		return nil, fmt.Errorf("Database error ", err.Error())
	}
	defer rows.Close()
	for rows.Next() {
		var o models.OffersModel

		if err = rows.StructScan(&o); err != nil {
			return nil, fmt.Errorf("Scan error: %s", err.Error())
		}
		offers = append(offers, &o)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("Rows error: %s", err.Error())
	}

	return offers, nil

}
func (of *OffersRepo) GetOffersByBidder(ctx context.Context, page, bidder int) ([]*models.OffersModel, error) {
	limit := 50
	query := `SELECT o.id, o.product_id, o.bidder_id, o.seller_id, o.offer_price, o.status, o.expires_at, o.created_by, o.created_at,
 	seller.name AS seller_name,
    bidder.name AS bidder_name

	FROM offers.offers o
	LEFT JOIN users.users seller ON seller.id = o.seller_id
	LEFT JOIN users.users bidder ON bidder.id = o.bidder_id

	WHERE o.bidder_id = $1
	ORDER BY o.created_at DESC
	LIMIT $2 OFFSET $3;
`
	offset := (page - 1) * 50
	var offers []*models.OffersModel
	rows, err := of.db.QueryxContext(ctx, query, bidder, limit, offset)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("Offers Not Found")
		}
		return nil, fmt.Errorf("Database error ", err.Error())
	}
	defer rows.Close()
	for rows.Next() {
		var o models.OffersModel

		if err = rows.StructScan(&o); err != nil {
			return nil, fmt.Errorf("Scan error: %s", err.Error())
		}
		offers = append(offers, &o)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("Rows error: %s", err.Error())
	}

	return offers, nil

}
func (of *OffersRepo) ExpireOffers(ctx context.Context) (int64, error) {
	query := `UPDATE offers.offers SET status = $1 WHERE status = $2 AND expires_at < NOW()`

	rows, err := of.db.ExecContext(ctx, query, models.OfferExpired, models.OfferPending)
	if err != nil {
		return 0, fmt.Errorf("Database error : %w ", err)
	}
	count, err := rows.RowsAffected()
	if err != nil {
		return 0, err
	}
	return count, nil
}
