package app

import (
	"Store-Dio/clients"
	"Store-Dio/controllers"
	"Store-Dio/middleware"
	"Store-Dio/repo"
	"Store-Dio/routes"
	"Store-Dio/services"
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
}

func NewApp(db *sqlx.DB) *App {

	repo := repo.NewRepo(db)

	service := services.NewService(repo, db)

	controllers := controllers.NewController(service)

	userMiddleware := middleware.NewUserMiddleware(repo.UserRepo)

	// Route

	route := routes.SetupRoutes(controllers, userMiddleware)
	//Clients
	ctx := context.Background()
	clients.InitGeminiClient(ctx)
	clients.InitImagekitClient()
	return &App{
		DB: db,

		Repo:           repo,
		Service:        service,
		Controller:     controllers,
		UserMiddleware: userMiddleware,

		// Route

		Route: route,
	}
}
