package config

import "os"

var (
	JWT_SECRET           []byte
	REFRESH_TOKEN_SECRET []byte
)

func LoadConfig() {
	jwt_secret := os.Getenv("JWT_SECRET")
	if jwt_secret == "" {
		Logger.Printf("JWT_SECRET not set in environment")
	}
	JWT_SECRET = []byte(jwt_secret)
	refresh_token_secret := os.Getenv("REFRESH_TOKEN_SECRET")
	if refresh_token_secret == "" {
		Logger.Printf("REFRESH_TOKEN_SECRET not set in environment")
	}
	REFRESH_TOKEN_SECRET = []byte(refresh_token_secret)
}
