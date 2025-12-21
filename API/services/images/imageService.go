package images

import (
	"Store-Dio/internal/db"
	"Store-Dio/repo"
	"context"
	"fmt"
)

type ImageService struct {
	ImageRepo *repo.ImageRepo
	db        db.TxStarter
}

func NewProductService(repo *repo.ImageRepo, db db.TxStarter) *ImageService {
	return &ImageService{ImageRepo: repo,
		db: db}
}

func (is *ImageService) AuthDelete(ctx context.Context, userID int, imageID string) (bool, error) {
	if userID == 0 || imageID == "" {
		return false, fmt.Errorf("Invalid data")
	}
	auth, err := is.ImageRepo.AuthDelete(ctx, userID, imageID)
	if err != nil {
		return false, err
	}
	return auth, nil

}
