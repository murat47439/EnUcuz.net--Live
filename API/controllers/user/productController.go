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
		config.Logger.Printf("GetProduct error: Invalid ID - %v", err)
		RespondWithError(w, http.StatusBadRequest, "Geçersiz ürün ID'si")
		return
	}
	ctx := r.Context()
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	product, attributes, err := pc.ProductService.GetProduct(ctx, id)

	if err != nil {
		config.Logger.Printf("GetProduct service error: %v", err)
		RespondWithError(w, http.StatusNotFound, "Ürün bulunamadı")
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
		config.Logger.Printf("UpdateProduct error: Unauthorized access")
		RespondWithError(w, http.StatusUnauthorized, "Yetkisiz erişim")
		return
	}
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		config.Logger.Printf("UpdateProduct error: Invalid ID - %v", err)
		RespondWithError(w, http.StatusBadRequest, "Geçersiz veri")
		return
	}
	ctx := r.Context()
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	var product models.UpdProduct

	err = json.NewDecoder(r.Body).Decode(&product)

	if err != nil {
		config.Logger.Printf("UpdateProduct error: Invalid JSON - %v", err)
		RespondWithError(w, http.StatusBadRequest, "Geçersiz veri formatı")
		return
	}
	config.Logger.Printf("%+v", product)
	// Price validasyonu
	if product.Price < 0 {
		config.Logger.Printf("UpdateProduct error: Negative price value: %d", product.Price)
		RespondWithError(w, http.StatusBadRequest, "Fiyat negatif olamaz")
		return
	}
	if id != int(product.ID) {
		config.Logger.Printf("UpdateProduct error: ID mismatch %d != %d", id, product.ID)
		RespondWithError(w, http.StatusBadRequest, "ID eşleşmiyor")
		return
	}

	defer r.Body.Close()

	updproduct, err := pc.ProductService.UpdateProduct(ctx, &product, userID)

	if err != nil {
		config.Logger.Printf("UpdateProduct service error: %v", err)
		RespondWithError(w, http.StatusInternalServerError, "Ürün güncellenirken hata oluştu")
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
	config.Logger.Printf("AddProduct request started by user %d", userID)
	if !ok {
		config.Logger.Printf("AddProduct error: Unauthorized access")
		RespondWithError(w, http.StatusUnauthorized, "Yetkisiz erişim")
		return
	}

	var product models.NewProduct
	ctx := r.Context()
	ctx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	err := r.ParseMultipartForm(10 << 20) // 10MB
	if err != nil {
		config.Logger.Printf("handleMultipartProduct error: Failed to parse form - %v", err)
		RespondWithError(w, http.StatusBadRequest, "Form verisi işlenemedi")
		return
	}

	product.Name = r.FormValue("name")
	product.Description = r.FormValue("description")

	priceStr := r.FormValue("price")
	priceInt, err := strconv.ParseInt(priceStr, 10, 64)
	if err != nil {
		config.Logger.Printf("AddProduct error: Invalid price value '%s' - %v", priceStr, err)
		RespondWithError(w, http.StatusBadRequest, "Geçersiz fiyat değeri: Fiyat tam sayı olmalıdır")
		return
	}
	if priceInt < 0 {
		config.Logger.Printf("AddProduct error: Negative price value: %d", priceInt)
		RespondWithError(w, http.StatusBadRequest, "Fiyat negatif olamaz")
		return
	}
	product.Price = priceInt
	product.CategoryID, err = strconv.Atoi(r.FormValue("category"))
	if err != nil {
		config.Logger.Printf("AddProduct error: Invalid category value '%s' - %v", r.FormValue("category"), err)
		RespondWithError(w, http.StatusBadRequest, "Geçersiz kategori ID")
		return
	}

	product.BrandID, err = strconv.Atoi(r.FormValue("brand"))
	if err != nil {
		config.Logger.Printf("AddProduct error: Invalid brand value '%s' - %v", r.FormValue("brand"), err)
		RespondWithError(w, http.StatusBadRequest, "Geçersiz marka ID")
		return
	}

	product.Stock, err = strconv.Atoi(r.FormValue("stock"))
	if err != nil {
		config.Logger.Printf("AddProduct error: Invalid stock value '%s' - %v", r.FormValue("stock"), err)
		RespondWithError(w, http.StatusBadRequest, "Geçersiz stok değeri")
		return
	}
	featuresJSON := r.FormValue("features")
	if featuresJSON != "" {
		var features []models.Feature
		if err := json.Unmarshal([]byte(featuresJSON), &features); err != nil {
			config.Logger.Printf("AddProduct error: Invalid features JSON - %v", err)
		} else {
			product.Features = features
		}
	}
	imageURLS := r.FormValue("images")
	if imageURLS != "" {
		var images []string
		if err := json.Unmarshal([]byte(imageURLS), &images); err != nil {
			config.Logger.Printf("AddProduct error: Invalid images JSON - %v", err)
		} else {
			product.ImageURLs = images
		}
	}
	product.SellerID = userID
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
		config.Logger.Printf("DeleteProduct error: Invalid ID - %v", err)
		RespondWithError(w, http.StatusBadRequest, "Geçersiz veri")
		return
	}
	ctx := r.Context()
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	userID, ok := r.Context().Value(middleware.UserIDKey).(int)
	if !ok {
		config.Logger.Printf("DeleteProduct error: Unauthorized access")
		RespondWithError(w, http.StatusUnauthorized, "Yetkisiz erişim")
		return
	}
	err = pc.ProductService.DeleteProduct(ctx, id, userID)
	if err != nil {
		config.Logger.Printf("DeleteProduct service error: %v", err)
		RespondWithError(w, http.StatusInternalServerError, "Ürün silinirken hata oluştu")
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
		config.Logger.Printf("GetProducts service error: %v", err)
		RespondWithError(w, http.StatusInternalServerError, "Ürünler listelenirken hata oluştu")
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
		config.Logger.Printf("GetUserProducts error: Unauthorized access")
		RespondWithError(w, http.StatusUnauthorized, "Yetkisiz erişim")
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
		config.Logger.Printf("GetUserProducts service error: %v", err)
		RespondWithError(w, http.StatusInternalServerError, "Kullanıcı ürünleri listelenirken hata oluştu")
		return
	}
	RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"products": products,
	})
}
func (pc *ProductController) CreateDescription(w http.ResponseWriter, r *http.Request) {
	config.Logger.Printf("CreateDescription request started")
	var text models.AIRequestDescription
	err := json.NewDecoder(r.Body).Decode(&text)
	if err != nil {
		config.Logger.Printf("CreateDescription error: Invalid JSON - %v", err)
		RespondWithError(w, http.StatusBadRequest, "Geçersiz veri formatı")
		return
	}
	ctx := r.Context()
	ctx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()
	AItext, err := pc.ProductService.CreateDescription(ctx, text.Text)
	if err != nil {
		config.Logger.Printf("CreateDescription service error: %v", err)
		RespondWithError(w, http.StatusInternalServerError, "Açıklama oluşturulurken hata oluştu")
		return
	}
	RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"aitext": AItext,
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
