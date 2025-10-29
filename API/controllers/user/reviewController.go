package user

import (
	"Store-Dio/config"
	"Store-Dio/models"
	"Store-Dio/services/reviews"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
)

type ReviewController struct {
	ReviewService *reviews.ReviewService
}

func NewReviewController(service *reviews.ReviewService) *ReviewController {
	return &ReviewController{
		ReviewService: service,
	}
}

func (rc *ReviewController) AddReview(w http.ResponseWriter, r *http.Request) {
	config.Logger.Printf("AddReview request started")

	userID, _, ok := GetUserIDFromContext(r)
	if !ok {
		config.Logger.Printf("AddReview error: Unauthorized access")
		RespondWithError(w, http.StatusUnauthorized, "Yetkisiz erişim")
		return
	}

	var review *models.Review
	err := json.NewDecoder(r.Body).Decode(&review)
	if err != nil {
		config.Logger.Printf("AddReview error: Invalid request data - %v", err)
		RespondWithError(w, http.StatusBadRequest, "Geçersiz veri formatı")
		return
	}
	defer r.Body.Close()

	review.UserID = userID
	err = rc.ReviewService.AddReview(review)
	if err != nil {
		config.Logger.Printf("AddReview service error: %v", err)
		RespondWithError(w, http.StatusInternalServerError, "Yorum eklenirken hata oluştu")
		return
	}

	config.Logger.Printf("AddReview success: Review added by user %d for product %d", userID, review.ProductID)
	RespondWithJSON(w, http.StatusCreated, map[string]interface{}{
		"message": "Yorum başarıyla eklendi",
	})
}
func (rc *ReviewController) UpdateReview(w http.ResponseWriter, r *http.Request) {
	config.Logger.Printf("UpdateReview request started")

	userID, _, ok := GetUserIDFromContext(r)
	if !ok {
		config.Logger.Printf("UpdateReview error: Unauthorized access")
		RespondWithError(w, http.StatusUnauthorized, "Yetkisiz erişim")
		return
	}

	var review *models.Review
	err := json.NewDecoder(r.Body).Decode(&review)
	if err != nil {
		config.Logger.Printf("UpdateReview error: Invalid request data - %v", err)
		RespondWithError(w, http.StatusBadRequest, "Geçersiz veri formatı")
		return
	}
	defer r.Body.Close()

	review.UserID = userID
	err = rc.ReviewService.UpdateReview(review)
	if err != nil {
		config.Logger.Printf("UpdateReview service error: %v", err)
		RespondWithError(w, http.StatusInternalServerError, "Yorum güncellenirken hata oluştu")
		return
	}

	config.Logger.Printf("UpdateReview success: Review %d updated by user %d", review.ID, userID)
	RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"message": "Yorum başarıyla güncellendi",
	})
}
func (rc *ReviewController) RemoveReview(w http.ResponseWriter, r *http.Request) {
	config.Logger.Printf("RemoveReview request started")

	userID, _, ok := GetUserIDFromContext(r)
	if !ok {
		config.Logger.Printf("RemoveReview error: Unauthorized access")
		RespondWithError(w, http.StatusUnauthorized, "Yetkisiz erişim")
		return
	}

	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		config.Logger.Printf("RemoveReview error: Invalid review ID - %v", err)
		RespondWithError(w, http.StatusBadRequest, "Geçersiz yorum ID'si")
		return
	}

	err = rc.ReviewService.RemoveReview(id, userID)
	if err != nil {
		config.Logger.Printf("RemoveReview service error: %v", err)
		RespondWithError(w, http.StatusNotFound, "Yorum bulunamadı veya silinemedi")
		return
	}

	config.Logger.Printf("RemoveReview success: Review %d removed by user %d", id, userID)
	RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"message": "Yorum başarıyla silindi",
	})
}
func (rc *ReviewController) GetReview(w http.ResponseWriter, r *http.Request) {
	config.Logger.Printf("GetReview request started")

	userID, userRole, ok := GetUserIDFromContext(r)
	if !ok {
		config.Logger.Printf("GetReview error: Unauthorized access")
		RespondWithError(w, http.StatusUnauthorized, "Yetkisiz erişim")
		return
	}

	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		config.Logger.Printf("GetReview error: Invalid review ID - %v", err)
		RespondWithError(w, http.StatusBadRequest, "Geçersiz yorum ID'si")
		return
	}

	review, err := rc.ReviewService.GetReview(id, userRole, userID)
	if err != nil {
		config.Logger.Printf("GetReview service error: %v", err)
		RespondWithError(w, http.StatusNotFound, "Yorum bulunamadı")
		return
	}

	config.Logger.Printf("GetReview success: Review %d retrieved by user %d", id, userID)
	RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"review": review,
	})
}
func (rc *ReviewController) GetReviews(w http.ResponseWriter, r *http.Request) {
	config.Logger.Printf("GetReviews request started")

	prodID, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		config.Logger.Printf("GetReviews error: Invalid product ID - %v", err)
		RespondWithError(w, http.StatusBadRequest, "Geçersiz ürün ID'si")
		return
	}

	page, err := strconv.Atoi(r.URL.Query().Get("page"))
	if err != nil {
		page = 1
	}

	config.Logger.Printf("GetReviews parameters: productID=%d, page=%d", prodID, page)

	reviews, err := rc.ReviewService.GetReviews(page, prodID)
	if err != nil {
		config.Logger.Printf("GetReviews service error: %v", err)
		RespondWithError(w, http.StatusInternalServerError, "Yorumlar yüklenirken hata oluştu")
		return
	}

	config.Logger.Printf("GetReviews success: %d reviews retrieved for product %d", len(reviews), prodID)
	RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"reviews": reviews,
		"pagination": map[string]interface{}{
			"page":       page,
			"product_id": prodID,
		},
	})
}
func (rc *ReviewController) GetUserReviews(w http.ResponseWriter, r *http.Request) {
	config.Logger.Printf("GetUserReviews request started")

	userID, _, ok := GetUserIDFromContext(r)
	if !ok {
		config.Logger.Printf("GetUserReviews error: Unauthorized access")
		RespondWithError(w, http.StatusUnauthorized, "Yetkisiz erişim")
		return
	}

	reviews, err := rc.ReviewService.GetUserReviews(userID)
	if err != nil {
		config.Logger.Printf("GetUserReviews service error: %v", err)
		RespondWithError(w, http.StatusInternalServerError, "Kullanıcı yorumları yüklenirken hata oluştu")
		return
	}

	config.Logger.Printf("GetUserReviews success: %d reviews retrieved for user %d", len(reviews), userID)
	RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"reviews": reviews,
	})
}
