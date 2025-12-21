package repo

import (
	"Store-Dio/models"
	"database/sql"
	"fmt"

	"github.com/jmoiron/sqlx"
)

type CategoriesRepo struct {
	db *sqlx.DB
}

func NewCategoriesRepo(db *sqlx.DB) *CategoriesRepo {
	return &CategoriesRepo{
		db: db,
	}
}
func (cr *CategoriesRepo) AddCategory(data *models.Category) (*models.Category, error) {
	if data.Name == "" {
		return nil, fmt.Errorf("Invalid data")
	}
	tx, err := cr.db.Beginx()

	if err != nil {
		return nil, fmt.Errorf("TX ERROR : %s", err.Error())
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

	exists, err := cr.CheckCategory(data.Name, tx)

	if err != nil {
		return nil, err
	}

	if exists {
		return nil, fmt.Errorf("Category does exists")
	}

	query := `INSERT INTO categories(name,parent_id,created_at) VALUES ($1, $2 ,NOW()) RETURNING id`
	var id int
	err = tx.QueryRow(query, data.Name, data.ParentID).Scan(&id)

	data.ID = id

	return data, nil

}
func (cr *CategoriesRepo) CheckCategory(name string, tx *sqlx.Tx) (bool, error) {
	if name == "" {
		return false, fmt.Errorf("Invalid data")
	}
	query := `SELECT EXISTS(SELECT 1 FROM categories WHERE name = $1 AND deleted_at IS NULL)`

	var exists bool

	err := tx.QueryRow(query, name).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("EXISTS ERROR : %s", err.Error())
	}

	return exists, nil
}
func (cr *CategoriesRepo) UpdateCategory(data *models.Category) (bool, error) {

	tx, err := cr.db.Beginx()

	if err != nil {
		return false, fmt.Errorf("TX error : %s", err.Error())
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

	query := `UPDATE categories SET name = $1, parent_id = $2 WHERE id = $3`

	res, err := tx.Exec(query, data.Name, data.ParentID, data.ID)

	if err != nil {
		return false, fmt.Errorf("Database error : %s", err.Error())
	}
	rows, err := res.RowsAffected()
	if err != nil {
		return false, fmt.Errorf("RowsAffected error : %s", err.Error())
	}
	if rows == 0 {
		return false, fmt.Errorf("Category not found")
	}

	return true, nil
}
func (cr *CategoriesRepo) DeleteCategory(data *models.Category) error {
	tx, err := cr.db.Beginx()
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
			err = tx.Commit()
		}
	}()
	exists, err := cr.CheckCategory(data.Name, tx)

	if !exists {
		return fmt.Errorf("Category not found")
	}

	query := "UPDATE categories SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL"

	_, err = tx.Exec(query, data.ID)

	if err != nil {
		return fmt.Errorf("Database error : %s", err.Error())
	}
	return nil
}
func (cr *CategoriesRepo) GetCategory(id int) (*models.Category, error) {
	query := `SELECT * FROM categories WHERE id = $1 AND deleted_at IS NULL`

	var category models.Category

	err := cr.db.Get(&category, query, id)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("Category not found")
		}
		return nil, fmt.Errorf("Database error : %s", err.Error())
	}
	return &category, nil
}
func (cr *CategoriesRepo) GetCategories(page int, search string) ([]*models.Category, error) {
	limit := 50
	query := `SELECT * FROM categories WHERE name ILIKE $1 AND deleted_at IS NULL LIMIT $2 OFFSET $3`
	offset := (page - 1) * 50
	var categories []*models.Category

	rows, err := cr.db.Queryx(query, "%"+search+"%", limit, offset)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("Categories not found")
		}
		return nil, fmt.Errorf("Database error", err.Error())
	}
	defer rows.Close()
	for rows.Next() {
		var c models.Category

		if err := rows.StructScan(&c); err != nil {
			return nil, fmt.Errorf("Scan error : %s", err.Error())
		}

		categories = append(categories, &c)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("Rows error : %s", err.Error())
	}
	return categories, nil
}
