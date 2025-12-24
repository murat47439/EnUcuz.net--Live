package config

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/jmoiron/sqlx"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/stdlib"
	"github.com/joho/godotenv"
)

var DB *sqlx.DB

func ConnectDB() *sqlx.DB {
	err := godotenv.Load()
	if err != nil {
		log.Println("ENV file is not found")
	}

	dbuser := os.Getenv("DB_USER")
	dbpass := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")
	dbport := os.Getenv("DB_PORT")
	dbhost := os.Getenv("DB_HOST")

	if dbuser == "" || dbpass == "" || dbhost == "" || dbport == "" || dbname == "" {
		log.Fatal("invalid env values")
	}

	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=require",
		dbhost, dbport, dbuser, dbpass, dbname,
	)

	config, err := pgx.ParseConfig(dsn)
	if err != nil {
		log.Fatal("pgx parse config failed:", err)
	}

	config.DefaultQueryExecMode = pgx.QueryExecModeSimpleProtocol

	sqlDB := stdlib.OpenDB(*config)

	sqlDB.SetMaxOpenConns(10) // Neon için 25 fazla
	sqlDB.SetMaxIdleConns(5)
	sqlDB.SetConnMaxLifetime(3 * time.Minute)

	if err := sqlDB.Ping(); err != nil {
		log.Fatal("Failed to ping database:", err)
	}

	// 🔑 sqlx ile sarmala (EN ÖNEMLİ SATIR)
	db := sqlx.NewDb(sqlDB, "pgx")

	log.Println("Database connection successful")

	DB = db
	return db
}
