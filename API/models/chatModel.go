package models

import "database/sql"

type Chat struct {
	ID        int          `json:"id,omitempty" db:"id"`
	Sender    int          `json:"sender" db:"sender"`
	Recipient int          `json:"recipient" db:"recipient"`
	ChannelID int          `json:"channel_id" db:"channel_id"`
	ProductID int          `json:"product_id,omitempty" db:"product_id"`
	CreatedAt sql.NullTime `json:"created_at" db:"created_at"`
}
type Message struct {
	ID        int          `json:"id,omitempty" db:"id"`
	ChatID    int          `json:"chat_id" db:"chat_id"`
	Content   string       `json:"content" db:"content"`
	Sender    int          `json:"sender" db:"sender"`
	CreatedAt sql.NullTime `json:"created_at" db:"created_at"`
}
type NewChat struct {
	Chat    Chat   `json:"chat"`
	Message string `json:"message"`
}
