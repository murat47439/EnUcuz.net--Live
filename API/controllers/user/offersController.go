package user

import (
	"Store-Dio/config"
	"Store-Dio/middleware"
	"Store-Dio/models"
	"Store-Dio/services/offers"
	"context"
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
)

type OffersController struct {
	OffersService *offers.OffersService
}

func NewOffersController(service *offers.OffersService) *OffersController {
	return &OffersController{
		OffersService: service,
	}
}

func (oc *OffersController) NewOffer(w http.ResponseWriter, r *http.Request) {
	config.Logger.Printf("New Offer request started")

	userID, ok := r.Context().Value(middleware.UserIDKey).(int)
	config.Logger.Printf("New Offer request started by user %d", userID)
	if !ok {
		config.Logger.Printf("NewOffer error: Unauthorized access")
		RespondWithError(w, http.StatusUnauthorized, "Yetkisiz erişim")
		return
	}

	var offer models.NewOffer
	ctx := r.Context()
	ctx, cancel := context.WithTimeout(ctx, 15*time.Second)
	defer cancel()

	err := json.NewDecoder(r.Body).Decode(&offer)
	defer r.Body.Close()

	if err != nil {
		config.Logger.Printf("NewOffer Error : Invalid request data")
		RespondWithError(w, http.StatusBadRequest, "Geçersiz veri formatı")
		return
	}

	offer.CreatedBy = userID
	offer.BidderID = userID
	id, err := oc.OffersService.NewOffer(ctx, &offer)

	if err != nil {
		config.Logger.Printf("NewOffer Service Error: %v", err)
		RespondWithError(w, http.StatusInternalServerError, "Teklif verilirken hata oluştu")
		return
	}
	config.Logger.Printf("NewOffer success: offerID=%d userID=%d", id, userID)
	RespondWithJSON(w, http.StatusCreated, map[string]interface{}{
		"message": "Teklif verildi",
	})
}
func (oc *OffersController) CounterOffer(w http.ResponseWriter, r *http.Request) {
	config.Logger.Printf("Counter Offer request started")
	userID, ok := r.Context().Value(middleware.UserIDKey).(int)
	config.Logger.Printf("Counter offer request started by %d", userID)
	if !ok {
		config.Logger.Printf("Unauthorized")
		RespondWithError(w, http.StatusUnauthorized, "Yetkisiz erişim")
		return
	}

	parentId, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		config.Logger.Printf("RemoveReview error: Invalid review ID - %v", err)
		RespondWithError(w, http.StatusBadRequest, "Geçersiz yorum ID'si")
		return
	}

	var data models.CounterOffer
	ctx := r.Context()
	ctx, cancel := context.WithTimeout(ctx, 15*time.Second)
	defer cancel()
	err = json.NewDecoder(r.Body).Decode(&data)
	defer r.Body.Close()
	if err != nil {
		config.Logger.Printf("Counter Offer Error : Invalid data")
		RespondWithError(w, http.StatusBadRequest, "Geçersiz veri")
		return
	}
	data.CreatedBy = userID
	id, err := oc.OffersService.CounterOffer(ctx, &data, parentId)
	if err != nil {
		config.Logger.Printf("Offer Service Error : %s", err)
		RespondWithError(w, http.StatusInternalServerError, "İşlem Başarısız")
		return
	}
	config.Logger.Printf("Counter Offer success: offerID=%d userID=%d", id, userID)
	RespondWithJSON(w, http.StatusCreated, map[string]interface{}{
		"message": "Teklif verildi",
	})
}
func (oc *OffersController) UpdateOffer(w http.ResponseWriter, r *http.Request) {
	config.Logger.Printf("Update Offer request started")
	userID, ok := r.Context().Value(middleware.UserIDKey).(int)
	config.Logger.Printf("Update Offer request started by user %d", userID)
	if !ok {
		config.Logger.Printf("UpdateOffer error: Unauthorized access")
		RespondWithError(w, http.StatusUnauthorized, "Yetkisiz erişim")
		return
	}
	var data models.UpdateOffer

	ctx := r.Context()
	ctx, cancel := context.WithTimeout(ctx, 15*time.Second)
	defer cancel()
	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		config.Logger.Printf("UpdateOffer error: Invalid Data")
		RespondWithError(w, http.StatusBadRequest, "Geçersiz Parametre")
		return
	}
	offerId, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		config.Logger.Printf("RemoveReview error: Invalid review ID - %v", err)
		RespondWithError(w, http.StatusBadRequest, "Geçersiz yorum ID'si")
		return
	}
	data.ID = offerId
	err = oc.OffersService.UpdateOffer(ctx, data, userID)
	if err != nil {
		config.Logger.Printf("Update Offer Service Error %s", err)
		RespondWithError(w, http.StatusInternalServerError, "İşlem başarısız")
		return
	}

	config.Logger.Printf("Update Offer success: offerID=%d userID=%d", data.ID, userID)
	RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"message": "Teklif güncellendi",
	})
}
func (oc *OffersController) GetOffersBySeller(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	config.Logger.Printf("Get Offers By Seller request started")
	userID, ok := r.Context().Value(middleware.UserIDKey).(int)
	config.Logger.Printf("Get Offers By Seller request started by user %d", userID)
	if !ok {
		config.Logger.Printf("userID Error :Unauthorized")
		RespondWithError(w, http.StatusUnauthorized, "Yetkisiz erişim")
		return
	}
	ctx := r.Context()
	ctx, cancel := context.WithTimeout(ctx, 15*time.Second)
	defer cancel()
	page, err := strconv.Atoi(query.Get("page"))
	if err != nil {
		page = 1
	}
	offers, err := oc.OffersService.GetOffersBySeller(ctx, page, userID)
	if err != nil {
		config.Logger.Printf("Offers Service Error : %v", err)
		RespondWithError(w, http.StatusInternalServerError, "Teklifler listelenirken hata oluştu")
		return
	}
	config.Logger.Printf("Get Offers By Seller success: page=%d userID=%d", page, userID)
	RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"offers": offers,
	})
}
func (oc *OffersController) GetOffersByBidder(w http.ResponseWriter, r *http.Request) {
	config.Logger.Printf("Get Offers By Bidder request started")
	query := r.URL.Query()
	userID, ok := r.Context().Value(middleware.UserIDKey).(int)
	config.Logger.Printf("Get Offers By Bidder request started by user %d", userID)
	if !ok {
		config.Logger.Printf("userID Error :Unauthorized")
		RespondWithError(w, http.StatusUnauthorized, "Yetkisiz erişim")
		return
	}
	ctx := r.Context()
	ctx, cancel := context.WithTimeout(ctx, 15*time.Second)
	defer cancel()
	page, err := strconv.Atoi(query.Get("page"))
	if err != nil {
		page = 1
	}
	offers, err := oc.OffersService.GetOffersByBidder(ctx, page, userID)
	if err != nil {
		config.Logger.Printf("Offers Service Error : %v", err)
		RespondWithError(w, http.StatusInternalServerError, "Teklifler listelenirken hata oluştu")
		return
	}
	config.Logger.Printf("Get Offers By Bidder success: page=%d userID=%d", page, userID)
	RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"offers": offers,
	})
}
