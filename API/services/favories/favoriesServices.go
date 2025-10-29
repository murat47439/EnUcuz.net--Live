package favories

import (
	"Store-Dio/models"
	"Store-Dio/repo"
	"context"
	"fmt"
)

type FavoriesService struct {
	FavoriesRepo *repo.FavoriesRepo
	ProductRepo  *repo.ProductRepo
}

func NewFavoriesService(repo *repo.FavoriesRepo, productRepo *repo.ProductRepo) *FavoriesService {
	return &FavoriesService{
		FavoriesRepo: repo,
		ProductRepo:  productRepo,
	}
}

func (fs *FavoriesService) AddFavori(data *models.Product, user_id int) error {
	if data.ID == 0 {
		return fmt.Errorf("Invalid data")
	}
	err := fs.FavoriesRepo.AddFavori(data, user_id)
	if err != nil {
		return err
	}
	return nil
}
func (fs *FavoriesService) RemoveFavori(id int, user_id int) error {
	if id == 0 || user_id == 0 {
		return fmt.Errorf("Invalid data")
	}
	var data models.Favori
	data.ID = id
	data.UserID = user_id
	err := fs.FavoriesRepo.RemoveFavori(&data)
	if err != nil {
		return err
	}
	return nil
}
func (fs *FavoriesService) GetFavourites(ctx context.Context, page int, user_id int) ([]*models.Product, error) {
	if user_id == 0 {
		return nil, fmt.Errorf("Invalid data")
	}
	favourites, err := fs.FavoriesRepo.GetFavourites(page, user_id)
	if err != nil {
		return nil, err
	}
	return favourites, nil
}
