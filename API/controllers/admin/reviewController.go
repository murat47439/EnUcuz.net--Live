package admin

import (
	"Store-Dio/config"
	"Store-Dio/models"
	"Store-Dio/services/reviews"
	"encoding/json"
	"net/http"
)

type ReviewController struct {
	ReviewService *reviews.ReviewService
}

func NewReviewController(service *reviews.ReviewService) *ReviewController {
	return &ReviewController{
		ReviewService: service,
	}
}
func (rc *ReviewController) ReviewStatusUpdate(w http.ResponseWriter, r *http.Request) {
	config.Logger.Printf("ReviewStatusUpdate request started")

	var review *models.Review
	err := json.NewDecoder(r.Body).Decode(&review)
	if err != nil {
		config.Logger.Printf("ReviewStatusUpdate error: Invalid request data - %v", err)
		RespondWithError(w, http.StatusBadRequest, "Geçersiz veri formatı")
		return
	}
	defer r.Body.Close()

	err = rc.ReviewService.ReviewStatusUpdate(review)
	if err != nil {
		config.Logger.Printf("ReviewStatusUpdate service error: %v", err)
		RespondWithError(w, http.StatusInternalServerError, "Yorum durumu güncellenirken hata oluştu")
		return
	}

	config.Logger.Printf("ReviewStatusUpdate success: Review %d status updated", review.ID)
	RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"message": "Yorum durumu başarıyla güncellendi",
	})
}
