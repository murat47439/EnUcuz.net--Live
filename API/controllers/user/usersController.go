package user

import (
	"Store-Dio/config"
	"Store-Dio/models"
	"Store-Dio/services/users"
	"encoding/json"
	"net/http"
	"time"
)

type UserController struct {
	UserService *users.UserService
}

func NewUserController(us *users.UserService) *UserController {
	return &UserController{
		UserService: us,
	}
}
func (uc *UserController) CreateUser(w http.ResponseWriter, r *http.Request) {
	var user models.User

	err := json.NewDecoder(r.Body).Decode(&user)

	if err != nil {
		config.Logger.Printf("CreateUser decode error: %v", err)
		RespondWithJSON(w, http.StatusBadRequest, map[string]string{
			"error":   "Internal Server Error",
			"message": err.Error(),
		})
		return
	}
	defer r.Body.Close()

	_, err = uc.UserService.CreateUser(user)

	if err != nil {
		config.Logger.Printf("Failed to create user:  %v", err)
		RespondWithJSON(w, http.StatusBadRequest, map[string]string{
			"error":   "Internal Server Error",
			"message": err.Error(),
		})
		return
	}

	config.Logger.Printf("CreateUser success: User created")
	RespondWithJSON(w, http.StatusCreated, map[string]interface{}{
		"message": "Kullanıcı başarıyla oluşturuldu",
	})
}

func (uc *UserController) Login(w http.ResponseWriter, r *http.Request) {
	config.Logger.Printf("Login request started")

	var user models.User

	err := json.NewDecoder(r.Body).Decode(&user)

	if err != nil {
		config.Logger.Printf("Login error: Invalid request data - %v", err)
		RespondWithError(w, http.StatusBadRequest, "Geçersiz veri formatı")
		return
	}
	defer r.Body.Close()

	accessToken, refreshToken, userdata, err := uc.UserService.Login(user)

	if err != nil {
		config.Logger.Printf("Login service error: %v", err)
		RespondWithError(w, http.StatusUnauthorized, "Giriş bilgileri hatalı")
		return
	}
	http.SetCookie(w, &http.Cookie{
		Name:     "access_token",
		Value:    accessToken,
		Path:     "/api",
		Expires:  time.Now().Add(15 * time.Minute),
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteNoneMode,
	})
	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    refreshToken,
		Path:     "/api/refresh",
		Expires:  time.Now().Add(30 * 24 * time.Hour),
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteNoneMode,
	})

	config.Logger.Printf("Login success: User %d logged in", userdata.ID)
	RespondWithJSON(w, http.StatusAccepted, map[string]interface{}{
		"message": "Giriş başarılı",
		"user":    userdata,
	})
}
func (uc *UserController) Logout(w http.ResponseWriter, r *http.Request) {
	config.Logger.Printf("Logout request started")

	userID, _, ok := GetUserIDFromContext(r)
	if !ok {
		config.Logger.Printf("Logout error: Unauthorized access")
		RespondWithError(w, http.StatusUnauthorized, "Yetkisiz erişim")
		return
	}

	cookie, err := r.Cookie("refresh_token")
	if err != nil {
		http.Error(w, "Missing refresh token", http.StatusUnauthorized)
		return
	}
	token := cookie.Value

	_, err = uc.UserService.Logout(token, userID)
	if err != nil {
		config.Logger.Printf("Logout service error: %v", err)
		RespondWithError(w, http.StatusInternalServerError, "Çıkış yapılırken hata oluştu")
		return
	}
	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    "",
		Path:     "/api/refresh",
		Expires:  time.Unix(0, 0),
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteNoneMode,
	})
	http.SetCookie(w, &http.Cookie{
		Name:     "access_token",
		Value:    "",
		Path:     "/api",
		Expires:  time.Unix(0, 0),
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteNoneMode,
	})

	config.Logger.Printf("Logout success: User %d logged out", userID)
	RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"message": "Çıkış başarılı",
	})

}
func (uc *UserController) GetUserData(w http.ResponseWriter, r *http.Request) {
	config.Logger.Printf("GetUserData request started")

	userID, _, ok := GetUserIDFromContext(r)
	if !ok {
		config.Logger.Printf("GetUserData error: Unauthorized access")
		RespondWithError(w, http.StatusUnauthorized, "Yetkisiz erişim")
		return
	}

	user, err := uc.UserService.GetUserDataByID(userID)
	if err != nil {
		config.Logger.Printf("GetUserData service error: %v", err)
		RespondWithError(w, http.StatusNotFound, "Kullanıcı bulunamadı")
		return
	}

	config.Logger.Printf("GetUserData success: User data retrieved for user %d", userID)
	RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"user": user,
	})
}
func (uc *UserController) Update(w http.ResponseWriter, r *http.Request) {
	config.Logger.Printf("Update request started")

	userID, role, ok := GetUserIDFromContext(r)
	if !ok {
		config.Logger.Printf("Update error: Unauthorized access")
		RespondWithError(w, http.StatusUnauthorized, "Yetkisiz erişim")
		return
	}

	var data *models.User
	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		config.Logger.Printf("Update error: Invalid request data - %v", err)
		RespondWithError(w, http.StatusBadRequest, "Geçersiz veri formatı")
		return
	}
	defer r.Body.Close()

	if role != 1 && data.ID != userID {
		config.Logger.Printf("Update error: User %d trying to update user %d", userID, data.ID)
		RespondWithError(w, http.StatusForbidden, "Bu kullanıcıyı güncelleme yetkiniz yok")
		return
	}

	user, err := uc.UserService.Update(data)
	if err != nil {
		config.Logger.Printf("Update service error: %v", err)
		RespondWithError(w, http.StatusInternalServerError, "Kullanıcı güncellenirken hata oluştu")
		return
	}

	config.Logger.Printf("Update success: User %d updated", user.ID)
	RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"user": map[string]interface{}{
			"id":      user.ID,
			"name":    user.Name,
			"surname": user.Surname,
			"email":   user.Email,
			"phone":   user.Phone,
		},
	})
}
func (uc *UserController) GetAccess(w http.ResponseWriter, r *http.Request) {
	config.Logger.Printf("GetAccess request started")

	cookie, err := r.Cookie("refresh_token")
	if err != nil {
		config.Logger.Printf("GetAccess error: No refresh token cookie")
		RespondWithError(w, http.StatusUnauthorized, "Yetkisiz erişim")
		return
	}

	refreshToken := cookie.Value
	accessToken, refreshToken, err := uc.UserService.RefreshAccessToken(refreshToken)
	if err != nil {
		config.Logger.Printf("GetAccess service error: %v", err)
		RespondWithError(w, http.StatusUnauthorized, "Token süresi dolmuş")
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "access_token",
		Value:    accessToken,
		Path:     "/api",
		Expires:  time.Now().Add(15 * time.Minute),
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteNoneMode,
	})
	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    refreshToken,
		Path:     "/api/refresh",
		Expires:  time.Now().Add(30 * 24 * time.Hour),
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteNoneMode,
	})

	config.Logger.Printf("GetAccess success: Access token refreshed")
	RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"message": "Token başarıyla yenilendi",
	})
}
