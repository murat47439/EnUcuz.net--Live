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
	DB             *sqlx.DB
	Repo           *repo.Repo
	Service        *services.Service
	Controller     *controllers.Controller
	UserMiddleware *middleware.UserMiddleware
	Route          *chi.Mux
	Hub            *websocket.Hub
	OfferWorker    *workers.OfferWorker
}

func NewApp(db *sqlx.DB) *App {
	ctx := context.Background()
	clients.InitGeminiClient(ctx)
	clients.NewImagesClient(config.CLOUDFLARE_ACCOUNT_ID, config.CLOUDFLARE_API_KEY)
	sumsubClient := clients.NewSumsubClient(config.SUMSUB_API_KEY, config.SUMSUB_SECRET_KEY, config.SUMSUB_SANDBOX)

	repo := repo.NewRepo(db)
	service := services.NewService(repo, db, sumsubClient)

	hub := websocket.NewHub(service.ChatService)
	go hub.Run()

	controller := controllers.NewController(service)
	userMiddleware := middleware.NewUserMiddleware(repo.UserRepo)
	ws := websocket.NewHandler(hub)
	route := routes.SetupRoutes(controller, userMiddleware, ws)
	offerWorker := workers.NewOfferWorker(repo.OffersRepo)

	return &App{
		DB:             db,
		Repo:           repo,
		Service:        service,
		Hub:            hub,
		Controller:     controller,
		UserMiddleware: userMiddleware,
		OfferWorker:    offerWorker,
		Route:          route,
	}
}
