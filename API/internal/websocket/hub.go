package websocket

type Hub struct {
	users      map[int]map[*Client]bool
	register   chan *Client
	rooms      map[string]*Room
	unregister chan *Client
	userStatus chan userStatusRequest
	broadcast  chan []byte

	Chat ChatBridge
}

func NewHub(chat ChatBridge) *Hub {
	return &Hub{
		register:   make(chan *Client),
		unregister: make(chan *Client),
		broadcast:  make(chan []byte),
		users:      make(map[int]map[*Client]bool),
		userStatus: make(chan userStatusRequest),
		rooms:      make(map[string]*Room),
		Chat:       chat,
	}
}

type userStatusRequest struct {
	userID int
	reply  chan bool
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:

			if h.users[client.ID] == nil {
				h.users[client.ID] = make(map[*Client]bool)
			}

			h.users[client.ID][client] = true
		case client := <-h.unregister:

			if userClients, ok := h.users[client.ID]; ok {

				if _, exists := userClients[client]; exists {
					close(client.send)
					delete(userClients, client)
				}

				if len(userClients) == 0 {
					delete(h.users, client.ID)
				}
			}
		case req := <-h.userStatus:

			clients, ok := h.users[req.userID]

			req.reply <- ok && len(clients) > 0
		case message := <-h.broadcast:

			for userID, userClients := range h.users {

				for client := range userClients {

					select {

					case client.send <- message:

					default:
						close(client.send)
						delete(userClients, client)

					}

				}

				if len(userClients) == 0 {
					delete(h.users, userID)
				}

			}
		}
	}
}
func (h *Hub) IsUserOnline(userID int) bool {

	reply := make(chan bool, 1)

	h.userStatus <- userStatusRequest{
		userID: userID,
		reply:  reply,
	}

	return <-reply
}
func (h *Hub) GetRoom(roomID string) *Room {
	room, exists := h.rooms[roomID]
	if !exists {
		room = NewRoom(roomID)
		h.rooms[roomID] = room
		go room.Run()
	}
	return room
}
