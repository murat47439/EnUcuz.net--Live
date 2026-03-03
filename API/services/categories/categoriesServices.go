package categories

import (
	"Store-Dio/models"
	"Store-Dio/repo"
	"context"
	"fmt"
)

type CategoriesService struct {
	CategoriesRepo *repo.CategoriesRepo
}

func NewCategoriesService(categoriesRepo *repo.CategoriesRepo) *CategoriesService {
	return &CategoriesService{
		CategoriesRepo: categoriesRepo,
	}
}
func (cs *CategoriesService) AddCategory(ctx context.Context, data *models.Category) (*models.Category, error) {
	category, err := cs.CategoriesRepo.AddCategory(ctx, data)

	if err != nil {
		return nil, err
	}

	return category, nil
}
func (cs *CategoriesService) UpdateCategory(ctx context.Context, data *models.Category) error {
	if data.ID == 0 || data.Name == "" {
		return fmt.Errorf("Invalid data")
	}
	_, err := cs.CategoriesRepo.UpdateCategory(ctx, data)

	if err != nil {
		return fmt.Errorf("Repo error : %s", err.Error())
	}
	return nil
}
func (cs *CategoriesService) DeleteCategory(ctx context.Context, id int) error {
	if id == 0 {
		return fmt.Errorf("Invalid data")
	}
	data, err := cs.GetCategory(ctx, id)
	if err != nil {
		return fmt.Errorf("Category not found")
	}
	err = cs.CategoriesRepo.DeleteCategory(ctx, data)

	if err != nil {
		return err
	}
	return nil
}
func (cs *CategoriesService) GetCategory(ctx context.Context, id int) (*models.Category, error) {
	if id == 0 {
		return nil, fmt.Errorf("Invalid data")
	}
	category, err := cs.CategoriesRepo.GetCategory(ctx, id)

	if err != nil {
		return nil, err
	}
	return category, nil
}
func (cs *CategoriesService) GetCategories(ctx context.Context, page int, search string) ([]*models.Category, error) {
	if page < 1 {
		page = 1
	}
	categories, err := cs.CategoriesRepo.GetCategories(ctx, page, search)

	if err != nil {
		return nil, err
	}
	return categories, nil
}
