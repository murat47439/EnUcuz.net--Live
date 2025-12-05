package repo

import (
	"Store-Dio/models"
	"database/sql"
	"fmt"

	"github.com/jmoiron/sqlx"
)

type FavoriesRepo struct {
	db *sqlx.DB
}

func NewFavoriesRepo(db *sqlx.DB) *FavoriesRepo {
	return &FavoriesRepo{
		db: db,
	}
}

func (fr *FavoriesRepo) CheckFavoriAdd(userID, prodid int) (bool, error) {
	if prodid == 0 || userID == 0 {
		return false, fmt.Errorf("Invalid CHECK")
	}
	query := `SELECT EXISTS(SELECT 1 FROM public.wishlist WHERE user_id = $1 AND product_id = $2 AND deleted_at IS NULL)`
	var exists bool

	err := fr.db.Get(&exists, query, userID, prodid)
	if err != nil {
		return false, fmt.Errorf("Database error")
	}
	return exists, nil
}

func (fr *FavoriesRepo) AddFavori(prod *models.Product, user_id int) error {

	exists, err := fr.CheckFavoriAdd(user_id, prod.ID)
	if err != nil {
		return err
	}
	if exists {
		return fmt.Errorf("Ürün zaten favorilere eklendi.")
	}

	query := `INSERT INTO public.wishlist(user_id,product_id,created_at) VALUES($1, $2, NOW())`

	_, err = fr.db.Exec(query, user_id, prod.ID)

	if err != nil {
		return fmt.Errorf("Database error : %s", err.Error())
	}
	return nil
}
func (fr *FavoriesRepo) RemoveFavori(fav *models.Favori) error {

	tx, err := fr.db.Beginx()

	if err != nil {
		return fmt.Errorf("TX error : %s", err.Error())
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

	exists, err := fr.CheckFavori(fav.ID, fav.UserID, tx)

	if err != nil {
		return err
	}
	if !exists {
		return fmt.Errorf("Favori not found")
	}

	query := `UPDATE public.wishlist SET deleted_at = NOW() WHERE product_id = $1 `

	_, err = tx.Exec(query, fav.ID)

	if err != nil {
		return fmt.Errorf("Database error = %s ", err.Error())
	}

	return nil
}
func (fr *FavoriesRepo) CheckFavori(id int, user_id int, tx *sqlx.Tx) (bool, error) {
	if id == 0 || user_id == 0 {
		return false, fmt.Errorf("Invalid data")
	}
	query := `SELECT EXISTS(SELECT 1 FROM public.wishlist WHERE product_id = $1 AND user_id = $2 AND deleted_at IS NULL)`

	var exists bool

	err := tx.Get(&exists, query, id, user_id)

	if err != nil {
		return false, fmt.Errorf("Database error : %s", err.Error())
	}
	return exists, nil
}
func (fr *FavoriesRepo) GetFavourites(page int, user_id int) ([]*models.Product, error) {
	var favourites []*models.Product
	if page < 1 {
		page = 1
	}
	offset := (page - 1) * 50
	query := `SELECT p.* FROM public.products p INNER JOIN public.wishlist w ON p.id = w.product_id WHERE w.user_id = $1 AND w.deleted_at IS NULL LIMIT $2 OFFSET $3`

	rows, err := fr.db.Queryx(query, user_id, 50, offset)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("Favories not found")
		}
		return nil, fmt.Errorf("Database error : %s", err.Error())
	}
	for rows.Next() {
		var prod models.Product
		if err = rows.StructScan(&prod); err != nil {
			return nil, fmt.Errorf("Rows error : %s", err.Error())
		}
		favourites = append(favourites, &prod)
	}
	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("Rows error : %s", err.Error())
	}
	return favourites, nil
}
