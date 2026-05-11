package repo

import (
	"Store-Dio/config"
	"Store-Dio/models"
	"Store-Dio/utils"
	"context"
	"database/sql"
	"errors"
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

const (
	ProductStatusDraft    = 0
	ProductStatusActive   = 1
	ProductStatusInactive = 2
	ProductStatusRejected = 3
	ProductStatusSold     = 4
)

func (pr *ProductRepo) GetUserProducts(ctx context.Context, userID int, page int) ([]*models.Product, error) {
	var products []*models.Product
	offset := (page - 1) * 50
	query := `SELECT id, name,slug ,description, stock, price, image_url, category_id, created_at, updated_at, brand_id, seller_id, status, deleted_at FROM products.products WHERE seller_id = $1 AND deleted_at IS NULL LIMIT $2 OFFSET $3`
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
func (pr *ProductRepo) GetProductSeller(ctx context.Context, id int) (int, error) {
	query := `SELECT seller_id FROM products.products WHERE id = $1 AND deleted_at IS NULL`
	var sellerID int
	err := pr.db.GetContext(ctx, &sellerID, query, id)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return 0, fmt.Errorf("Product not found")
		}
		return 0, err
	}
	return sellerID, nil
}
func (pr *ProductRepo) CheckProduct(ctx context.Context, prodid int) (bool, error) {

	var exists bool
	if prodid == 0 {
		return false, fmt.Errorf("Invalid product id")
	}
	query := "SELECT EXISTS (SELECT 1 FROM products.products WHERE id = $1 AND deleted_at IS NULL)"

	err := pr.db.GetContext(ctx, &exists, query, prodid)

	if err != nil {
		return false, err
	}
	config.Logger.Printf(" %v", exists)

	return exists, nil

}
func (pr *ProductRepo) CheckProductByName(ctx context.Context, name, imageUrl string) (bool, error) {

	var exists bool
	if name == "" || imageUrl == "" {
		return false, fmt.Errorf("Name or ImageUrl cannot be empty")
	}
	query := "SELECT EXISTS (SELECT 1 FROM products.products WHERE name = $1 AND image_url = $2 AND deleted_at IS NULL)"

	err := pr.db.GetContext(ctx, &exists, query, name, imageUrl)

	if err != nil {
		return false, err
	}

	return exists, nil

}
func (pr *ProductRepo) AddProduct(ctx context.Context, data models.NewProduct, tx *sqlx.Tx) (int, error) {

	slug, err := pr.GenerateUniqueSlug(ctx, tx, data.Name)
	if err != nil {
		return 0, err
	}

	query := `INSERT INTO products.products(name,slug,description,status,stock,price,image_url,category_id,created_at,brand_id,seller_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8,NOW(),$9,$10) RETURNING id`
	var id int
	err = tx.QueryRowContext(ctx, query, data.Name, slug, data.Description, ProductStatusActive, data.Stock, data.Price, data.ImageURLs[0], data.CategoryID, data.BrandID, data.SellerID).Scan(&id)
	if err != nil {
		return 0, fmt.Errorf("Database error %w", err)
	}
	return id, nil
}
func (pr *ProductRepo) AddProductImages(ctx context.Context, images []string, id, userID int, tx *sqlx.Tx) error {
	if len(images) == 0 {
		return nil
	}

	query := `INSERT INTO products.product_images (product_id, image_url, created_at, user_id) VALUES `
	vals := []interface{}{}
	paramIndex := 1

	for i, url := range images {
		query += fmt.Sprintf("($%d, $%d, NOW(), $%d)", paramIndex, paramIndex+1, paramIndex+2)
		paramIndex += 3
		if i < len(images)-1 {
			query += ","
		}
		vals = append(vals, id, url, userID)
	}

	_, err := tx.ExecContext(ctx, query, vals...)
	if err != nil {
		return fmt.Errorf("database error: %w", err)
	}

	return nil
}
func (pr *ProductRepo) GenerateUniqueSlug(ctx context.Context, tx *sqlx.Tx, text string) (string, error) {
	baseSlug := utils.Slugify(text)
	counter := 2

	for {
		var exists bool

		err := tx.QueryRowContext(ctx, `SELECT EXISTS(SELECT 1 FROM products.products WHERE slug = $1 )`, baseSlug).Scan(&exists)
		if err != nil {
			return "", err
		}
		if !exists {
			return baseSlug, nil
		}

		baseSlug = fmt.Sprintf("%s-%d", baseSlug, counter)
		counter++
	}
}

