package admin

import (
	"Store-Dio/config"
	"Store-Dio/models"
	"Store-Dio/services/products"
	"context"
	"encoding/json"
	"net/http"
	"os"
	"path/filepath"
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
func (pc *ProductController) UpdateProduct(w http.ResponseWriter, r *http.Request) {
	config.Logger.Printf("UpdateProduct request started")

	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		config.Logger.Printf("UpdateProduct error: Invalid product ID - %v", err)
		RespondWithError(w, http.StatusBadRequest, "Geçersiz ürün ID'si")
		return
	}

	ctx := r.Context()
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	var product models.UpdProduct
	err = json.NewDecoder(r.Body).Decode(&product)
	if err != nil || id != product.ID {
		config.Logger.Printf("UpdateProduct error: Invalid request data or ID mismatch - %v", err)
		RespondWithError(w, http.StatusBadRequest, "Geçersiz veri formatı veya ID uyumsuzluğu")
		return
	}
	defer r.Body.Close()

	// Price validasyonu
	if product.Price < 0 {
		config.Logger.Printf("UpdateProduct error: Negative price value: %d", product.Price)
		RespondWithError(w, http.StatusBadRequest, "Fiyat negatif olamaz")
		return
	}

	updproduct, err := pc.ProductService.UpdateProductForAdmin(ctx, product)
	if err != nil {
		config.Logger.Printf("UpdateProduct service error: %v", err)
		RespondWithError(w, http.StatusInternalServerError, "Ürün güncellenirken hata oluştu")
		return
	}

	config.Logger.Printf("UpdateProduct success: Product %d updated", id)
	RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"product": updproduct,
	})
}
func (pc *ProductController) DeleteProduct(w http.ResponseWriter, r *http.Request) {
	config.Logger.Printf("DeleteProduct request started")

	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		config.Logger.Printf("DeleteProduct error: Invalid product ID - %v", err)
		RespondWithError(w, http.StatusBadRequest, "Geçersiz ürün ID'si")
		return
	}

	ctx := r.Context()
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	err = pc.ProductService.DeleteProductForAdmin(ctx, id)
	if err != nil {
		config.Logger.Printf("DeleteProduct service error: %v", err)
		RespondWithError(w, http.StatusNotFound, "Ürün bulunamadı veya silinemedi")
		return
	}

	config.Logger.Printf("DeleteProduct success: Product %d deleted", id)
	RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"message": "Ürün başarıyla silindi",
	})
}
func (pc *ProductController) GetLogs(w http.ResponseWriter, r *http.Request) {
	cwd, _ := os.Getwd()
	logPath := filepath.Join(cwd, "logs", "app.log")

	data, err := os.ReadFile(logPath)
	if err != nil {
		http.Error(w, "Cannot read log", http.StatusInternalServerError)
		return
	}
	w.Write(data)
}
