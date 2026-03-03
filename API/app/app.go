package app

import (
	"Store-Dio/clients"
	"Store-Dio/config"
	"Store-Dio/controllers"
	"Store-Dio/internal/websocket"
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

	Hub *websocket.Hub

	// Workers
	OfferWorker *workers.OfferWorker
}

func NewApp(db *sqlx.DB) *App {

	repo := repo.NewRepo(db)

	service := services.NewService(repo, db)

	hub := websocket.NewHub(service.ChatService)
	go hub.Run()

	controllers := controllers.NewController(service)

	userMiddleware := middleware.NewUserMiddleware(repo.UserRepo)

	ws := websocket.NewHandler(hub)

	// Route
	route := routes.SetupRoutes(controllers, userMiddleware, ws)

	// Workers
	offerWorker := workers.NewOfferWorker(repo.OffersRepo)

	// Clients
	ctx := context.Background()
	clients.InitGeminiClient(ctx)
	clients.NewImagesClient(config.CLOUDFLARE_ACCOUNT_ID, config.CLOUDFLARE_API_KEY)
	return &App{
		DB: db,

		Repo:           repo,
		Service:        service,
		Hub:            hub,
		Controller:     controllers,
		UserMiddleware: userMiddleware,
		OfferWorker:    offerWorker,

		// Route
		Route: route,
	}
}
