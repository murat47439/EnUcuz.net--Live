package config

import (
	"os"
	"strings"

	"github.com/joho/godotenv"
)

var (
	JWT_SECRET           []byte
	REFRESH_TOKEN_SECRET []byte
	IMAGEKIT_PRIVATE_KEY string
)

func LoadConfig() {
	err := godotenv.Load()
	if err != nil {
		Logger.Printf(".env Yüklenemedi")
	}
	jwt_secret := os.Getenv("JWT_SECRET")
	if jwt_secret == "" {
		Logger.Printf("JWT_SECRET not set in environment")
	}
	privateKey := os.Getenv("IMAGEKIT_PRIVATE_KEY")
	if privateKey == "" {
		Logger.Printf("IMAGEKIT_PRIVATE_KEY not set in environment")
	}
	refresh_token_secret := os.Getenv("REFRESH_TOKEN_SECRET")
	if refresh_token_secret == "" {
		Logger.Printf("REFRESH_TOKEN_SECRET not set in environment")
	}

	IMAGEKIT_PRIVATE_KEY = strings.TrimSpace(privateKey)
	JWT_SECRET = []byte(jwt_secret)
	REFRESH_TOKEN_SECRET = []byte(refresh_token_secret)
}
