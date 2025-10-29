package admin

import (
	"Store-Dio/config"
	"Store-Dio/models"
	"Store-Dio/services/categories"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
)

type CategoriesController struct {
	CategoriesService *categories.CategoriesService
}

func NewCategoriesController(categoriesService *categories.CategoriesService) *CategoriesController {
	return &CategoriesController{
		CategoriesService: categoriesService,
	}
}
func (cc *CategoriesController) AddCategory(w http.ResponseWriter, r *http.Request) {
	config.Logger.Printf("AddCategory request started")

	var category *models.Category
	err := json.NewDecoder(r.Body).Decode(&category)
	if err != nil {
		config.Logger.Printf("AddCategory error: Invalid request data - %v", err)
		RespondWithError(w, http.StatusBadRequest, "Geçersiz veri formatı")
		return
	}
	defer r.Body.Close()

	data, err := cc.CategoriesService.AddCategory(category)
	if err != nil {
		config.Logger.Printf("AddCategory service error: %v", err)
		RespondWithError(w, http.StatusInternalServerError, "Kategori eklenirken hata oluştu")
		return
	}

	config.Logger.Printf("AddCategory success: Category %s added", category.Name)
	RespondWithJSON(w, http.StatusCreated, map[string]interface{}{
		"category": data,
	})
}
func (cc *CategoriesController) UpdateCategory(w http.ResponseWriter, r *http.Request) {
	var category *models.Category

	err := json.NewDecoder(r.Body).Decode(&category)

	if err != nil {
		RespondWithError(w, http.StatusBadRequest, "Invalid data")
		return
	}
	defer r.Body.Close()
	err = cc.CategoriesService.UpdateCategory(category)

	if err != nil {
		RespondWithError(w, http.StatusBadRequest, err.Error())
		return
	}
	RespondWithJSON(w, http.StatusOK, map[string]string{
		"message": "Successfully",
	})
}
func (cc *CategoriesController) DeleteCategory(w http.ResponseWriter, r *http.Request) {
	config.Logger.Printf("DeleteCategory request started")

	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		config.Logger.Printf("DeleteCategory error: Invalid category ID - %v", err)
		RespondWithError(w, http.StatusBadRequest, "Geçersiz kategori ID'si")
		return
	}

	err = cc.CategoriesService.DeleteCategory(id)
	if err != nil {
		config.Logger.Printf("DeleteCategory service error: %v", err)
		RespondWithError(w, http.StatusNotFound, "Kategori bulunamadı veya silinemedi")
		return
	}

	config.Logger.Printf("DeleteCategory success: Category %d deleted", id)
	RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"message": "Kategori başarıyla silindi",
	})
}
