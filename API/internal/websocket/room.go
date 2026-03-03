package websocket

type Room struct {
	ID         string
	clients    map[*Client]bool
	register   chan *Client
	unregister chan *Client
	broadcast  chan []byte
}

func NewRoom(id string) *Room {
	return &Room{
		ID:         id,
		clients:    make(map[*Client]bool),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		broadcast:  make(chan []byte),
	}
}

func (r *Room) Run() {
	for {
		select {
		case client := <-r.register:
			r.clients[client] = true
		case client := <-r.unregister:
			if _, ok := r.clients[client]; ok {
				delete(r.clients, client)
			}
		case message := <-r.broadcast:
			for client := range r.clients {
				select {
				case client.send <- message:
				default:
					delete(r.clients, client)
				}
			}
		}
	}
}
