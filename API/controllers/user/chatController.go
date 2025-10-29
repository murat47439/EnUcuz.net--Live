package user

import (
	"Store-Dio/config"
	"Store-Dio/models"
	"Store-Dio/services/chat"
	"context"
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
)

type ChatController struct {
	ChatService *chat.ChatService
}

func NewChatController(service *chat.ChatService) *ChatController {
	return &ChatController{ChatService: service}
}

func (cc *ChatController) CheckChat(w http.ResponseWriter, r *http.Request) {
	config.Logger.Printf("CheckChat request started")

	userID, _, ok := GetUserIDFromContext(r)
	if !ok {
		config.Logger.Printf("CheckChat error: Unauthorized access")
		RespondWithError(w, http.StatusUnauthorized, "Yetkisiz erişim")
		return
	}

	prod_id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		config.Logger.Printf("CheckChat error: Invalid product ID - %v", err)
		RespondWithError(w, http.StatusBadRequest, "Geçersiz ürün ID'si")
		return
	}

	ctx := r.Context()
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	exists, err := cc.ChatService.CheckChat(ctx, userID, prod_id)
	if err != nil {
		config.Logger.Printf("CheckChat service error: %v", err)
		RespondWithError(w, http.StatusInternalServerError, "Sohbet kontrolü yapılırken hata oluştu")
		return
	}

	config.Logger.Printf("CheckChat success: User %d, Product %d, Exists: %v", userID, prod_id, exists)
	RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"chat_exists": exists,
	})
}
func (cc *ChatController) NewChat(w http.ResponseWriter, r *http.Request) {
	config.Logger.Printf("NewChat request started")

	userID, _, ok := GetUserIDFromContext(r)
	if !ok {
		config.Logger.Printf("NewChat error: Unauthorized access")
		RespondWithError(w, http.StatusUnauthorized, "Yetkisiz erişim")
		return
	}

	var model models.NewChat
	err := json.NewDecoder(r.Body).Decode(&model)
	if err != nil {
		config.Logger.Printf("NewChat error: Invalid request data - %v", err)
		RespondWithError(w, http.StatusBadRequest, "Geçersiz veri formatı")
		return
	}
	defer r.Body.Close()

	model.Chat.Sender = userID
	ctx := r.Context()
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	data, mes, err := cc.ChatService.NewChat(ctx, &model.Chat, model.Message)
	if err != nil {
		config.Logger.Printf("NewChat service error: %v", err)
		RespondWithError(w, http.StatusInternalServerError, "Yeni sohbet oluşturulurken hata oluştu")
		return
	}

	config.Logger.Printf("NewChat success: Chat created for user %d", userID)
	RespondWithJSON(w, http.StatusCreated, map[string]interface{}{
		"message": mes,
		"chat":    data,
	})
}
func (cc *ChatController) NewMessage(w http.ResponseWriter, r *http.Request) {
	config.Logger.Printf("NewMessage request started")

	userID, _, ok := GetUserIDFromContext(r)
	if !ok {
		config.Logger.Printf("NewMessage error: Unauthorized access")
		RespondWithError(w, http.StatusUnauthorized, "Yetkisiz erişim")
		return
	}

	var model models.Message
	err := json.NewDecoder(r.Body).Decode(&model)
	if err != nil {
		config.Logger.Printf("NewMessage error: Invalid request data - %v", err)
		RespondWithError(w, http.StatusBadRequest, "Geçersiz veri formatı")
		return
	}
	defer r.Body.Close()

	model.Sender = userID
	ctx := r.Context()
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	mes, err := cc.ChatService.NewMessage(ctx, &model)
	if err != nil {
		config.Logger.Printf("NewMessage service error: %v", err)
		RespondWithError(w, http.StatusInternalServerError, "Mesaj gönderilirken hata oluştu")
		return
	}

	config.Logger.Printf("NewMessage success: Message sent by user %d", userID)
	RespondWithJSON(w, http.StatusCreated, map[string]interface{}{
		"message": mes,
	})
}
func (cc *ChatController) GetChat(w http.ResponseWriter, r *http.Request) {
	config.Logger.Printf("GetChat request started")

	userID, _, ok := GetUserIDFromContext(r)
	if !ok {
		config.Logger.Printf("GetChat error: Unauthorized access")
		RespondWithError(w, http.StatusUnauthorized, "Yetkisiz erişim")
		return
	}

	chatID, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		config.Logger.Printf("GetChat error: Invalid chat ID - %v", err)
		RespondWithError(w, http.StatusBadRequest, "Geçersiz sohbet ID'si")
		return
	}

	ctx := r.Context()
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	messages, err := cc.ChatService.GetChat(ctx, chatID, userID)
	if err != nil {
		config.Logger.Printf("GetChat service error: %v", err)
		RespondWithError(w, http.StatusInternalServerError, "Sohbet mesajları yüklenirken hata oluştu")
		return
	}

	config.Logger.Printf("GetChat success: %d messages retrieved for chat %d", len(messages), chatID)
	RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"messages": messages,
	})
}
func (cc *ChatController) GetChats(w http.ResponseWriter, r *http.Request) {
	config.Logger.Printf("GetChats request started")

	userID, _, ok := GetUserIDFromContext(r)
	if !ok {
		config.Logger.Printf("GetChats error: Unauthorized access")
		RespondWithError(w, http.StatusUnauthorized, "Yetkisiz erişim")
		return
	}

	query := r.URL.Query()
	page, err := strconv.Atoi(query.Get("page"))
	if err != nil {
		page = 1
	}

	config.Logger.Printf("GetChats parameters: userID=%d, page=%d", userID, page)

	ctx := r.Context()
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	data, err := cc.ChatService.GetChats(ctx, userID, page)
	if err != nil {
		config.Logger.Printf("GetChats service error: %v", err)
		RespondWithError(w, http.StatusInternalServerError, "Sohbetler yüklenirken hata oluştu")
		return
	}

	config.Logger.Printf("GetChats success: %d chats retrieved for user %d", len(data), userID)
	RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"chats": data,
		"pagination": map[string]interface{}{
			"page": page,
		},
	})
}
