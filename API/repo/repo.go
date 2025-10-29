package repo

import (
	"github.com/jmoiron/sqlx"
)

type Repo struct {
	db             *sqlx.DB
	BrandsRepo     *BrandsRepo
	CategoriesRepo *CategoriesRepo
	ProductRepo    *ProductRepo
	UserRepo       *UserRepo
	FavoriesRepo   *FavoriesRepo
	ReviewsRepo    *ReviewsRepo
	AttributeRepo  *AttributeRepo
	ChatRepo       *ChatRepo
}

func NewRepo(db *sqlx.DB) *Repo {

	brandRepo := NewBrandsRepo(db)
	categoriesRepo := NewCategoriesRepo(db)
	productRepo := NewProductRepo(db, brandRepo, categoriesRepo)
	userRepo := NewUserRepo(db)
	favoriesRepo := NewFavoriesRepo(db)
	reviewsRepo := NewReviewRepo(db)
	attributeRepo := NewAttributeRepo(db)
	chatRepo := NewChatRepo(db)
	return &Repo{
		db: db,

		BrandsRepo:     brandRepo,
		CategoriesRepo: categoriesRepo,
		ProductRepo:    productRepo,
		UserRepo:       userRepo,
		FavoriesRepo:   favoriesRepo,
		ReviewsRepo:    reviewsRepo,
		AttributeRepo:  attributeRepo,
		ChatRepo:       chatRepo,
	}
}
