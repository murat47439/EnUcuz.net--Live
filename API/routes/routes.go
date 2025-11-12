package routes

import (
	"Store-Dio/controllers"

	userMiddleware "Store-Dio/middleware"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

func SetupRoutes(
	controller *controllers.Controller,
	um *userMiddleware.UserMiddleware,
) *chi.Mux {
	r := chi.NewRouter()
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins: []string{
			"http://localhost:3000",
			"https://www.enucuz.net.tr",
			"https://en-ucuz-net-git-main-murats-projects-c4a123ca.vercel.app",
			"https://en-ucuz-gq2u79gta-murats-projects-c4a123ca.vercel.app",
			"https://enucuz.net.tr",
			"https://en-ucuz-net.vercel.app",
			"https://en-ucuz-net-murats-projects-c4a123ca.vercel.app",
		},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
	}))
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Route("/api", func(r chi.Router) {
		r.Post("/register", controller.UserController.CreateUser)
		r.Post("/login", controller.UserController.Login)

		r.Route("/profile", func(auth chi.Router) {
			auth.Use(um.AuthMiddleware)
			auth.Get("/", controller.UserController.GetUserData)
			auth.Put("/update", controller.UserController.Update)
			auth.Get("/reviews", controller.UserReviewController.GetUserReviews)
			auth.Get("/products", controller.UserProductController.GetUserProducts)
		})
		r.Route("/attribute", func(at chi.Router) {
			at.Group(func(ad chi.Router) {
				ad.Use(um.OnlyAdmin)
				ad.Post("/", controller.AdminAttributeController.AddAttribute)
				ad.Delete("/{id}", controller.AdminAttributeController.DeleteAttribute)
				ad.Route("/admin/p", func(prod chi.Router) {
					prod.Post("/", controller.AdminAttributeController.AddProdAttribute)
					prod.Delete("/{id}", controller.AdminAttributeController.DeleteProdAttribute)
				})
				ad.Route("/admin/c", func(cat chi.Router) {
					cat.Post("/", controller.AdminAttributeController.AddCatAttribute)
					cat.Delete("/{id}", controller.AdminAttributeController.DeleteCatAttribute)
				})
			})
			at.Get("/", controller.AdminAttributeController.GetAttributes)
			at.Route("/p", func(prod chi.Router) {
				prod.Get("/{id}", controller.AdminAttributeController.GetProdAttributes)
			})
			at.Route("/c", func(cat chi.Router) {
				cat.Get("/{id}", controller.AdminAttributeController.GetCatAttributes)
			})
		})
		r.Route("/refresh", func(ref chi.Router) {
			ref.Post("/", controller.UserController.GetAccess)
			ref.Group(func(logout chi.Router) {
				logout.Use(um.AuthMiddleware)
				logout.Get("/logout", controller.UserController.Logout)
			})

		})
		r.Route("/admin", func(admin chi.Router) {
			admin.Use(um.OnlyAdmin)
			admin.Route("/products", func(prod chi.Router) {
				prod.Put("/{id}", controller.AdminProductController.UpdateProduct)
				prod.Delete("/{id}", controller.AdminProductController.DeleteProduct)
			})
			admin.Route("/reviews", func(rev chi.Router) {
				rev.Put("/", controller.AdminReviewController.ReviewStatusUpdate)
			})
			admin.Route("/brands", func(brand chi.Router) {
				brand.Post("/", controller.AdminbrandsController.AddBrand)
				brand.Put("/{id}", controller.AdminbrandsController.UpdateBrand)
				brand.Delete("/{id}", controller.AdminbrandsController.DeleteBrand)
			})
			admin.Route("/categories", func(cat chi.Router) {
				cat.Post("/", controller.AdminCategoriesController.AddCategory)
				cat.Put("/{id}", controller.AdminCategoriesController.UpdateCategory)
				cat.Delete("/{id}", controller.AdminCategoriesController.DeleteCategory)
			})
			admin.Route("/logs", func(log chi.Router) {
				log.Get("/", controller.AdminProductController.GetLogs)
			})

		})
		r.Route("/products", func(product chi.Router) {
			product.Route("/transactions", func(prod chi.Router) {
				prod.Use(um.AuthMiddleware)
				prod.Post("/", controller.UserProductController.AddProduct)
				prod.Put("/{id}", controller.UserProductController.UpdateProduct)
				prod.Delete("/{id}", controller.UserProductController.DeleteProduct)
			})
			product.Get("/", controller.UserProductController.GetProducts)
			product.Get("/{id}", controller.UserProductController.GetProduct)
			product.Get("/{id}/reviews", controller.UserReviewController.GetReviews)
			// product.Get("/compare/{one}/{two}", controller.UserProductController.CompareProducts)
		})
		r.Route("/reviews", func(review chi.Router) {
			review.Group(func(r chi.Router) {
				r.Use(um.AuthMiddleware)
				r.Post("/", controller.UserReviewController.AddReview)
				r.Put("/", controller.UserReviewController.UpdateReview)
				r.Get("/{id}", controller.UserReviewController.GetReview)
				r.Delete("/{id}", controller.UserReviewController.RemoveReview)
			})
		})
		r.Route("/brands", func(brand chi.Router) {
			brand.Get("/", controller.UserBrandsController.GetBrands)
			brand.Get("/{id}", controller.UserBrandsController.GetBrand)
		})
		r.Route("/categories", func(cat chi.Router) {
			cat.Get("/", controller.UserCategoriesController.GetCategories)
			cat.Get("/{id}", controller.UserCategoriesController.GetCategory)

		})
		r.Route("/chats", func(chat chi.Router) {
			chat.Use(um.AuthMiddleware)
			chat.Post("/", controller.UserChatController.NewChat)
			chat.Post("/message", controller.UserChatController.NewMessage)
			chat.Get("/check/{id}", controller.UserChatController.CheckChat)
			chat.Get("/", controller.UserChatController.GetChats)
			chat.Get("/{id}", controller.UserChatController.GetChat)

		})
		r.Route("/favourites", func(fav chi.Router) {
			fav.Group(func(fav chi.Router) {
				fav.Use(um.AuthMiddleware)
				fav.Get("/", controller.UserFavoriesControllr.GetFavourites)
				fav.Post("/", controller.UserFavoriesControllr.AddFavori)
				fav.Delete("/{id}", controller.UserFavoriesControllr.RemoveFavori)
			})

		})

	})

	r.NotFound(func(w http.ResponseWriter, r *http.Request) {
		http.Error(w, "Endpoint not allowed", http.StatusNotFound)
	})

	return r
}
