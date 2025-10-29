package admin

import (
	"Store-Dio/config"
	"encoding/json"
	"net/http"
)

func RespondWithError(w http.ResponseWriter, code int, message string) {
	config.Logger.Printf("Admin error response: %d - %s", code, message)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": false,
		"message": message,
		"data":    nil,
	})
}

func RespondWithJSON(w http.ResponseWriter, code int, payload interface{}) {
	config.Logger.Printf("Admin success response: %d", code)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "İşlem başarılı",
		"data":    payload,
	})
}
