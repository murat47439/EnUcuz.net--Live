package user

import (
	"Store-Dio/config"
	"Store-Dio/services/categories"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
)

type UCategoriesController struct {
	CategoriesService *categories.CategoriesService
}

func NewUCategoriesController(service *categories.CategoriesService) *UCategoriesController {
	return &UCategoriesController{
		CategoriesService: service,
	}
}
func (uc *UCategoriesController) GetCategory(w http.ResponseWriter, r *http.Request) {
	config.Logger.Printf("GetCategory request started")

	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		config.Logger.Printf("GetCategory error: Invalid ID parameter - %v", err)
		RespondWithError(w, http.StatusBadRequest, "Geçersiz kategori ID'si")
		return
	}

	category, err := uc.CategoriesService.GetCategory(id)
	if err != nil {
		config.Logger.Printf("GetCategory service error: %v", err)
		RespondWithError(w, http.StatusNotFound, "Kategori bulunamadı")
		return
	}

	config.Logger.Printf("GetCategory success: Category ID %d retrieved", id)
	RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"category": category,
	})
}
func (uc *UCategoriesController) GetCategories(w http.ResponseWriter, r *http.Request) {
	config.Logger.Printf("GetCategories request started")

	query := r.URL.Query()
	page, err := strconv.Atoi(query.Get("page"))
	if err != nil {
		page = 1
	}
	search := query.Get("search")
	if search == "undefined" {
		search = ""
	}

	config.Logger.Printf("GetCategories parameters: page=%d, search='%s'", page, search)

	categories, err := uc.CategoriesService.GetCategories(page, search)
	if err != nil {
		config.Logger.Printf("GetCategories service error: %v", err)
		RespondWithError(w, http.StatusInternalServerError, "Kategoriler yüklenirken hata oluştu")
		return
	}

	config.Logger.Printf("GetCategories success: %d categories retrieved", len(categories))
	RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"categories": categories,
		"pagination": map[string]interface{}{
			"page":   page,
			"search": search,
		},
	})
}
