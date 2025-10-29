package repo

import (
	"Store-Dio/models"
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/jmoiron/sqlx"
)

type AttributeRepo struct {
	db *sqlx.DB
}

func NewAttributeRepo(db *sqlx.DB) *AttributeRepo {
	return &AttributeRepo{
		db: db,
	}
}

func (ar *AttributeRepo) AddAttribute(ctx context.Context, data *models.Attribute) (models.Attribute, error) {
	if data.Name == "" {
		return models.Attribute{}, fmt.Errorf("Invalid data")
	}
	var model models.Attribute

	query := `INSERT INTO attributes(name) VALUES($1) RETURNING id`

	var id int
	err := ar.db.GetContext(ctx, &id, query, data.Name)

	if err != nil {
		return models.Attribute{}, fmt.Errorf("Database error (add attribute) %w", err)
	}
	model.ID = id
	model.Name = data.Name
	return model, nil

}
func (ar *AttributeRepo) AddCatAttribute(ctx context.Context, data *models.CategoryAttribute) (models.CategoryAttribute, error) {
	if data.AttributeID == 0 || data.CategoryID == 0 {
		return models.CategoryAttribute{}, fmt.Errorf("Invalid data")
	}
	var model models.CategoryAttribute

	query := `INSERT INTO category_attributes(category_id,attribute_id,allow_custom,required,varianter,slicer) VALUES($1,$2,$3,$4,$5,$6) RETURNING category_id, attribute_id, allow_custom, required, varianter, slicer`

	err := ar.db.GetContext(ctx, &model, query, data.CategoryID, data.AttributeID, data.AllowCustom, data.Required, data.Varianter, data.Slicer)
	if err != nil {
		return models.CategoryAttribute{}, fmt.Errorf("Database error (AddCatAttribute) %w", err)
	}
	return model, nil
}
func (ar *AttributeRepo) AddProdAttribute(ctx context.Context, data *models.ProductAttribute, tx *sqlx.Tx) (*models.ProductAttribute, error) {
	query := `INSERT INTO product_attributes(attribute_id,product_id,value) VALUES ($1,$2,$3) RETURNING attribute_id,product_id,value`
	var result models.ProductAttribute
	err := tx.GetContext(ctx, &result, query, data.AttributeID, data.ProductID, data.Value)
	if err != nil {
		return nil, fmt.Errorf("Database error")
	}
	return &result, nil

}
func (ar *AttributeRepo) AddProdAttributes(ctx context.Context, data []models.Feature, prodID int, tx *sqlx.Tx) error {
	if prodID == 0 || len(data) == 0 {
		return fmt.Errorf("Invalid data")
	}

	values := make([]string, 0, len(data))
	args := make([]interface{}, 0, len(data)*3)

	for i, f := range data {
		base := i * 3
		values = append(values, fmt.Sprintf("($%d, $%d, $%d)", base+1, base+2, base+3))
		args = append(args, prodID, f.Key.Value, f.Value)
	}
	query := fmt.Sprintf(
		"INSERT INTO product_attributes (product_id, attribute_id, value) VALUES %s",
		strings.Join(values, ","),
	)
	_, err := tx.ExecContext(ctx, query, args...)
	return err
}
func (ar *AttributeRepo) GetProdAttributes(ctx context.Context, prodID int) ([]*models.ProductAttribute, error) {
	if prodID == 0 {
		return nil, fmt.Errorf("Invalid data")
	}
	query := `SELECT pa.id, pa.attribute_id,pa.product_id,pa.value, a.name AS attribute_name FROM product_attributes pa
		INNER JOIN attributes a ON a.id = pa.attribute_id
	 WHERE pa.product_id = $1 AND pa.deleted_at IS NULL`

	var data []*models.ProductAttribute
	err := ar.db.SelectContext(ctx, &data, query, prodID)

	if err != nil {
		return nil, fmt.Errorf("Database Error %w", err)
	}
	return data, nil
}
func (ar *AttributeRepo) GetAttributes(ctx context.Context, search string, page int) ([]models.Attribute, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	limit := 50
	offset := (page - 1) * limit
	escaped := strings.ReplaceAll(strings.ReplaceAll(search, "\\", "\\\\"), "%", "\\%")
	escaped = strings.ReplaceAll(escaped, "_", "\\_")

	param := "%" + strings.ToLower(escaped) + "%"

	query := `SELECT name FROM attributes WHERE LOWER(name) LIKE $1 ESCAPE '\' AND deleted_at IS NULL LIMIT $2 OFFSET $3`

	var data []models.Attribute

	err := ar.db.SelectContext(ctx, &data, query, param, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("Database error")
	}
	return data, nil
}
func (ar *AttributeRepo) GetCatAttributes(ctx context.Context, id int) ([]models.CategoryAttribute, error) {
	if id == 0 {
		return nil, fmt.Errorf("Invalid data")
	}
	query := `SELECT ca.id,ca.category_id,ca.attribute_id,ca.allow_custom,ca.required,ca.varianter,ca.slicer, a.name AS attribute_name, c.name AS category_name FROM category_attributes ca
	INNER JOIN attributes a ON a.id = ca.attribute_id
	INNER JOIN categories c ON c.id = ca.category_id
	WHERE ca.category_id = $1 AND ca.deleted_at IS NULL AND a.deleted_at IS NULL AND c.deleted_at IS NULL`
	var data []models.CategoryAttribute
	err := ar.db.SelectContext(ctx, &data, query, id)
	if err != nil {
		return nil, fmt.Errorf("Database error %w", err)
	}
	return data, nil
}
func (ar *AttributeRepo) CheckAttribute(name string) (bool, error) {
	if name == "" {
		return false, fmt.Errorf("Invalid data")
	}
	var exists bool
	query := `SELECT EXISTS(SELECT 1 FROM attributes WHERE name = $1)`
	err := ar.db.Get(&exists, query, name)
	if err != nil {
		return false, fmt.Errorf("Database error")
	}
	return exists, nil

}
func (ar *AttributeRepo) CheckCatAttribute(ctx context.Context, atID, catID int) (bool, error) {
	if atID == 0 || catID == 0 {
		return false, fmt.Errorf("Invalid data")
	}
	var exists bool
	query := `SELECT EXISTS(SELECT 1 FROM category_attributes WHERE category_id = $1 AND attribute_id = $2)`

	err := ar.db.GetContext(ctx, &exists, query, catID, atID)
	if err != nil {
		return false, fmt.Errorf("Database error (CheckCatAttribute)%w", err)
	}
	return exists, nil
}
func (ar *AttributeRepo) CheckProdAttribute(ctx context.Context, prodID, atID int) (bool, error) {
	if prodID == 0 || atID == 0 {
		return false, fmt.Errorf("Invalid data")
	}
	var exists bool
	query := `SELECT EXISTS(SELECT 1 FROM product_attributes WHERE product_id = $1 AND attribute_id= $2 AND deleted_at IS NULL)`
	err := ar.db.GetContext(ctx, &exists, query, prodID, atID)
	if err != nil {
		return false, fmt.Errorf("Database error %w", err)
	}
	return exists, nil
}
func (ar *AttributeRepo) DeleteAttribute(ctx context.Context, id int) error {
	if id == 0 {
		return fmt.Errorf("Invalid data")
	}
	query := `UPDATE attributes SET deleted_at = NOW() WHERE id = $1`

	res, err := ar.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("Database error %w", err)
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("Attribute not found")
	}
	return nil
}
func (ar *AttributeRepo) DeleteCatAttribute(ctx context.Context, id int) error {
	if id == 0 {
		return fmt.Errorf("Invalid data")
	}
	query := `UPDATE category_attributes SET deleted_at = NOW() WHERE id = $1`

	res, err := ar.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("Database error %w", err)
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("Attribute not found")
	}
	return nil
}
func (ar *AttributeRepo) DeleteProdAttribute(ctx context.Context, id int) error {
	if id == 0 {
		return fmt.Errorf("Invalid data")
	}
	query := `UPDATE product_attributes SET deleted_at = NOW() WHERE id = $1`

	res, err := ar.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("Database error %w", err)
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("Attribute not found")
	}
	return nil
}
