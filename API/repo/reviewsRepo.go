package repo

import (
	"Store-Dio/models"
	"database/sql"
	"fmt"

	"github.com/jmoiron/sqlx"
)

type ReviewsRepo struct {
	db *sqlx.DB
}

func NewReviewRepo(db *sqlx.DB) *ReviewsRepo {
	return &ReviewsRepo{
		db: db,
	}
}
func (rr *ReviewsRepo) AddReview(data *models.Review) error {

	exists, err := rr.ExistsReview(data.UserID, data.ProductID)

	if err != nil {
		return err
	}

	if exists {
		return fmt.Errorf("Review is exists")
	}

	query := `INSERT INTO public.reviews (user_id,product_id,content,rating,created_at, updated_at) VALUES($1, $2, $3, $4, NOW(), NOW())`

	_, err = rr.db.Exec(query, data.UserID, data.ProductID, data.Content, data.Rating)

	if err != nil {
		return fmt.Errorf("Database error : %s", err.Error())
	}
	return nil
}
func (rr *ReviewsRepo) UpdateReview(data *models.Review) error {
	exists, err := rr.ExistsReview(data.UserID, data.ProductID)

	if err != nil {
		return err
	}
	if !exists {
		return fmt.Errorf("Review not found")
	}

	query := `UPDATE public.reviews SET content = $1, rating = $2 ,status = $3 ,updated_at = NOW() WHERE id = $4 AND user_id = $5 AND deleted_at IS NULL`

	res, err := rr.db.Exec(query, data.Content, data.Rating, data.Status, data.ID, data.UserID)
	if err != nil {
		return fmt.Errorf("Database error : %s", err.Error())
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("No review updated")
	}
	return nil
}
func (rr *ReviewsRepo) RemoveReview(id, userID int) error {
	review, err := rr.GetReview(id)
	if err != nil {
		return err
	}
	if review.UserID != userID {
		return fmt.Errorf("Error")
	}

	query := `UPDATE public.reviews SET deleted_at = NOW() WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`

	_, err = rr.db.Exec(query, id, userID)

	if err != nil {
		return fmt.Errorf("Database error %s", err.Error())
	}
	return nil
}
func (rr *ReviewsRepo) GetReview(id int) (*models.Review, error) {
	if id == 0 {
		return nil, fmt.Errorf("Invalid data")
	}
	query := `SELECT * FROM public.reviews WHERE id = $1 AND deleted_at IS NULL`

	var review models.Review

	err := rr.db.Get(&review, query, id)

	if err != nil {
		return nil, fmt.Errorf("Database error : %s", err.Error())
	}
	return &review, nil
}
func (rr *ReviewsRepo) GetReviews(page, prodID int) ([]*models.Review, error) {
	query := `SELECT id,user_id,product_id,content,rating, created_at, updated_at FROM public.reviews WHERE product_id = $1 AND deleted_at IS NULL LIMIT $2 OFFSET $3`
	if page < 1 {
		page = 1
	}
	offset := (page - 1) * 50
	var reviews []*models.Review

	rows, err := rr.db.Queryx(query, prodID, 50, offset)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("Reviews not found")
		}
		return nil, fmt.Errorf("Database error : %s", err.Error())
	}
	for rows.Next() {
		var review models.Review

		if err := rows.StructScan(&review); err != nil {
			return nil, fmt.Errorf("Rows error : %s", err.Error())
		}
		reviews = append(reviews, &review)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("Rows error : %s", err.Error())
	}
	return reviews, nil
}
func (rr *ReviewsRepo) GetUserReviews(user_id int) ([]*models.Review, error) {
	if user_id == 0 {
		return nil, fmt.Errorf("Invalid data")
	}
	var reviews []*models.Review
	query := `SELECT id,user_id, product_id, content, rating, status, created_at FROM public.reviews WHERE user_id = $1 AND deleted_at IS NULL`

	rows, err := rr.db.Queryx(query, user_id)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("No reviews")
		}
		return nil, fmt.Errorf("Database error : %s", err.Error())
	}
	for rows.Next() {
		var review models.Review

		if err := rows.StructScan(&review); err != nil {
			return nil, fmt.Errorf("Rows error : %s", err.Error())
		}
		reviews = append(reviews, &review)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("Rows error : %s", err.Error())
	}
	return reviews, nil
}
func (rr *ReviewsRepo) ExistsReview(userID int, prodID int) (bool, error) {
	if prodID == 0 || userID == 0 {
		return false, fmt.Errorf("Invalid data")
	}
	var exists bool
	query := `SELECT EXISTS(SELECT 1 FROM public.products WHERE id=$1 AND deleted_at IS NULL)`

	err := rr.db.Get(&exists, query, prodID)

	if err != nil {
		return false, fmt.Errorf("Database error : %s", err.Error())
	}
	if !exists {
		return false, fmt.Errorf("Product not found")
	}

	query = `SELECT EXISTS(
    SELECT 1 FROM public.reviews 
    WHERE product_id=$1 AND user_id=$2 AND deleted_at IS NULL)`

	err = rr.db.Get(&exists, query, prodID, userID)
	if err != nil {
		return false, fmt.Errorf("Database error : %s", err.Error())
	}
	return exists, nil
}
func (rr *ReviewsRepo) ReviewStatusUpdate(id, status int) error {
	query := `UPDATE public.reviews SET status=$1 WHERE id = $2 AND deleted_at IS NULL`

	_, err := rr.db.Exec(query, status, id)

	if err != nil {
		return fmt.Errorf("Database error : %s", err.Error())
	}
	return nil
}
