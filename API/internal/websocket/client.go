package websocket

import (
	"Store-Dio/config"
	"encoding/json"
	"time"

	"github.com/gorilla/websocket"
	"golang.org/x/time/rate"
)

type Client struct {
	ID          int
	Conn        *websocket.Conn
	Hub         *Hub
	send        chan []byte
	RateLimiter *rate.Limiter
	rooms       map[string]*Room
}

const (
	writeWait  = 10 * time.Second
	pongWait   = 60 * time.Second
	pingPeriod = (pongWait * 9) / 10
)

func (c *Client) Close(code int, reason string) {
	msg := websocket.FormatCloseMessage(code, reason)
	c.Conn.WriteControl(
		websocket.CloseMessage,
		msg,
		time.Now().Add(writeWait),
	)
	c.Conn.Close()
}
func (c *Client) readPump() {
	defer func() {
		for roomID, room := range c.rooms {
			room.unregister <- c
			delete(c.rooms, roomID)
		}
		c.Hub.unregister <- c
		c.Conn.Close()
	}()
	c.Conn.SetReadLimit(1024)
	c.Conn.SetReadDeadline(time.Now().Add(pongWait))
	c.Conn.SetPongHandler(func(string) error {
		c.Conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})
	for {
		_, message, err := c.Conn.ReadMessage()
		if err != nil {
			config.Logger.Println("WS read error:", err)
			break
		}
		if !c.RateLimiter.Allow() {
			c.Close(websocket.ClosePolicyViolation, "rate limit exceeded")
			break

		}
		var event Event
		if err := json.Unmarshal(message, &event); err != nil {
			c.SendError("Invalid event")
			return
		}
		HandleEvent(c, event)
	}
}
func (c *Client) SendError(message string) {
	error := map[string]interface{}{
		"type": "error",
		"text": message,
	}
	c.SendJSON(error)
}
func (c *Client) SendJSON(v interface{}) {
	data, err := json.Marshal(v)
	if err != nil {
		config.Logger.Printf(err.Error())
		return
	}
	c.Send(data)
}
func (c *Client) Send(data []byte) {
	select {
	case c.send <- data:
	default:
		c.Close(websocket.ClosePolicyViolation, "client too slow")
	}
}
func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		c.Conn.Close()
		ticker.Stop()
	}()

	for {
		select {
		case message, ok := <-c.send:
			c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			err := c.Conn.WriteMessage(websocket.TextMessage, message)
			if err != nil {
				return
			}
		case <-ticker.C:
			c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}

		}
	}
}
