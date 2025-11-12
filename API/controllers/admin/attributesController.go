package admin

import (
	"Store-Dio/config"
	"Store-Dio/models"
	"Store-Dio/services/attributes"
	"context"
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
)

type AttributeController struct {
	AttributeService *attributes.AttributeService
}

func NewAttributeController(attribute *attributes.AttributeService) *AttributeController {
	return &AttributeController{
		AttributeService: attribute,
	}
}

func (ac *AttributeController) AddAttribute(w http.ResponseWriter, r *http.Request) {
	config.Logger.Printf("AddAttribute request started")

	var data models.Attribute
	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		config.Logger.Printf("AddAttribute error: Invalid request data - %v", err)
		RespondWithError(w, http.StatusBadRequest, "Geçersiz veri formatı")
		return
	}
	defer r.Body.Close()

	ctx := r.Context()
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	attribute, err := ac.AttributeService.AddAttribute(ctx, &data)
	if err != nil {
		config.Logger.Printf("AddAttribute service error: %v", err)
		RespondWithError(w, http.StatusInternalServerError, "Özellik eklenirken hata oluştu")
		return
	}

	config.Logger.Printf("AddAttribute success: Attribute %s added", data.Name)
	RespondWithJSON(w, http.StatusCreated, map[string]interface{}{
		"attribute": attribute,
	})
}
func (ac *AttributeController) AddCatAttribute(w http.ResponseWriter, r *http.Request) {
	var data models.CategoryAttribute

	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		RespondWithError(w, http.StatusBadRequest, "Invalid data")
		return
	}
	defer r.Body.Close()
	ctx := r.Context()
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	catattribute, err := ac.AttributeService.AddCatAttribute(ctx, &data)
	if err != nil {
		RespondWithError(w, http.StatusBadRequest, err.Error())
		return
	}
	RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"message":            "successfully",
		"category_attribute": catattribute,
	})
}
func (ac *AttributeController) AddProdAttribute(w http.ResponseWriter, r *http.Request) {
	var data models.NewProductAttribute
	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		RespondWithError(w, http.StatusBadRequest, "Invalid data")
		return
	}
	defer r.Body.Close()
	ctx := r.Context()
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	result, err := ac.AttributeService.AddProdAttributes(ctx, &data)
	if err != nil {
		RespondWithError(w, http.StatusBadRequest, err.Error())
		return
	}
	RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"message":   "successfully",
		"attribute": result,
	})
}
func (ac *AttributeController) GetProdAttributes(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		RespondWithError(w, http.StatusBadRequest, "Invalid id")
		return
	}
	ctx := r.Context()
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	data, err := ac.AttributeService.GetProdAttributes(ctx, id)
	if err != nil {
		RespondWithError(w, http.StatusBadRequest, err.Error())
		return
	}
	RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"attributes": data,
	})
}
func (ac *AttributeController) GetAttributes(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()

	page, err := strconv.Atoi(query.Get("page"))
	if err != nil {
		page = 1
	}
	search := query.Get("search")
	if search == "undefined" {
		search = ""
	}
	ctx := r.Context()
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	attributes, err := ac.AttributeService.GetAttributes(ctx, search, page)
	if err != nil {
		RespondWithError(w, http.StatusBadRequest, err.Error())
		return
	}
	RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"Attributes": attributes,
	})
}
func (ac *AttributeController) GetCatAttributes(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		RespondWithError(w, http.StatusBadRequest, "Invalid id")
		return
	}
	ctx := r.Context()

	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	catattribute, err := ac.AttributeService.GetCatAttribute(ctx, id)
	if err != nil {
		RespondWithError(w, http.StatusBadRequest, err.Error())
		return
	}
	RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"category_attributes": catattribute,
	})
}
func (ac *AttributeController) DeleteAttribute(w http.ResponseWriter, r *http.Request) {
	config.Logger.Printf("DeleteAttribute request started")

	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		config.Logger.Printf("DeleteAttribute error: Invalid attribute ID - %v", err)
		RespondWithError(w, http.StatusBadRequest, "Geçersiz özellik ID'si")
		return
	}

	ctx := r.Context()
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	err = ac.AttributeService.DeleteAttribute(ctx, id)
	if err != nil {
		config.Logger.Printf("DeleteAttribute service error: %v", err)
		RespondWithError(w, http.StatusNotFound, "Özellik bulunamadı veya silinemedi")
		return
	}

	config.Logger.Printf("DeleteAttribute success: Attribute %d deleted", id)
	RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"message": "Özellik başarıyla silindi",
	})
}
func (ac *AttributeController) DeleteCatAttribute(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		RespondWithError(w, http.StatusBadRequest, "Invalid id")
		return
	}
	ctx := r.Context()
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	err = ac.AttributeService.DeleteCatAttribute(ctx, id)
	if err != nil {
		RespondWithError(w, http.StatusBadRequest, err.Error())
		return
	}
	RespondWithJSON(w, http.StatusOK, map[string]string{
		"message": "successfully",
	})
}
func (ac *AttributeController) DeleteProdAttribute(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		RespondWithError(w, http.StatusBadRequest, "Invalid id")
		return
	}
	ctx := r.Context()
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	err = ac.AttributeService.DeleteProdAttribute(ctx, id)
	if err != nil {
		RespondWithError(w, http.StatusBadRequest, err.Error())
		return
	}
	RespondWithJSON(w, http.StatusOK, map[string]string{
		"message": "successfully",
	})
}
