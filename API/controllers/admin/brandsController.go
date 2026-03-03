package admin

import (
	"Store-Dio/config"
	"Store-Dio/models"
	"Store-Dio/services/brands"
	"context"
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
)

type BrandsController struct {
	BrandsService *brands.BrandsService
}

func NewBrandsController(brandsService *brands.BrandsService) *BrandsController {
	return &BrandsController{
		BrandsService: brandsService,
	}
}

func (bc *BrandsController) AddBrand(w http.ResponseWriter, r *http.Request) {
	config.Logger.Printf("AddBrand request started")

	var data *models.Brand
	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		config.Logger.Printf("AddBrand error: Invalid request data - %v", err)
		RespondWithError(w, http.StatusBadRequest, "Geçersiz veri formatı")
		return
	}
	defer r.Body.Close()

	ctx := r.Context()
	brand, err := bc.BrandsService.AddBrand(ctx, data)
	if err != nil {
		config.Logger.Printf("AddBrand service error: %v", err)
		RespondWithError(w, http.StatusInternalServerError, "Marka eklenirken hata oluştu")
		return
	}

	config.Logger.Printf("AddBrand success: Brand %s added", data.Name)
	RespondWithJSON(w, http.StatusCreated, map[string]interface{}{
		"brand": brand,
	})
}
func (bc *BrandsController) UpdateBrand(w http.ResponseWriter, r *http.Request) {
	var data *models.Brand

	err := json.NewDecoder(r.Body).Decode(&data)

	if err != nil {
		config.Logger.Printf("UpdateBrand error: Invalid JSON - %v", err)
		RespondWithError(w, http.StatusBadRequest, "Geçersiz veri formatı")
		return
	}
	defer r.Body.Close()
	ctx := r.Context()
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	_, err = bc.BrandsService.UpdateBrand(ctx, data)

	if err != nil {
		config.Logger.Printf("UpdateBrand service error: %v", err)
		RespondWithError(w, http.StatusInternalServerError, "Marka güncellenirken hata oluştu")
		return
	}
	RespondWithJSON(w, http.StatusOK, map[string]string{
		"message": "Successfully",
	})
}
func (bc *BrandsController) DeleteBrand(w http.ResponseWriter, r *http.Request) {
	config.Logger.Printf("DeleteBrand request started")

	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		config.Logger.Printf("DeleteBrand error: Invalid brand ID - %v", err)
		RespondWithError(w, http.StatusBadRequest, "Geçersiz marka ID'si")
		return
	}

	ctx := r.Context()
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	err = bc.BrandsService.DeleteBrand(ctx, id)
	if err != nil {
		config.Logger.Printf("DeleteBrand service error: %v", err)
		RespondWithError(w, http.StatusNotFound, "Marka bulunamadı veya silinemedi")
		return
	}

	config.Logger.Printf("DeleteBrand success: Brand %d deleted", id)
	RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"message": "Marka başarıyla silindi",
	})
}
