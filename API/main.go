package main

import (
	"Store-Dio/app"
	"Store-Dio/config"
	"log"
	"net/http"
)

func main() {

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

	//Start server

	log.Println("Server running on http://localhost:8080")

	if err := http.ListenAndServe(":8080", routes); err != nil {
		config.Logger.Fatalf("Server Failed: %v", err)
	}
}