func (pr *ProductRepo) ExistsData(ctx context.Context, name string, tx *sqlx.Tx) (bool, error) {
	if name == "" {
		return false, fmt.Errorf("Invalid data")
	}
	query := `SELECT EXISTS(SELECT 1 FROM products.brands WHERE name = $1 AND deleted_at IS NULL)`
	var exists bool
	err := tx.QueryRowContext(ctx, query, name).Scan(&exists)

	if err != nil {
		return false, err
	}
	return exists, nil
}
func (pr *ProductRepo) UpdateProduct(ctx context.Context, tx *sqlx.Tx, product *models.UpdProduct) error {

	slug, err := pr.GenerateUniqueSlug(ctx, tx, product.Name)
	if err != nil {
		return err
	}
	query := `UPDATE products.products SET name = $1, slug = $2 ,description = $3,stock = $4, price = $5 WHERE id = $6 AND deleted_at IS NULL`

	res, err := pr.db.ExecContext(ctx, query, product.Name, slug, product.Description, product.Stock, product.Price, product.ID)
	if err != nil {
		return fmt.Errorf("Database error : %w", err)
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("Product Not Found")
	}
	return nil

}
func (pr *ProductRepo) UpdateProductStatus(ctx context.Context, tx *sqlx.Tx, id, status int) error {
	query := `UPDATE products.products SET status = $1, updated_at = NOW() WHERE id = $2 AND deleted_at IS NULL AND status IS DISTINCT FROM $1`
	res, err := tx.ExecContext(ctx, query, status, id)
	if err != nil {
		return fmt.Errorf("Database error : %w", err)
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("ProductNotFound")
	}
	return nil
}
func (pr *ProductRepo) GetProduct(ctx context.Context, prodid int) (*models.Product, error) {
	var product models.Product
	if prodid == 0 {
		return nil, fmt.Errorf("Invalid data")
	}
	_, err := pr.CheckProduct(ctx, prodid)
	if err != nil {
		return nil, err
	}
	query := `SELECT p.name,p.slug, p.description, p.stock, p.price, p.image_url, p.category_id, p.brand_id, p.seller_id, b.name AS brand_name, c.name AS category_name, u.name AS seller_name, u.phone AS seller_phone FROM products.products p 
	LEFT JOIN products.brands b ON p.brand_id = b.id 
	LEFT JOIN products.categories c ON p.category_id = c.id
	LEFT JOIN users.users u ON p.seller_id = u.id
	WHERE p.id = $1 AND p.deleted_at IS NULL`
	err = pr.db.GetContext(ctx, &product, query, prodid)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("Product not found")
		}
		return nil, err
	}

	return &product, nil
}
func (pr *ProductRepo) GetProductImages(ctx context.Context, prodid int) ([]string, error) {
	var images []string
	if prodid == 0 {
		return nil, fmt.Errorf("Invalid data")
	}
	query := `SELECT image_url FROM products.product_images WHERE product_id = $1`

	rows, err := pr.db.QueryContext(ctx, query, prodid)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var img string
		if err = rows.Scan(&img); err != nil {
			return nil, err
		}
		images = append(images, img)
	}
	if err = rows.Err(); err != nil {
		return nil, err
	}

	return images, nil
}
func (pr *ProductRepo) GetProducts(ctx context.Context, page, brandID, categoryID int, search string) ([]*models.Product, error) {
	var products []*models.Product

	offset := (page - 1) * 52
	limit := 52

	args := []interface{}{}
	argIdx := 1

	// === Kategori Recursive CTE ===
	cte := ""
	if categoryID > 0 {
		cte = `
		WITH RECURSIVE alt_kategoriler AS (
			SELECT id
			FROM products.categories
			WHERE id = $1
			UNION ALL
			SELECT c.id
			FROM products.categories c
			JOIN alt_kategoriler ak ON c.parent_id = ak.id
		)`
		args = append(args, categoryID)
		argIdx++
	}

	query := `
	` + cte + `
	SELECT 
		p.id, p.name,p.slug ,p.description, p.stock, p.price, p.image_url, p.category_id, p.created_at, p.updated_at, p.brand_id, p.seller_id, p.status, p.deleted_at,
		b.name AS brand_name, 
		c.name AS category_name,
		u.name AS seller_name,
		u.phone AS seller_phone
	FROM products.products p
	LEFT JOIN products.brands b ON p.brand_id = b.id
	LEFT JOIN products.categories c ON p.category_id = c.id
	LEFT JOIN users.users u ON p.seller_id = u.id
	WHERE p.deleted_at IS NULL
	`

	// === Dinamik Filtreler ===
	if search != "" {
		query += ` AND p.name ILIKE $` + strconv.Itoa(argIdx)
		args = append(args, "%"+search+"%")
		argIdx++
	}

	if categoryID > 0 {
		query += ` AND p.category_id IN (SELECT id FROM alt_kategoriler)`
	}

	if brandID > 0 {
		query += ` AND p.brand_id = $` + strconv.Itoa(argIdx)
		args = append(args, brandID)
		argIdx++
	}

	query += ` LIMIT $` + strconv.Itoa(argIdx)
	args = append(args, limit)
	argIdx++

	query += ` OFFSET $` + strconv.Itoa(argIdx)
	args = append(args, offset)

	rows, err := pr.db.QueryxContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("Database error: %s", err.Error())
	}
	defer rows.Close()

	for rows.Next() {
		var p models.Product
		if err := rows.StructScan(&p); err != nil {
			return nil, fmt.Errorf("Scan error: %s", err.Error())
		}
		products = append(products, &p)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("Rows error: %s", err.Error())
	}

	return products, nil
}

