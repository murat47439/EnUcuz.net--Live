package clients

import (
	"Store-Dio/config"
	"context"
	"log"

	"google.golang.org/genai"
)

var GeminiClient *genai.Client

func InitGeminiClient(ctx context.Context) {
	var err error
	GeminiClient, err = genai.NewClient(ctx, nil)
	if err != nil {
		log.Fatalf("Failed to initialize Gemini client: %v", err) // uygulamayı durdur
	}

	config.Logger.Printf("Gemini client initialized successfully")
}
