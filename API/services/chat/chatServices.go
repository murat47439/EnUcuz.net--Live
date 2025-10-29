package chat

import (
	"Store-Dio/internal/db"
	"Store-Dio/models"
	"Store-Dio/repo"
	"context"
	"fmt"
)

type ChatService struct {
	ChatRepo *repo.ChatRepo
	db       db.TxStarter
}

func NewChatService(repo *repo.ChatRepo, db db.TxStarter) *ChatService {
	return &ChatService{ChatRepo: repo,
		db: db}
}

func (cs *ChatService) CheckChat(ctx context.Context, user_id, prod_id int) (bool, error) {
	if user_id == 0 || prod_id == 0 {
		return false, fmt.Errorf("Invalid data")
	}
	exists, err := cs.ChatRepo.CheckChatByProd(ctx, user_id, prod_id)
	if err != nil {
		return false, err
	}
	return exists, nil
}
func (cs *ChatService) NewChat(ctx context.Context, data *models.Chat, message string) (*models.Chat, *models.Message, error) {
	switch {
	case data.ChannelID == 0:
		return nil, nil, fmt.Errorf("Invalid ChannelID")
	case data.Sender == 0:
		return nil, nil, fmt.Errorf("Invalid sender")
	case data.Recipient == 0:
		return nil, nil, fmt.Errorf("Unknown recipient")
	case message == "":
		return nil, nil, fmt.Errorf("Invalid message")
	}
	tx, err := cs.db.BeginTxx(ctx, nil)
	if err != nil {
		return nil, nil, fmt.Errorf("TX error : %w", err)
	}
	defer func() {
		if p := recover(); p != nil {
			_ = tx.Rollback()
			panic(p)
		} else if err := tx.Commit(); err != nil {
			_ = tx.Rollback()
		}
	}()
	exists, err := cs.ChatRepo.CheckChatByProd(ctx, data.Sender, data.ProductID)
	if err != nil {
		return nil, nil, err
	}
	if exists {
		return nil, nil, fmt.Errorf("Chat already exists")
	}
	result, err := cs.ChatRepo.NewChat(ctx, data, tx)
	if err != nil {
		return nil, nil, err
	}
	mes := &models.Message{
		ChatID:  result.ID,
		Sender:  result.Sender,
		Content: message,
	}
	content, err := cs.ChatRepo.NewMessageForFirst(ctx, mes, tx)
	if err != nil {
		return nil, nil, err
	}
	return result, content, nil

}
func (cs *ChatService) NewMessage(ctx context.Context, data *models.Message) (*models.Message, error) {
	exists, err := cs.ChatRepo.CheckChat(ctx, data.Sender, data.ChatID)
	if err != nil {
		return nil, err
	}
	switch {
	case !exists:
		return nil, fmt.Errorf("Invalid chat")
	case data.ChatID == 0:
		return nil, fmt.Errorf("Invalid Chat")
	case data.Content == "":
		return nil, fmt.Errorf("Invalid message")
	case data.Sender == 0:
		return nil, fmt.Errorf("Unknown user")
	}
	message, err := cs.ChatRepo.NewMessage(ctx, data)
	if err != nil {
		return nil, err
	}
	return message, nil
}
func (cs *ChatService) GetChats(ctx context.Context, user_id, page int) ([]*models.Chat, error) {
	switch {
	case user_id == 0:
		return nil, fmt.Errorf("Invalid user")
	case page < 1:
		page = 1
	}
	data, err := cs.ChatRepo.GetChats(ctx, user_id, page)
	if err != nil {
		return nil, err
	}
	return data, nil
}
func (cs *ChatService) GetChat(ctx context.Context, chat_id, user_id int) ([]*models.Message, error) {
	exists, err := cs.ChatRepo.CheckChat(ctx, user_id, chat_id)
	if err != nil {
		return nil, err
	}
	switch {
	case !exists:
		return nil, fmt.Errorf("Invalid chat")
	case chat_id == 0:
		return nil, fmt.Errorf("Invalid chat")
	case user_id == 0:
		return nil, fmt.Errorf("Unknown user")
	}
	data, err := cs.ChatRepo.GetChat(ctx, chat_id)
	if err != nil {
		return nil, err
	}
	return data, nil
}
