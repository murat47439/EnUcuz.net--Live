package app

import (
	"Store-Dio/clients"
	"Store-Dio/config"
	"Store-Dio/controllers"
	"Store-Dio/middleware"
	"Store-Dio/repo"
	"Store-Dio/routes"
	"Store-Dio/services"
	"Store-Dio/workers"
	"context"

	"github.com/go-chi/chi/v5"
	"github.com/jmoiron/sqlx"
)

type App struct {
	DB *sqlx.DB

	// Repo
	Repo *repo.Repo

	// Services
	Service *services.Service

	// Controller
	Controller *controllers.Controller

	// Middleware
	UserMiddleware *middleware.UserMiddleware

	Route *chi.Mux

	//Workers
	OfferWorker *workers.OfferWorker
}

func NewApp(db *sqlx.DB) *App {

	repo := repo.NewRepo(db)

	service := services.NewService(repo, db)

	controllers := controllers.NewController(service)

	userMiddleware := middleware.NewUserMiddleware(repo.UserRepo)

	// Route

	route := routes.SetupRoutes(controllers, userMiddleware)

	//workers
	offerWorker := workers.NewOfferWorker(repo.OffersRepo)

	//Clients
	ctx := context.Background()
	clients.InitGeminiClient(ctx)
	clients.NewImagesClient(config.CLOUDFLARE_ACCOUNT_ID, config.CLOUDFLARE_API_KEY)
	return &App{
		DB: db,

		Repo:           repo,
		Service:        service,
		Controller:     controllers,
		UserMiddleware: userMiddleware,
		OfferWorker:    offerWorker,

		// Route

		Route: route,
	}
}
