package models

type WsMessage struct {
	Type   string `json:"type"`
	ChatID string `json:"chatId"`
	UserID string `json:"userId"`
	Text   string `json:"text"`
}
