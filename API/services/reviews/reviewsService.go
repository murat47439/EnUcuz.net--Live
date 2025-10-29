package reviews

import (
	"Store-Dio/models"
	"Store-Dio/repo"
	"fmt"
)

type ReviewService struct {
	ReviewRepo *repo.ReviewsRepo
}

func NewReviewService(repo *repo.ReviewsRepo) *ReviewService {
	return &ReviewService{
		ReviewRepo: repo,
	}
}
func (rs *ReviewService) AddReview(data *models.Review) error {
	if data.ProductID == 0 || data.UserID == 0 || data.Content == "" {
		return fmt.Errorf("Invalid data")
	}
	err := rs.ReviewRepo.AddReview(data)
	if err != nil {
		return err
	}
	return nil
}
func (rs *ReviewService) UpdateReview(data *models.Review) error {
	if data.ProductID == 0 || data.UserID == 0 || data.Content == "" || data.ID == 0 {
		return fmt.Errorf("Invalid data")
	}
	err := rs.ReviewRepo.UpdateReview(data)

	if err != nil {
		return err
	}
	return nil
}
func (rs *ReviewService) RemoveReview(id, userID int) error {
	if id == 0 || userID == 0 {
		return fmt.Errorf("Invalid data")
	}
	err := rs.ReviewRepo.RemoveReview(id, userID)
	if err != nil {
		return err
	}
	return nil
}
func (rs *ReviewService) GetReview(id, userRole, userID int) (*models.Review, error) {
	if id == 0 || userID == 0 {
		return nil, fmt.Errorf("Invalid data")
	}
	review, err := rs.ReviewRepo.GetReview(id)

	if err != nil {
		return nil, err
	}
	if userRole != 1 {
		if review.UserID != userID {
			return nil, fmt.Errorf("Error")
		}
	}
	return review, nil
}
func (rs *ReviewService) GetReviews(page, prodID int) ([]*models.Review, error) {
	if page < 1 {
		page = 1
	}
	if prodID == 0 {
		return nil, fmt.Errorf("Invalid data")
	}
	reviews, err := rs.ReviewRepo.GetReviews(page, prodID)

	if err != nil {
		return nil, err
	}

	return reviews, nil
}
func (rs *ReviewService) GetUserReviews(user_id int) ([]*models.Review, error) {
	if user_id == 0 {
		return nil, fmt.Errorf("Invalid data")
	}
	reviews, err := rs.ReviewRepo.GetUserReviews(user_id)

	if err != nil {
		return nil, err
	}
	return reviews, nil
}
func (rs *ReviewService) ReviewStatusUpdate(review *models.Review) error {
	if review.ID == 0 || review.Status < 0 || review.Status > 3 {
		return fmt.Errorf("Invalid data")
	}
	err := rs.ReviewRepo.ReviewStatusUpdate(review.ID, review.Status)
	if err != nil {
		return err
	}
	return nil

}
