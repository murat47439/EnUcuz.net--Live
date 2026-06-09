package user

import (
	"Store-Dio/config"
	"Store-Dio/services/kyc"
	"context"
	"net/http"
	"time"
)

type KYCController struct {
	kycService *kyc.KYCService
}

func NewKYCController(service *kyc.KYCService) *KYCController {
	return &KYCController{kycService: service}
}

func (k *KYCController) CreateKYC(w http.ResponseWriter, r *http.Request) {
	userID, _, ok := GetUserIDFromContext(r)
	if !ok {
		RespondWithError(w, http.StatusUnauthorized, "Yetkisiz erişim")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 15*time.Second)
	defer cancel()

	kycData, err := k.kycService.CreateKYC(ctx, userID)
	if err != nil {
		config.Logger.Printf("CreateKYC error for user %d: %v", userID, err)
		RespondWithError(w, http.StatusInternalServerError, "KYC başlatma hatası")
		return
	}

	config.Logger.Printf("CreateKYC success for user %d: applicant=%s", userID, kycData.ApplicantID)
	RespondWithJSON(w, http.StatusOK, kycData)
}

func (k *KYCController) GetKYC(w http.ResponseWriter, r *http.Request) {
	userID, _, ok := GetUserIDFromContext(r)
	if !ok {
		RespondWithError(w, http.StatusUnauthorized, "Yetkisiz erişim")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 15*time.Second)
	defer cancel()

	kycData, err := k.kycService.GetKYC(ctx, userID)
	if err != nil {
		config.Logger.Printf("GetKYC error for user %d: %v", userID, err)
		RespondWithError(w, http.StatusInternalServerError, "KYC durumu alınamadı")
		return
	}

	config.Logger.Printf("GetKYC success for user %d: status=%s answer=%s", userID, kycData.ReviewStatus, kycData.ReviewAnswer)
	RespondWithJSON(w, http.StatusOK, kycData)
}
