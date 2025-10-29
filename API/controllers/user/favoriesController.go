package user

import (
	"Store-Dio/config"
	"Store-Dio/middleware"
	"Store-Dio/models"
	"Store-Dio/services/favories"
	"context"
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
)

type FavoriesController struct {
	FavoriesServices *favories.FavoriesService
}

func NewFavoriesController(service *favories.FavoriesService) *FavoriesController {
	return &FavoriesController{
		FavoriesServices: service,
	}
}
func GetUserIDFromContext(r *http.Request) (int, int, bool) {
	userID, ok := r.Context().Value(middleware.UserIDKey).(int)
	userRole, ok := r.Context().Value(middleware.UserRole).(int)

	return userID, userRole, ok
}
func (fc *FavoriesController) AddFavori(w http.ResponseWriter, r *http.Request) {
	config.Logger.Printf("AddFavori request started")

	userID, _, ok := GetUserIDFromContext(r)
	if !ok {
		config.Logger.Printf("AddFavori error: Unauthorized access")
		RespondWithError(w, http.StatusUnauthorized, "Yetkisiz erişim")
		return
	}

	var product *models.Product
	err := json.NewDecoder(r.Body).Decode(&product)
	if err != nil {
		config.Logger.Printf("AddFavori error: Invalid request data - %v", err)
		RespondWithError(w, http.StatusBadRequest, "Geçersiz veri formatı")
		return
	}
	defer r.Body.Close()

	err = fc.FavoriesServices.AddFavori(product, userID)
	if err != nil {
		config.Logger.Printf("AddFavori service error: %v", err)
		RespondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	config.Logger.Printf("AddFavori success: Product %d added to favorites for user %d", product.ID, userID)
	RespondWithJSON(w, http.StatusCreated, map[string]interface{}{
		"message": "Ürün favorilere eklendi",
	})
}
func (fc *FavoriesController) RemoveFavori(w http.ResponseWriter, r *http.Request) {
	config.Logger.Printf("RemoveFavori request started")

	userID, _, ok := GetUserIDFromContext(r)
	if !ok {
		config.Logger.Printf("RemoveFavori error: Unauthorized access")
		RespondWithError(w, http.StatusUnauthorized, "Yetkisiz erişim")
		return
	}

	fav, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		config.Logger.Printf("RemoveFavori error: Invalid favorite ID - %v", err)
		RespondWithError(w, http.StatusBadRequest, "Geçersiz favori ID'si")
		return
	}

	err = fc.FavoriesServices.RemoveFavori(fav, userID)
	if err != nil {
		config.Logger.Printf("RemoveFavori service error: %v", err)
		RespondWithError(w, http.StatusNotFound, "Favori bulunamadı veya silinemedi")
		return
	}

	config.Logger.Printf("RemoveFavori success: Favorite %d removed for user %d", fav, userID)
	RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"message": "Ürün favorilerden kaldırıldı",
	})
}
func (fc *FavoriesController) GetFavourites(w http.ResponseWriter, r *http.Request) {
	config.Logger.Printf("GetFavourites request started")

	userID, _, ok := GetUserIDFromContext(r)
	if !ok {
		config.Logger.Printf("GetFavourites error: Unauthorized access")
		RespondWithError(w, http.StatusUnauthorized, "Yetkisiz erişim")
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	query := r.URL.Query()
	page, err := strconv.Atoi(query.Get("page"))
	if err != nil {
		page = 1
	}

	config.Logger.Printf("GetFavourites parameters: userID=%d, page=%d", userID, page)

	data, err := fc.FavoriesServices.GetFavourites(ctx, page, userID)
	if err != nil {
		config.Logger.Printf("GetFavourites service error: %v", err)
		RespondWithError(w, http.StatusInternalServerError, "Favoriler yüklenirken hata oluştu")
		return
	}

	config.Logger.Printf("GetFavourites success: %d favorites retrieved for user %d", len(data), userID)
	RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"products": data,
		"pagination": map[string]interface{}{
			"page": page,
		},
	})
}
