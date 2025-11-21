package products

import (
	"Store-Dio/handlers"
	"Store-Dio/internal/db"
	"Store-Dio/models"
	"Store-Dio/repo"
	"context"
	"fmt"
	"sync"
)

type ProductService struct {
	ProductRepo   *repo.ProductRepo
	AttributeRepo *repo.AttributeRepo
	db            db.TxStarter
}

func NewProductService(repo *repo.ProductRepo, arepo *repo.AttributeRepo, db db.TxStarter) *ProductService {
	return &ProductService{ProductRepo: repo,
		AttributeRepo: arepo, db: db}
}
func (ps *ProductService) GetUserProducts(ctx context.Context, userID int, page int) ([]*models.Product, error) {
	products, err := ps.ProductRepo.GetUserProducts(ctx, userID, page)
	if err != nil {
		return nil, err
	}
	return products, nil
}
func (ps *ProductService) AddProduct(ctx context.Context, data models.NewProduct) (bool, error) {
	if data.Name == "" || data.SellerID == 0 || data.Price == 0 {
		return false, fmt.Errorf("Invalid data")
	}
	tx, err := ps.db.BeginTxx(ctx, nil)
	if err != nil {
		return false, fmt.Errorf("TX Error : %w", err)
	}
	defer func() {
		if p := recover(); p != nil {
			_ = tx.Rollback()
			panic(p)
		} else if err != nil {
			_ = tx.Rollback()
		} else {
			err = tx.Commit()
		}
	}()
	prodID, err := ps.ProductRepo.AddProduct(ctx, data, tx)
	if err != nil {
		return false, fmt.Errorf("Error : %w", err)
	}
	err = ps.ProductRepo.AddProductImages(ctx, data.ImageURLs, prodID, tx)
	if err != nil {
		return false, fmt.Errorf("Error : %w", err)
	}
	data.ID = prodID
	if len(data.Features) > 0 && data.Features[0].Key.Value != 0 {
		err = ps.AttributeRepo.AddProdAttributes(ctx, data.Features, data.ID, tx)
		if err != nil {
			return false, err
		}
	}

	return true, nil
}
func (ps *ProductService) UpdateProduct(ctx context.Context, product *models.UpdProduct, user_id int) (*models.UpdProduct, error) {
	p, err := ps.ProductRepo.GetProduct(ctx, product.ID)
	switch {
	case err != nil:
		return nil, err
	case p.ID == 0:
		return nil, fmt.Errorf("Product Not Found")
	case p.SellerID != user_id:
		return nil, fmt.Errorf("👍")
	}
	err = ps.ProductRepo.UpdateProduct(ctx, product)
	if err != nil {
		return nil, err
	}
	return product, nil

}
func (ps *ProductService) UpdateProductForAdmin(ctx context.Context, product models.UpdProduct) (*models.UpdProduct, error) {
	exists, err := ps.ProductRepo.CheckProduct(product.ID)
	switch {
	case err != nil:
		return nil, err
	case !exists:
		return nil, fmt.Errorf("Product Not Found")
	}
	err = ps.ProductRepo.UpdateProduct(ctx, &product)
	if err != nil {
		return nil, err
	}
	return &product, nil

}
func (ps *ProductService) DeleteProduct(ctx context.Context, id, user_id int) error {
	if id == 0 {
		return fmt.Errorf("Invalid data")
	}
	data, err := ps.ProductRepo.GetProduct(ctx, id)

	if err != nil {
		return err
	}
	if data.SellerID != user_id {
		return fmt.Errorf("👍")
	}
	err = ps.ProductRepo.DeleteProduct(data)

	if err != nil {
		return err
	}
	return nil
}
func (ps *ProductService) DeleteProductForAdmin(ctx context.Context, id int) error {
	if id == 0 {
		return fmt.Errorf("Invalid data")
	}
	data, err := ps.ProductRepo.GetProduct(ctx, id)

	if err != nil {
		return err
	}
	err = ps.ProductRepo.DeleteProduct(data)

	if err != nil {
		return err
	}
	return nil
}
func (ps *ProductService) GetProduct(ctx context.Context, id int) (*models.Product, []*models.ProductAttribute, error) {
	if id == 0 {
		return nil, nil, fmt.Errorf("Invalid data")
	}
	var (
		product    *models.Product
		attributes []*models.ProductAttribute
		images     []string
		perr       error
		aerr       error
		ierr       error
	)

	var wg sync.WaitGroup
	wg.Add(3)
	go func() { defer wg.Done(); product, perr = ps.ProductRepo.GetProduct(ctx, id) }()
	go func() { defer wg.Done(); attributes, aerr = ps.AttributeRepo.GetProdAttributes(ctx, id) }()
	go func() { defer wg.Done(); images, ierr = ps.ProductRepo.GetProductImages(ctx, id) }()
	wg.Wait()

	if perr != nil {
		return nil, nil, perr
	}
	if aerr != nil {
		return nil, nil, aerr
	}
	if ierr != nil {
		return nil, nil, ierr
	}
	product.ImageURLs = images
	return product, attributes, nil
}
func (ps *ProductService) GetProducts(ctx context.Context, page, brand_id, category_id int, search string) ([]*models.Product, error) {
	switch {
	case page < 1:
		page = 1
	}

	products, err := ps.ProductRepo.GetProducts(ctx, page, brand_id, category_id, search)

	if err != nil {
		return nil, err
	}

	return products, nil
}
func (ps *ProductService) CreateDescription(ctx context.Context, text string) (string, error) {
	if len(text) < 50 {
		return "", fmt.Errorf("please give a longer text")
	}
	AItext, err := handlers.CreateDescription(text, ctx)
	if err != nil {
		return "", err
	}
	return AItext, nil
}

// func (ps *ProductService) CompareProducts(id1, id2 int) ([]models.Product, error) {
// 	if id1 == 0 || id2 == 0 {
// 		return nil, fmt.Errorf("Invalid data")
// 	}
// 	result, err := ps.ProductRepo.CompareProduct(id1, id2)
// 	if err != nil {
// 		return nil, nil
// 	}
// 	return result, nil
// }
