package websocket

import (
	"Store-Dio/models"
	"context"
)

type ChatBridge interface {
	CheckChat(ctx context.Context, userID, chatID int) (bool, error)
	NewMessage(ctx context.Context, msg *models.Message) (*models.Message, error)
}
