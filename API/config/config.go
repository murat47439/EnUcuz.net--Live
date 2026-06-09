package config

import (
	"log"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

var (
	JWT_SECRET              []byte
	REFRESH_TOKEN_SECRET    []byte
	IMAGEKIT_PRIVATE_KEY    string
	GEMINI_API_KEY          string
	CLOUDFLARE_ACCOUNT_ID   string
	CLOUDFLARE_API_KEY      string
	CLOUDFLARE_ACCOUNT_HASH string
	SUMSUB_SECRET_KEY       string
	SUMSUB_API_KEY          string
)

func LoadConfig() {
	err := godotenv.Load()
	if err != nil {
		log.Println("ENV file is not found")
	}
	jwt_secret := os.Getenv("JWT_SECRET")
	if jwt_secret == "" {
		Logger.Printf("JWT_SECRET not set in environment")
	}
	gemini_key := os.Getenv("GEMINI_API_KEY")
	if gemini_key == "" {
		Logger.Printf("GEMINI_API_KEY not set in environment")
	}

	privateKey := os.Getenv("IMAGEKIT_PRIVATE_KEY")
	if privateKey == "" {
		Logger.Printf("IMAGEKIT_PRIVATE_KEY not set in environment")
	}
	refresh_token_secret := os.Getenv("REFRESH_TOKEN_SECRET")
	if refresh_token_secret == "" {
		Logger.Printf("REFRESH_TOKEN_SECRET not set in environment")
	}
	cloudflare_account_id := os.Getenv("CLOUDFLARE_ACCOUNT_ID")
	if cloudflare_account_id == "" {
		Logger.Printf("CLOUDFLARE_ACCOUNT_ID not set in environment")
	}
	cloudflare_account_hash := os.Getenv("CLOUDFLARE_ACCOUNT_HASH")
	if cloudflare_account_id == "" {
		Logger.Printf("CLOUDFLARE_ACCOUNT_HASH not set in environment")
	}
	cloudflare_api_key := os.Getenv("CLOUDFLARE_API_KEY")
	if cloudflare_api_key == "" {
		Logger.Printf("CLOUDFLARE_API_KEY not set in environment")
	}
	sumsub_api_key := os.Getenv("SUMSUB_API_KEY")
	if sumsub_api_key == "" {
		Logger.Printf("SUMSUB_API_KEY not set in environment")
	}
	sumsub_secret_key := os.Getenv("SUMSUB_SECRET_KEY")
	if sumsub_secret_key == "" {
		Logger.Printf("SUMSUB_SECRET_KEY not set in environment")
	}
	SUMSUB_API_KEY = strings.TrimSpace(sumsub_api_key)
	SUMSUB_SECRET_KEY = strings.TrimSpace(sumsub_secret_key)
	IMAGEKIT_PRIVATE_KEY = strings.TrimSpace(privateKey)
	JWT_SECRET = []byte(jwt_secret)
	REFRESH_TOKEN_SECRET = []byte(refresh_token_secret)
	GEMINI_API_KEY = strings.TrimSpace(gemini_key)
	CLOUDFLARE_ACCOUNT_ID = strings.TrimSpace(cloudflare_account_id)
	CLOUDFLARE_API_KEY = strings.TrimSpace(cloudflare_api_key)
	CLOUDFLARE_ACCOUNT_HASH = strings.TrimSpace(cloudflare_account_hash)
}
