package attributes

import (
	"Store-Dio/internal/db"
	"Store-Dio/models"
	"Store-Dio/repo"
	"context"
	"fmt"
)

type AttributeService struct {
	AttributeRepo *repo.AttributeRepo
	ProductRepo   *repo.ProductRepo
	db            db.TxStarter
}

func NewAttributeService(db db.TxStarter, attribtueRepo *repo.AttributeRepo, product *repo.ProductRepo) *AttributeService {
	return &AttributeService{
		AttributeRepo: attribtueRepo,
		ProductRepo:   product,
		db:            db,
	}
}

func (as *AttributeService) AddAttribute(ctx context.Context, data *models.Attribute) (models.Attribute, error) {
	exists, err := as.AttributeRepo.CheckAttribute(data.Name)
	if err != nil {
		return models.Attribute{}, err
	}
	if exists {
		return models.Attribute{}, fmt.Errorf("Attribute already exists")
	}
	attribute, err := as.AttributeRepo.AddAttribute(ctx, data)
	if err != nil {
		return models.Attribute{}, err
	}
	return attribute, nil
}
func (as *AttributeService) AddCatAttribute(ctx context.Context, data *models.CategoryAttribute) (models.CategoryAttribute, error) {
	exists, err := as.AttributeRepo.CheckCatAttribute(ctx, data.AttributeID, data.CategoryID)
	if err != nil {
		return models.CategoryAttribute{}, err
	}
	if exists {
		return models.CategoryAttribute{}, fmt.Errorf("CategoryAttribute already exists")
	}
	catattribute, err := as.AttributeRepo.AddCatAttribute(ctx, data)

	if err != nil {
		return models.CategoryAttribute{}, err
	}
	return catattribute, nil
}
func (as *AttributeService) AddProdAttribute(ctx context.Context, data *models.ProductAttribute) (*models.ProductAttribute, error) {
	switch {
	case data.ProductID == 0:
		return nil, fmt.Errorf("Invalid Prod ID")
	case data.Value == "":
		return nil, fmt.Errorf("Invalid value")
	case data.AttributeID == 0:
		return nil, fmt.Errorf("Invalid Cat ID")
	}
	tx, err := as.db.BeginTxx(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("TX ERROR : %w", err)
	}
	exists, err := as.ProductRepo.CheckProduct(data.ProductID)
	if err != nil {
		return nil, err
	}
	if !exists {
		return nil, fmt.Errorf("Product Not Found")
	}
	exists, err = as.AttributeRepo.CheckProdAttribute(ctx, data.ProductID, data.AttributeID)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, fmt.Errorf("Attribute already exists")
	}
	result, err := as.AttributeRepo.AddProdAttribute(ctx, data, tx)
	if err != nil {
		return nil, err
	}
	return result, nil
}
func (as *AttributeService) GetProdAttributes(ctx context.Context, prodID int) ([]*models.ProductAttribute, error) {
	if prodID == 0 {
		return nil, fmt.Errorf("Invalid data")
	}
	data, err := as.AttributeRepo.GetProdAttributes(ctx, prodID)
	if err != nil {
		return nil, err
	}
	return data, nil
}
func (as *AttributeService) GetAttributes(ctx context.Context, search string, page int) ([]models.Attribute, error) {
	if page < 1 {
		page = 1
	}
	if search == "undefined" {
		search = ""
	}
	data, err := as.AttributeRepo.GetAttributes(ctx, search, page)
	if err != nil {
		return nil, err
	}
	return data, nil
}
func (as *AttributeService) GetCatAttribute(ctx context.Context, id int) ([]models.CategoryAttribute, error) {
	if id == 0 {
		return nil, fmt.Errorf("Invalid data")
	}
	data, err := as.AttributeRepo.GetCatAttributes(ctx, id)
	if err != nil {
		return nil, err
	}
	return data, nil
}
func (as *AttributeService) DeleteAttribute(ctx context.Context, id int) error {
	if id == 0 {
		return fmt.Errorf("Invalid data")
	}
	err := as.AttributeRepo.DeleteAttribute(ctx, id)
	if err != nil {
		return err
	}
	return nil
}
func (as *AttributeService) DeleteCatAttribute(ctx context.Context, id int) error {
	if id == 0 {
		return fmt.Errorf("Invalid data")
	}
	err := as.AttributeRepo.DeleteCatAttribute(ctx, id)
	if err != nil {
		return err
	}
	return nil
}
func (as *AttributeService) DeleteProdAttribute(ctx context.Context, id int) error {
	if id == 0 {
		return fmt.Errorf("Invalid data")
	}
	err := as.AttributeRepo.DeleteProdAttribute(ctx, id)
	if err != nil {
		return err
	}
	return nil
}
