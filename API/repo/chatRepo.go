package repo

import (
	"Store-Dio/models"
	"context"
	"fmt"

	"github.com/jmoiron/sqlx"
)

type ChatRepo struct {
	db *sqlx.DB
}

func NewChatRepo(db *sqlx.DB) *ChatRepo {
	return &ChatRepo{db: db}
}

func (cr *ChatRepo) NewChat(ctx context.Context, data *models.Chat, tx *sqlx.Tx) (*models.Chat, error) {
	query := `INSERT INTO chats(sender,recipient,channel_id,product_id) VALUES($1,$2,$3,$4) RETURNING id, sender, recipient, channel_id, product_id, created_at`
	var result models.Chat
	err := tx.GetContext(ctx, &result, query, data.Sender, data.Recipient, data.ChannelID, data.ProductID)
	if err != nil {
		return nil, fmt.Errorf("Database error %w", err)
	}
	return &result, nil
}
func (cr *ChatRepo) NewMessage(ctx context.Context, message *models.Message) (*models.Message, error) {
	query := `INSERT INTO chat_messages(chat_id, content,sender,created_at) VALUES ($1,$2,$3, NOW()) RETURNING id, chat_id, content, sender, created_at`
	var result models.Message

	err := cr.db.GetContext(ctx, &result, query, message.ChatID, message.Content, message.Sender)
	if err != nil {
		return nil, fmt.Errorf("Database error %w", err)
	}
	return &result, nil
}
func (cr *ChatRepo) NewMessageForFirst(ctx context.Context, message *models.Message, tx *sqlx.Tx) (*models.Message, error) {
	query := `INSERT INTO chat_messages(chat_id, content,sender,created_at) VALUES ($1,$2,$3, NOW()) RETURNING id, chat_id, content, sender, created_at`
	var result models.Message

	err := tx.GetContext(ctx, &result, query, message.ChatID, message.Content, message.Sender)
	if err != nil {
		return nil, fmt.Errorf("Database error %w", err)
	}
	return &result, nil
}
func (cr *ChatRepo) CheckChat(ctx context.Context, user_id, chat_id int) (bool, error) {
	var exists bool
	query := `SELECT EXISTS(SELECT 1 FROM chats WHERE id = $1 AND (sender = $2 OR recipient = $2))`
	err := cr.db.GetContext(ctx, &exists, query, chat_id, user_id)
	if err != nil {
		return false, fmt.Errorf("Database error = %w", err)
	}
	return exists, nil
}
func (cr *ChatRepo) CheckChatByProd(ctx context.Context, user_id, prod_id int) (bool, error) {
	var exists bool
	query := `SELECT EXISTS(SELECT 1 FROM chats WHERE product_id = $1 AND (sender = $2 OR recipient = $2))`
	err := cr.db.GetContext(ctx, &exists, query, prod_id, user_id)
	if err != nil {
		return false, fmt.Errorf("Database error = %w", err)
	}
	return exists, nil
}
func (cr *ChatRepo) GetChats(ctx context.Context, user_id int, page int) ([]*models.Chat, error) {
	if user_id == 0 {
		return nil, fmt.Errorf("Invalid user")
	}
	if page < 1 {
		page = 1
	}
	offset := (page - 1) * 50
	limit := 50
	var data []*models.Chat
	query := `SELECT * FROM chats WHERE sender = $1 OR recipient = $1 
	ORDER BY created_at DESC  LIMIT $2 OFFSET $3`
	rows, err := cr.db.QueryxContext(ctx, query, user_id, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("Database error %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var c models.Chat

		if err := rows.StructScan(&c); err != nil {
			return nil, fmt.Errorf("Scan error %w", err)
		}
		data = append(data, &c)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("Rows error = %w", err)
	}
	return data, nil

}
func (cr *ChatRepo) GetChat(ctx context.Context, chat_id int) ([]*models.Message, error) {
	var data []*models.Message
	query := `SELECT id, chat_id, sender, content, created_at 
			FROM chat_messages
			WHERE chat_id = $1
			ORDER BY created_at ASC`

	rows, err := cr.db.QueryxContext(ctx, query, chat_id)
	if err != nil {
		return nil, fmt.Errorf("Database error %w", err)
	}

	for rows.Next() {
		var m models.Message

		if err := rows.StructScan(&m); err != nil {
			return nil, fmt.Errorf("Scan error : %w", err)
		}

		data = append(data, &m)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("Rows error : %w", err)
	}
	return data, nil
}
