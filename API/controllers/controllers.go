package controllers

import (
	"Store-Dio/controllers/admin"
	"Store-Dio/controllers/user"
	"Store-Dio/services"
)

type Controller struct {
	AdminbrandsController     *admin.BrandsController
	AdminCategoriesController *admin.CategoriesController
	AdminProductController    *admin.ProductController
	AdminReviewController     *admin.ReviewController
	AdminAttributeController  *admin.AttributeController

	UserProductController    *user.ProductController
	UserController           *user.UserController
	UserBrandsController     *user.UBrandController
	UserCategoriesController *user.UCategoriesController
	UserFavoriesControllr    *user.FavoriesController
	UserReviewController     *user.ReviewController
	UserChatController       *user.ChatController
}

func NewController(service *services.Service) *Controller {
	adminBrandsController := admin.NewBrandsController(service.BrandsService)
	adminCategoriesController := admin.NewCategoriesController(service.CategoriesService)
	adminProductController := admin.NewProductController(service.ProductsService)
	adminReviewController := admin.NewReviewController(service.ReviewsService)
	adminAttributeController := admin.NewAttributeController(service.AttributeService)

	userProductController := user.NewProductController(service.ProductsService)
	userBrandsController := user.NewUBrandController(service.BrandsService)
	userCategoriesController := user.NewUCategoriesController(service.CategoriesService)
	userController := user.NewUserController(service.UsersService)
	userFavoritesController := user.NewFavoriesController(service.FavoriesService)
	userReviewController := user.NewReviewController(service.ReviewsService)
	userChatController := user.NewChatController(service.ChatService)

	return &Controller{
		AdminbrandsController:     adminBrandsController,
		AdminCategoriesController: adminCategoriesController,
		AdminProductController:    adminProductController,
		AdminReviewController:     adminReviewController,
		AdminAttributeController:  adminAttributeController,

		UserProductController:    userProductController,
		UserController:           userController,
		UserBrandsController:     userBrandsController,
		UserCategoriesController: userCategoriesController,
		UserFavoriesControllr:    userFavoritesController,
		UserReviewController:     userReviewController,
		UserChatController:       userChatController,
	}
}
