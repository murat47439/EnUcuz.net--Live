package user

import (
	"Store-Dio/clients"
	"Store-Dio/config"
	"Store-Dio/middleware"
	"Store-Dio/services/images"

	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
)

type ImageController struct {
	ImagesServices *images.ImageService
}

func NewImageController(service *images.ImageService) *ImageController {
	return &ImageController{
		ImagesServices: service,
	}
}

func (ic *ImageController) UploadImage(w http.ResponseWriter, r *http.Request) {
	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		RespondWithError(w, http.StatusBadRequest, "invalid multipart form")
		return
	}
	file, fileHeader, err := r.FormFile("image")
	if err != nil {
		RespondWithError(w, http.StatusBadRequest, "image field is required")
		return
	}
	switch fileHeader.Header.Get("Content-Type") {
	case "image/jpeg", "image/png", "image/webp":
	default:
		RespondWithError(w, http.StatusUnsupportedMediaType, "unsupported image type")
		return
	}

	cf := clients.ImageClient

	ctx, cancel := context.WithTimeout(r.Context(), 25*time.Second)
	defer cancel()

	imageID, _, err := cf.UploadImageV2(ctx, file, fileHeader.Filename)
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	RespondWithJSON(w, http.StatusOK, map[string]string{
		"image_id": imageID,
		"url": fmt.Sprintf(
			"https://imagedelivery.net/%s/%s/public",
			config.CLOUDFLARE_ACCOUNT_HASH,
			imageID,
		),
	})
}
func (ic *ImageController) DeleteImage(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(middleware.UserIDKey).(int)
	if !ok {
		RespondWithError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	id := chi.URLParam(r, "id")

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	control, err := ic.ImagesServices.AuthDelete(ctx, userID, id)
	if err != nil {
		RespondWithError(w, http.StatusBadRequest, "Error")
		config.Logger.Printf(err.Error())
		return
	}
	if !control {
		RespondWithError(w, http.StatusBadRequest, "Invalid Request")
		return
	}

	cf := clients.NewImagesClient(config.CLOUDFLARE_ACCOUNT_ID, config.CLOUDFLARE_API_KEY)

	result, err := cf.DeleteImageV2(ctx, id)
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if !result {
		RespondWithError(w, http.StatusBadRequest, "Image could not be deleted")
		return
	}
	RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"success":  true,
		"message":  "Image deleted successfully",
		"image_id": id,
	})
}
