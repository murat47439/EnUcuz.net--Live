package repo

import (
	"Store-Dio/models"
	"context"
	"database/sql"
	"fmt"

	"github.com/jmoiron/sqlx"
)

type BrandsRepo struct {
	db *sqlx.DB
}

func NewBrandsRepo(db *sqlx.DB) *BrandsRepo {
	return &BrandsRepo{
		db: db,
	}
}

func (br *BrandsRepo) AddBrand(ctx context.Context, data *models.Brand) (*models.Brand, error) {
	tx, err := br.db.BeginTxx(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("TX Error : %s", err.Error())
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

	exists, err := br.CheckBrand(ctx, data.Name, tx)

	if exists {
		return nil, fmt.Errorf("Brand does exists")
	}

	query := `INSERT INTO products.brands(name, created__at) VALUES ($1, NOW()) RETURNING id`

	var id int
	err = tx.QueryRowContext(ctx, query, data.Name).Scan(&id)

	if err != nil {
		return nil, fmt.Errorf("Database error : %s", err.Error())
	}
	data.ID = id

	return data, nil

}
func (br *BrandsRepo) CheckBrand(ctx context.Context, name string, tx *sqlx.Tx) (bool, error) {
	if name == "" {
		return false, fmt.Errorf("Invalid data")
	}

	query := `SELECT EXISTS(SELECT 1 FROM products.brands WHERE name = $1 AND deleted_at IS NULL)`

	var exists bool

	err := tx.QueryRowContext(ctx, query, name).Scan(&exists)

	if err != nil {
		return false, fmt.Errorf("Database error : %s", err.Error())
	}
	return exists, nil

}
func (br *BrandsRepo) UpdateBrand(ctx context.Context, data *models.Brand) error {
	tx, err := br.db.BeginTxx(ctx, nil)

	if err != nil {
		return fmt.Errorf("TX Error : %s", err.Error())
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

	exists, err := br.CheckBrand(ctx, data.Name, tx)

	if err != nil {
		return err
	}

	if !exists {
		return fmt.Errorf("Brand Not Found")
	}

	query := `UPDATE products.brands SET name = $1 WHERE id = $2`

	_, err = tx.ExecContext(ctx, query, data.Name, data.ID)

	if err != nil {
		return fmt.Errorf("Database error : %s", err.Error())
	}
	return nil
}
func (br *BrandsRepo) GetBrand(ctx context.Context, id int) (*models.Brand, error) {
	query := `SELECT id, name, created_at, deleted_at FROM products.brands WHERE id = $1 AND deleted_at IS NULL`

	var brand models.Brand

	err := br.db.GetContext(ctx, &brand, query, id)

	if err != nil {
		return nil, fmt.Errorf("Database error : %s", err.Error())
	}
	return &brand, nil
}
func (br *BrandsRepo) GetBrands(ctx context.Context, page int, search string) ([]*models.Brand, error) {
	limit := 50
	var brands []*models.Brand
	offset := (page - 1) * 50
	query := `SELECT id, name, created_at, deleted_at FROM products.brands WHERE name ILIKE $1 AND deleted_at IS NULL LIMIT $2 OFFSET $3`

	rows, err := br.db.QueryxContext(ctx, query, search+"%", limit, offset)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("Brands Not found")
		}
		return nil, fmt.Errorf("Database error : %s", err.Error())
	}
	defer rows.Close()
	for rows.Next() {
		var b models.Brand

		if err := rows.StructScan(&b); err != nil {
			return nil, fmt.Errorf("Scan error : %s", err.Error())
		}
		brands = append(brands, &b)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("Rows error %s", err.Error())
	}

	return brands, nil
}
func (br *BrandsRepo) DeleteBrand(ctx context.Context, data *models.Brand) error {
	query := `UPDATE products.brands SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL`

	_, err := br.db.ExecContext(ctx, query, data.ID)

	if err != nil {
		return fmt.Errorf("Database error : %s", err.Error())
	}
	return nil
}
