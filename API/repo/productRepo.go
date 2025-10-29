package repo

import (
	"Store-Dio/config"
	"Store-Dio/models"
	"context"
	"database/sql"
	"fmt"
	"strconv"

	"github.com/jmoiron/sqlx"
)

type ProductRepo struct {
	db    *sqlx.DB
	brand *BrandsRepo
	cat   *CategoriesRepo
}

func NewProductRepo(db *sqlx.DB, brand *BrandsRepo, cat *CategoriesRepo) *ProductRepo {
	return &ProductRepo{
		db:    db,
		brand: brand,
		cat:   cat}
}
func (pr *ProductRepo) GetUserProducts(ctx context.Context, userID int, page int) ([]*models.Product, error) {
	var products []*models.Product
	offset := (page - 1) * 50
	query := `SELECT * FROM products WHERE seller_id = $1 AND deleted_at IS NULL LIMIT $2 OFFSET $3`
	rows, err := pr.db.QueryxContext(ctx, query, userID, 50, offset)
	if err != nil {
		return nil, fmt.Errorf("Database error : %s", err.Error())
	}
	defer rows.Close()
	for rows.Next() {
		var p models.Product
		if err := rows.StructScan(&p); err != nil {
			return nil, fmt.Errorf("Rows error : %s", err.Error())
		}
		products = append(products, &p)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("Rows error : %s", err.Error())
	}
	return products, nil
}
func (pr *ProductRepo) CheckProduct(prodid int) (bool, error) {

	var exists bool
	if prodid == 0 {
		return false, fmt.Errorf("Invalid product id")
	}
	query := "SELECT EXISTS (SELECT 1 FROM products WHERE id = $1 AND deleted_at IS NULL)"

	err := pr.db.Get(&exists, query, prodid)

	if err != nil {
		return false, err
	}
	config.Logger.Printf(" %v", exists)

	return exists, nil

}
func (pr *ProductRepo) CheckProductByName(name, imageUrl string) (bool, error) {

	var exists bool
	if name == "" || imageUrl == "" {
		return false, fmt.Errorf("Name or ImageUrl cannot be empty")
	}
	query := "SELECT EXISTS (SELECT 1 FROM products WHERE name = $1 AND image_url = $2 AND deleted_at IS NULL)"

	err := pr.db.Get(&exists, query, name, imageUrl)

	if err != nil {
		return false, err
	}

	return exists, nil

}
func (pr *ProductRepo) AddProduct(ctx context.Context, data models.NewProduct, tx *sqlx.Tx) (int, error) {
	query := `INSERT INTO products(name,description,stock,price,image_url,category_id,created_at,brand_id,seller_id) VALUES($1,$2,$3,$4,$5,$6,NOW(),$7,$8) RETURNING id`
	var id int
	err := tx.QueryRowContext(ctx, query, data.Name, data.Description, data.Stock, (data.Price * 100), data.ImageURL, data.CategoryID, data.BrandID, data.SellerID).Scan(&id)
	if err != nil {
		return 0, fmt.Errorf("Database error %w", err)
	}
	return id, nil
}
func (pr *ProductRepo) ExistsData(name string, tx *sqlx.Tx) (bool, error) {
	if name == "" {
		return false, fmt.Errorf("Invalid data")
	}
	query := `SELECT EXISTS(SELECT 1 FROM brands WHERE name = $1 AND deleted_at IS NULL)`
	var exists bool
	err := tx.QueryRow(query, name).Scan(&exists)

	if err != nil {
		return false, err
	}
	return exists, nil
}
func (pr *ProductRepo) UpdateProduct(ctx context.Context, product *models.Product) error {
	query := `UPDATE products SET name = $1, description = $2,stock = $3, price = $4 WHERE id = $5 AND deleted_at IS NULL`

	res, err := pr.db.ExecContext(ctx, query, product.Name, product.Description, product.Stock, product.Price, product.ID)
	if err != nil {
		return fmt.Errorf("Database error : %w", err)
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("Product Not Found")
	}
	return nil

}
func (pr *ProductRepo) GetProduct(ctx context.Context, prodid int) (*models.Product, error) {
	var product models.Product
	if prodid == 0 {
		return nil, fmt.Errorf("Invalid data")
	}
	_, err := pr.CheckProduct(prodid)
	if err != nil {
		return nil, err
	}
	query := `SELECT p.*, b.name AS brand_name, c.name AS category_name, u.name AS seller_name, u.phone AS seller_phone FROM products p 
	LEFT JOIN brands b ON p.brand_id = b.id 
	LEFT JOIN categories c ON p.category_id = c.id
	LEFT JOIN users u ON p.seller_id = u.id
	WHERE p.id = $1 AND p.deleted_at IS NULL`
	err = pr.db.GetContext(ctx, &product, query, prodid)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("Product not found")
		}
		return nil, err
	}
	product.Price = product.Price / 100

	return &product, nil
}
func (pr *ProductRepo) GetProducts(ctx context.Context, page, brand_id, category_id int, search string) ([]*models.Product, error) {
	var products []*models.Product
	offset := (page - 1) * 52
	limit := 52
	query := `SELECT p.*, b.name AS brand_name, c.name AS category_name, u.name AS seller_name, u.phone AS seller_phone FROM products p 
	LEFT JOIN brands b ON p.brand_id = b.id 
	LEFT JOIN categories c ON p.category_id = c.id
	LEFT JOIN users u ON p.seller_id = u.id
	WHERE p.deleted_at IS NULL `
	args := []interface{}{}
	argIdx := 1

	switch {
	case search != "":
		query += ` AND p.name ILIKE $` + strconv.Itoa(argIdx)
		args = append(args, "%"+search+"%")
		argIdx++
	case category_id > 0:
		query += " AND p.category_id = $" + strconv.Itoa(argIdx)
		args = append(args, category_id)
		argIdx++
	case brand_id > 0:
		query += " AND p.brand_id = $" + strconv.Itoa(argIdx)
		args = append(args, brand_id)
		argIdx++
	}
	query += " LIMIT $" + strconv.Itoa(argIdx) + " OFFSET $" + strconv.Itoa(argIdx+1)
	args = append(args, limit, offset)

	rows, err := pr.db.QueryxContext(ctx, query, args...)

	if err != nil {
		return nil, fmt.Errorf("Database error : %s" + err.Error())
	}
	defer rows.Close()

	for rows.Next() {
		var p models.Product

		if err := rows.StructScan(&p); err != nil {
			return nil, fmt.Errorf("Scan error : %s", err.Error())
		}
		products = append(products, &p)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("Rows error : %s", err.Error())
	}

	return products, nil
}
func (pr *ProductRepo) DeleteProduct(data *models.Product) error {
	tx, err := pr.db.Beginx()

	if err != nil {
		return fmt.Errorf("TX Error :%s", err.Error())
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
	query := `UPDATE products SET deleted_at = NOW() WHERE id = $1 AND seller_id = $2`

	_, err = tx.Exec(query, data.ID, data.SellerID)

	if err != nil {
		return fmt.Errorf("Database error : ", err.Error())
	}
	return nil
}
