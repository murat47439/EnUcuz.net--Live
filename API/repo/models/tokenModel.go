package models

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type AccessToken struct {
	UserID   int `json:"id"`
	UserRole int `json:"role"`
	jwt.RegisteredClaims
}

type token struct {
	Token string `json:"token"`
}
type RefreshToken struct {
	ID        int
	UserID    int    `json:"userID"`
	Token     string `json:"token"`
	ExpiresAt time.Time
}
