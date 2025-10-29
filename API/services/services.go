package services

import (
	"Store-Dio/repo"
	"Store-Dio/services/attributes"
	"Store-Dio/services/brands"
	"Store-Dio/services/categories"
	"Store-Dio/services/chat"
	"Store-Dio/services/favories"
	"Store-Dio/services/products"
	"Store-Dio/services/reviews"

	"Store-Dio/services/users"

	"github.com/jmoiron/sqlx"
)

type Service struct {
	BrandsService     *brands.BrandsService
	CategoriesService *categories.CategoriesService
	ProductsService   *products.ProductService
	UsersService      *users.UserService
	FavoriesService   *favories.FavoriesService
	ReviewsService    *reviews.ReviewService
	AttributeService  *attributes.AttributeService
	ChatService       *chat.ChatService
	db                *sqlx.DB
}

func NewService(repo *repo.Repo, db *sqlx.DB) *Service {

	brandsService := brands.NewBrandsService(repo.BrandsRepo)
	categoriesService := categories.NewCategoriesService(repo.CategoriesRepo)
	productsService := products.NewProductService(repo.ProductRepo, repo.AttributeRepo, db)
	usersService := users.NewUserService(repo.UserRepo)
	favoriesService := favories.NewFavoriesService(repo.FavoriesRepo, repo.ProductRepo)
	reviewsService := reviews.NewReviewService(repo.ReviewsRepo)
	attributeService := attributes.NewAttributeService(db, repo.AttributeRepo, repo.ProductRepo)
	chatService := chat.NewChatService(repo.ChatRepo, db)
	return &Service{

		BrandsService:     brandsService,
		CategoriesService: categoriesService,
		ProductsService:   productsService,
		UsersService:      usersService,
		FavoriesService:   favoriesService,
		ReviewsService:    reviewsService,
		AttributeService:  attributeService,
		ChatService:       chatService,
		db:                db,
	}
}
