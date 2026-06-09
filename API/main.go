package main

import (
	"Store-Dio/app"
	"Store-Dio/config"
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

func main() {

	ctx, stop := signal.NotifyContext(
		context.Background(),
		os.Interrupt,
		syscall.SIGTERM,
	)
	defer stop()

	//Create Log File
	logger := config.NewLog(nil)
	logger.InitLogger()

	//Call config

	config.LoadConfig()

	// db connection
	db := config.ConnectDB()
	defer db.Close()

	config.Logger.Println("Application started successfully.")

	//App Services Started

	application := app.NewApp(db)

	//get router

	routes := application.Route

	// Workers
	go application.OfferWorker.Start(ctx)

	//Start server
	srv := &http.Server{
		Addr:    ":8080",
		Handler: routes,
	}

	log.Println("Server running on http://localhost:8080")

	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			config.Logger.Fatalf("Server Failed: %v", err)
		}
	}()

	<-ctx.Done()
	log.Println("Shutting down server...")

	// Graceful shutdown with timeout
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		config.Logger.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server Exited properly")
}
