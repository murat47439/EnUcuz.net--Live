package brands

import (
	"Store-Dio/models"
	"Store-Dio/repo"
	"fmt"
)

type BrandsService struct {
	BrandsRepo *repo.BrandsRepo
}

func NewBrandsService(brandsRepo *repo.BrandsRepo) *BrandsService {
	return &BrandsService{
		BrandsRepo: brandsRepo,
	}
}
func (bs *BrandsService) AddBrand(data *models.Brand) (*models.Brand, error) {
	if data.Name == "" {
		return nil, fmt.Errorf("Invalid data")
	}
	brand, err := bs.BrandsRepo.AddBrand(data)

	if err != nil {
		return nil, fmt.Errorf("Repo error : %s", err.Error())
	}
	return brand, nil
}
func (bs *BrandsService) UpdateBrand(data *models.Brand) (bool, error) {
	if data.ID == 0 || data.Name == "" {
		return false, fmt.Errorf("Invalid data")
	}
	err := bs.BrandsRepo.UpdateBrand(data)

	if err != nil {
		return false, nil
	}

	return true, nil
}
func (bs *BrandsService) GetBrand(id int) (*models.Brand, error) {
	if id == 0 {
		return nil, fmt.Errorf("Invalid data")
	}
	brand, err := bs.BrandsRepo.GetBrand(id)

	if err != nil {
		return nil, err
	}

	return brand, nil
}
func (bs *BrandsService) GetBrands(page int, search string) ([]*models.Brand, error) {
	if page < 1 {
		page = 1
	}
	brands, err := bs.BrandsRepo.GetBrands(page, search)

	if err != nil {
		return nil, err
	}

	return brands, nil
}
func (bs *BrandsService) DeleteBrand(id int) error {
	if id == 0 {
		return fmt.Errorf("Invalid data")
	}
	data, err := bs.GetBrand(id)

	if err != nil {
		return err
	}

	err = bs.BrandsRepo.DeleteBrand(data)

	if err != nil {
		return err
	}
	return nil
}
