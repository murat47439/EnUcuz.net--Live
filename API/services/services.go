package services

import (
	"Store-Dio/clients"
	"Store-Dio/repo"
	"Store-Dio/services/attributes"
	"Store-Dio/services/brands"
	"Store-Dio/services/categories"
	"Store-Dio/services/chat"
	"Store-Dio/services/favories"
	"Store-Dio/services/images"
	"Store-Dio/services/kyc"
	"Store-Dio/services/offers"
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
	OffersService     *offers.OffersService
	ImageService      *images.ImageService
	KYCService        *kyc.KYCService
	db                *sqlx.DB
}

func NewService(repo *repo.Repo, db *sqlx.DB, sumsubClient clients.ISumsubClient) *Service {
	brandsService := brands.NewBrandsService(repo.BrandsRepo)
	categoriesService := categories.NewCategoriesService(repo.CategoriesRepo)
	productsService := products.NewProductService(repo.ProductRepo, repo.AttributeRepo, repo.UserRepo, db)
	usersService := users.NewUserService(repo.UserRepo, repo.SessionRepo)
	favoriesService := favories.NewFavoriesService(repo.FavoriesRepo, repo.ProductRepo)
	reviewsService := reviews.NewReviewService(repo.ReviewsRepo)
	attributeService := attributes.NewAttributeService(db, repo.AttributeRepo, repo.ProductRepo)
	chatService := chat.NewChatService(repo.ChatRepo, repo.OffersRepo, db)
	imageService := images.NewProductService(repo.ImageRepo, db)
	offersService := offers.NewOffersService(repo.OffersRepo, repo.ProductRepo, db, chatService)
	kycService := kyc.NewKYCService(repo.UserRepo, sumsubClient)

	return &Service{
		BrandsService:     brandsService,
		CategoriesService: categoriesService,
		ProductsService:   productsService,
		UsersService:      usersService,
		FavoriesService:   favoriesService,
		ReviewsService:    reviewsService,
		AttributeService:  attributeService,
		ChatService:       chatService,
		ImageService:      imageService,
		OffersService:     offersService,
		KYCService:        kycService,
		db:                db,
	}
}
