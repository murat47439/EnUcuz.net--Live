package user

import (
	"Store-Dio/config"
	"Store-Dio/services/brands"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
)

type UBrandController struct {
	BrandsService *brands.BrandsService
}

func NewUBrandController(service *brands.BrandsService) *UBrandController {
	return &UBrandController{
		BrandsService: service,
	}
}

func (uc *UBrandController) GetBrand(w http.ResponseWriter, r *http.Request) {
	config.Logger.Printf("GetBrand request started")

	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		config.Logger.Printf("GetBrand error: Invalid ID parameter - %v", err)
		RespondWithError(w, http.StatusBadRequest, "Geçersiz marka ID'si")
		return
	}

	brand, err := uc.BrandsService.GetBrand(id)
	if err != nil {
		config.Logger.Printf("GetBrand service error: %v", err)
		RespondWithError(w, http.StatusNotFound, "Marka bulunamadı")
		return
	}

	config.Logger.Printf("GetBrand success: Brand ID %d retrieved", id)
	RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"brand": brand,
	})
}
func (uc *UBrandController) GetBrands(w http.ResponseWriter, r *http.Request) {
	config.Logger.Printf("GetBrands request started")

	query := r.URL.Query()
	page, err := strconv.Atoi(query.Get("page"))
	if err != nil {
		page = 1
	}
	search := query.Get("search")
	if search == "undefined" {
		search = ""
	}

	config.Logger.Printf("GetBrands parameters: page=%d, search='%s'", page, search)

	brands, err := uc.BrandsService.GetBrands(page, search)
	if err != nil {
		config.Logger.Printf("GetBrands service error: %v", err)
		RespondWithError(w, http.StatusInternalServerError, "Markalar yüklenirken hata oluştu")
		return
	}

	config.Logger.Printf("GetBrands success: %d brands retrieved", len(brands))
	RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"brands": brands,
		"pagination": map[string]interface{}{
			"page":   page,
			"search": search,
		},
	})
}
