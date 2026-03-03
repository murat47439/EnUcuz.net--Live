package websocket

import (
	"Store-Dio/models"
	"context"
	"encoding/json"
	"fmt"
	"time"
)

type Event struct {
	Type string          `json:"type"`
	Data json.RawMessage `json:"data"`
}
type PrivateMessage struct {
	SenderID int
	RoomID   string `json:"room_id"`
	Text     string `json:"text"`
}
type JoinLeaveRoom struct {
	RoomID string `json:"room_id"`
}
type UserStatusEvent struct {
	UserID int    `json:"user_id"`
	Status string `json:"status"`
}

func HandleEvent(client *Client, event Event) {
	switch event.Type {
	case "private_message":
		handlePrivateMessage(client, event.Data)
	case "join_room":
		handleJoinRoom(client, event.Data)
	case "leave_room":
		handleLeaveRoom(client, event.Data)
	case "user_status":
		userStatusEvent(client, event.Data)
	default:
		client.SendError("unknown event type")
	}
}
func userStatusEvent(client *Client, data []byte) {
	var message UserStatusEvent

	err := json.Unmarshal(data, &message)
	if err != nil {
		client.SendError("Invalid ID")
		return
	}

	if client.Hub.IsUserOnline(message.UserID) {
		client.SendJSON(map[string]interface{}{
			"type":    "user_status",
			"user_id": message.UserID,
			"status":  "online",
		})
	} else {
		client.SendJSON(map[string]interface{}{
			"type":    "user_status",
			"user_id": message.UserID,
			"status":  "offline",
		})
	}

}
func handlePrivateMessage(client *Client, data []byte) {
	var message PrivateMessage

	err := json.Unmarshal(data, &message)
	if err != nil {
		client.SendError("Invalid Message")
		return
	}
	var chatID int
	fmt.Sscanf(message.RoomID, "%d", &chatID)

	msg := &models.Message{
		ChatID:  chatID,
		Sender:  client.ID,
		Content: message.Text,
	}
	ctx := context.Background()
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	save, err := client.Hub.Chat.NewMessage(ctx, msg)
	if err != nil {
		client.SendError("Mesaj gönderilemedi : " + err.Error())
		return
	}

	room := client.Hub.GetRoom(message.RoomID)

	res, _ := json.Marshal(map[string]interface{}{
		"type": "private_message",
		"data": save,
	})

	room.broadcast <- res
}
func handleJoinRoom(client *Client, data []byte) {
	var payload JoinLeaveRoom
	if err := json.Unmarshal(data, &payload); err != nil {
		client.SendError("Invalid Room ID")
		return
	}
	if payload.RoomID == "" {
		client.SendError("RoomID REQUIRED")
		return
	}

	var chatID int

	fmt.Sscanf(payload.RoomID, "%d", &chatID)
	ctx := context.Background()
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	exists, err := client.Hub.Chat.CheckChat(ctx, client.ID, chatID)
	if err != nil || !exists {
		client.SendError("Bu sohbete erişim izniniz yok.")
		return
	}

	room := client.Hub.GetRoom(payload.RoomID)
	if _, exists := client.rooms[payload.RoomID]; exists {
		return
	}
	room.register <- client

	client.rooms[payload.RoomID] = room

	client.SendJSON(map[string]interface{}{
		"type":    "success",
		"room_id": payload.RoomID,
	})
}
func handleLeaveRoom(client *Client, data []byte) {
	var payload JoinLeaveRoom

	if err := json.Unmarshal(data, &payload); err != nil {
		client.SendError("Invalid Room ID")
		return
	}
	if payload.RoomID == "" {
		client.SendError("RoomID REQUIRED")
		return
	}
	room := client.Hub.GetRoom(payload.RoomID)

	if _, exists := client.rooms[payload.RoomID]; !exists {
		client.SendError("NOT_IN_ROOM")
		return
	}
	room.unregister <- client

	delete(client.rooms, payload.RoomID)

	client.SendJSON(map[string]interface{}{
		"type":    "success",
		"room_id": payload.RoomID,
	})

}
