package user

import (
	"Store-Dio/config"
	"Store-Dio/middleware"
	"Store-Dio/models"
	"Store-Dio/services/products"
	"context"
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
)

type ProductController struct {
	ProductService *products.ProductService
}

func NewProductController(service *products.ProductService) *ProductController {
	return &ProductController{ProductService: service}
}

func (pc *ProductController) GetProduct(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		RespondWithError(w, http.StatusBadRequest, "Invalid id")
		return
	}
	ctx := r.Context()
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	product, attributes, err := pc.ProductService.GetProduct(ctx, id)

	if err != nil {
		RespondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"product":   product,
		"attribute": attributes,
	})

}
func (pc *ProductController) UpdateProduct(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(middleware.UserIDKey).(int)
	if !ok {
		RespondWithError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		RespondWithError(w, http.StatusBadRequest, "Invalid data")
		return
	}
	ctx := r.Context()
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	var product models.Product

	err = json.NewDecoder(r.Body).Decode(&product)
	if err != nil || id != product.ID {
		RespondWithError(w, http.StatusBadRequest, "Invalid data")
		return
	}
	defer r.Body.Close()

	updproduct, err := pc.ProductService.UpdateProduct(ctx, product, userID)

	if err != nil {
		RespondWithError(w, http.StatusBadRequest, err.Error())
		return
	}
	RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"product": updproduct,
		"message": "Successfully",
	})
}
func (pc *ProductController) AddProduct(w http.ResponseWriter, r *http.Request) {
	config.Logger.Printf("AddProduct request started")

	userID, ok := r.Context().Value(middleware.UserIDKey).(int)
	if !ok {
		config.Logger.Printf("AddProduct error: Unauthorized access")
		RespondWithError(w, http.StatusUnauthorized, "Yetkisiz erişim")
		return
	}

	var product models.NewProduct
	product.SellerID = userID
	ctx := r.Context()
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	err := json.NewDecoder(r.Body).Decode(&product)
	if err != nil {
		config.Logger.Printf("AddProduct error: Invalid request data - %v", err)
		RespondWithError(w, http.StatusBadRequest, "Geçersiz veri formatı")
		return
	}
	defer r.Body.Close()

	_, err = pc.ProductService.AddProduct(ctx, product)
	if err != nil {
		config.Logger.Printf("AddProduct service error: %v", err)
		RespondWithError(w, http.StatusInternalServerError, "Ürün eklenirken hata oluştu")
		return
	}

	config.Logger.Printf("AddProduct success: Product added by user %d", userID)
	RespondWithJSON(w, http.StatusCreated, map[string]interface{}{
		"message": "Ürün başarıyla eklendi",
	})
}
func (pc *ProductController) DeleteProduct(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))

	if err != nil {
		RespondWithError(w, http.StatusBadRequest, "Invalid data")
		return
	}
	ctx := r.Context()
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	userID, ok := r.Context().Value(middleware.UserIDKey).(int)
	if !ok {
		RespondWithError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	err = pc.ProductService.DeleteProduct(ctx, id, userID)
	if err != nil {
		RespondWithError(w, http.StatusBadRequest, err.Error())
		return
	}
	RespondWithJSON(w, http.StatusOK, map[string]string{
		"message": "Successfully",
	})
}
func (pc *ProductController) GetProducts(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	page, err := strconv.Atoi(query.Get("page"))
	if err != nil {
		page = 1
	}
	brand_id, err := strconv.Atoi(query.Get("brand"))
	if err != nil {
		brand_id = 0
	}

	category_id, err := strconv.Atoi(query.Get("category"))
	if err != nil {
		category_id = 0
	}
	ctx := r.Context()
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	search := query.Get("search")
	if search == "undefined" {
		search = ""
	}
	products, err := pc.ProductService.GetProducts(ctx, page, brand_id, category_id, search)

	if err != nil {
		RespondWithError(w, http.StatusBadRequest, "Error : %s"+err.Error())
		return
	}

	RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"message":  "Successfully",
		"products": products,
	})
}
func (pc *ProductController) GetUserProducts(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(middleware.UserIDKey).(int)
	if !ok {
		RespondWithError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	page, err := strconv.Atoi(r.URL.Query().Get("page"))
	if err != nil {
		page = 1
	}
	ctx := r.Context()
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	products, err := pc.ProductService.GetUserProducts(ctx, userID, page)
	if err != nil {
		RespondWithError(w, http.StatusBadRequest, err.Error())
		return
	}
	RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"products": products,
	})
}

// func (pc *ProductController) CompareProducts(w http.ResponseWriter, r *http.Request) {
// 	id1, err := strconv.Atoi(chi.URLParam(r, "one"))
// 	if err != nil {
// 		RespondWithError(w, http.StatusBadRequest, "Invalid data")
// 		return
// 	}
// 	id2, err := strconv.Atoi(chi.URLParam(r, "two"))
// 	if err != nil {
// 		RespondWithError(w, http.StatusBadRequest, "Invalid data")
// 		return
// 	}
// 	result, err := pc.ProductService.CompareProducts(id1, id2)
// 	if err != nil {
// 		RespondWithError(w, http.StatusBadRequest, err.Error())
// 		return
// 	}
// 	RespondWithJSON(w, http.StatusOK, map[string]interface{}{
// 		"Products": result,
// 	})
// }