func (pr *ProductRepo) DeleteProduct(ctx context.Context, data *models.Product) error {
	tx, err := pr.db.BeginTxx(ctx, nil)

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
			if commitErr := tx.Commit(); commitErr != nil {
				err = fmt.Errorf("transaction commit error: %w", commitErr)
			}
		}
	}()
	query := `UPDATE products.products SET deleted_at = NOW() WHERE id = $1 AND seller_id = $2`

	_, err = tx.ExecContext(ctx, query, data.ID, data.SellerID)

	if err != nil {
		return fmt.Errorf("Database error : %w", err)
	}
	return nil
}
func (pr *ProductRepo) LockProduct(ctx context.Context, tx *sqlx.Tx, id int) error {
	query := `SELECT id, status FROM products.products WHERE id = $1 FOR UPDATE`
	var prodid, status int
	err := tx.QueryRowContext(ctx, query, id).Scan(&prodid, &status)
	if err != nil {
		if err == sql.ErrNoRows {
			return fmt.Errorf("Product not found")
		}
		return fmt.Errorf("Database error")
	}
	if status == ProductStatusSold {
		return fmt.Errorf("Product already sold")
	}
	return nil
}

func (pr *ProductRepo) GetProductForOfferTx(ctx context.Context, tx *sqlx.Tx, productID int) (sellerID int, status int, err error) {
	query := `SELECT seller_id, status FROM products.products WHERE id = $1 AND deleted_at IS NULL FOR UPDATE`
	err = tx.QueryRowContext(ctx, query, productID).Scan(&sellerID, &status)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return 0, 0, fmt.Errorf("Product not found")
		}
		return 0, 0, fmt.Errorf("database error: %w", err)
	}
	return sellerID, status, nil
}
