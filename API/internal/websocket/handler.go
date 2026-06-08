package websocket

import (
	"Store-Dio/config"
	"Store-Dio/middleware"
	"Store-Dio/models"
	"net/http"

	"github.com/gorilla/websocket"
	"golang.org/x/time/rate"
)

var allowedOrigins = map[string]bool{
	"http://localhost:3000":          true,
	"http://localhost:3001":          true,
	"https://www.enucuz.net.tr":      true,
	"https://www.2pazar.com":      true,
	"https://2pazar.com":      true,
	"https://enucuz.net.tr":          true,
	"https://en-ucuz-net.vercel.app": true,
	"https://en-ucuz-net-git-main-murats-projects-c4a123ca.vercel.app": true,
}
var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		origin := r.Header.Get("Origin")
		return allowedOrigins[origin]
	},
}

type Handler struct {
	Hub *Hub
}

func NewHandler(hub *Hub) *Handler {
	return &Handler{
		Hub: hub,
	}
}

func (h *Handler) ServeWS(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		config.Logger.Printf("WebSocket upgrade error:", err)
		return
	}
	userID, ok := r.Context().Value(middleware.UserIDKey).(int)
	if !ok {
		msg := models.WsMessage{
			Type: "error",
			Text: "Unauthorized",
		}
		_ = conn.WriteJSON(msg)
		conn.WriteMessage(
			websocket.CloseMessage,
			websocket.FormatCloseMessage(websocket.ClosePolicyViolation, "Unauthorized"),
		)
		conn.Close()
		return
	}
	config.Logger.Printf("User connected:", userID)
	client := &Client{
		ID:          userID,
		Conn:        conn,
		Hub:         h.Hub,
		send:        make(chan []byte, 256),
		RateLimiter: rate.NewLimiter(10, 20),
		rooms:       make(map[string]*Room),
	}

	h.Hub.register <- client

	go client.writePump()
	go client.readPump()
}
