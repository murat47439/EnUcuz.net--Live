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
	query := `SELECT * FROM public.products WHERE seller_id = $1 AND deleted_at IS NULL LIMIT $2 OFFSET $3`
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
	query := "SELECT EXISTS (SELECT 1 FROM public.products WHERE id = $1 AND deleted_at IS NULL)"

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
	query := "SELECT EXISTS (SELECT 1 FROM public.products WHERE name = $1 AND image_url = $2 AND deleted_at IS NULL)"

	err := pr.db.Get(&exists, query, name, imageUrl)

	if err != nil {
		return false, err
	}

	return exists, nil

}
func (pr *ProductRepo) AddProduct(ctx context.Context, data models.NewProduct, tx *sqlx.Tx) (int, error) {
	query := `INSERT INTO public.products(name,description,stock,price,image_url,category_id,created_at,brand_id,seller_id) VALUES($1,$2,$3,$4,$5,$6,NOW(),$7,$8) RETURNING id`
	var id int
	err := tx.QueryRowContext(ctx, query, data.Name, data.Description, data.Stock, data.Price, data.ImageURLs[0], data.CategoryID, data.BrandID, data.SellerID).Scan(&id)
	if err != nil {
		return 0, fmt.Errorf("Database error %w", err)
	}
	return id, nil
}
func (pr *ProductRepo) AddProductImages(ctx context.Context, images []string, id int, tx *sqlx.Tx) error {
	if len(images) == 0 {
		return nil
	}

	query := `INSERT INTO public.product_images (product_id, image_url, created_at) VALUES `
	vals := []interface{}{}
	paramIndex := 1

	for i, url := range images {
		query += fmt.Sprintf("($%d, $%d, NOW())", paramIndex, paramIndex+1)
		paramIndex += 2
		if i < len(images)-1 {
			query += ","
		}
		vals = append(vals, id, url)
	}

	_, err := tx.ExecContext(ctx, query, vals...)
	if err != nil {
		return fmt.Errorf("database error: %w", err)
	}

	return nil
}

func (pr *ProductRepo) ExistsData(name string, tx *sqlx.Tx) (bool, error) {
	if name == "" {
		return false, fmt.Errorf("Invalid data")
	}
	query := `SELECT EXISTS(SELECT 1 FROM public.brands WHERE name = $1 AND deleted_at IS NULL)`
	var exists bool
	err := tx.QueryRow(query, name).Scan(&exists)

	if err != nil {
		return false, err
	}
	return exists, nil
}
func (pr *ProductRepo) UpdateProduct(ctx context.Context, product *models.UpdProduct) error {
	query := `UPDATE public.products SET name = $1, description = $2,stock = $3, price = $4 WHERE id = $5 AND deleted_at IS NULL`

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
	query := `SELECT p.*, b.name AS brand_name, c.name AS category_name, u.name AS seller_name, u.phone AS seller_phone FROM public.products p 
	LEFT JOIN public.brands b ON p.brand_id = b.id 
	LEFT JOIN public.categories c ON p.category_id = c.id
	LEFT JOIN public.users u ON p.seller_id = u.id
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
	query := `SELECT image_url FROM public.product_images WHERE product_id = $1`

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
			FROM public.categories
			WHERE id = $1
			UNION ALL
			SELECT c.id
			FROM public.categories c
			JOIN alt_kategoriler ak ON c.parent_id = ak.id
		)`
		args = append(args, categoryID)
		argIdx++
	}

	query := `
	` + cte + `
	SELECT 
		p.*, 
		b.name AS brand_name, 
		c.name AS category_name,
		u.name AS seller_name,
		u.phone AS seller_phone
	FROM public.products p
	LEFT JOIN public.brands b ON p.brand_id = b.id
	LEFT JOIN public.categories c ON p.category_id = c.id
	LEFT JOIN public.users u ON p.seller_id = u.id
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
	query := `UPDATE public.products SET deleted_at = NOW() WHERE id = $1 AND seller_id = $2`

	_, err = tx.Exec(query, data.ID, data.SellerID)

	if err != nil {
		return fmt.Errorf("Database error : ", err.Error())
	}
	return nil
}
