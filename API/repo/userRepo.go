package repo

import (
	"Store-Dio/config"
	"Store-Dio/models"
	"Store-Dio/utils"
	"crypto/hmac"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/jmoiron/sqlx"
)

type UserRepo struct {
	db *sqlx.DB
}

func NewUserRepo(db *sqlx.DB) *UserRepo {
	return &UserRepo{db: db}
}

// USER

func (ur *UserRepo) CreateUser(user models.User) (bool, error) {
	tx, err := ur.db.Beginx()

	if err != nil {
		return false, fmt.Errorf("TX Error : %s", err.Error())
	}

	defer func() {
		if p := recover(); p != nil {
			_ = tx.Rollback()
			panic(p)
		} else if err != nil {
			_ = tx.Rollback()
		} else {
			err = tx.Commit()
		}

	}()

	password, err := utils.HashPassword(user.Password)
	if err != nil {
		config.Logger.Printf("Hash Password Error")
		return false, err
	}
	user.Password = password

	query := `INSERT INTO users(email, phone, name, surname, gender, role, password) VALUES($1, $2, $3, $4, $5, $6, $7)`

	_, err = tx.Exec(query, user.Email, user.Phone, user.Name, user.Surname, user.Gender, user.Role, user.Password)

	if err != nil {
		return false, fmt.Errorf("Database error : %s", err.Error())
	}
	return true, nil
}

func (ur *UserRepo) Login(email string, password string) (*models.User, error) {
	if email == "" || password == "" {
		return nil, fmt.Errorf("Invalid data")
	}
	user := &models.User{}

	query := `SELECT id,email, phone, name, surname, gender, role, password FROM users WHERE email = $1 AND deleted_at IS NULL`
	err := ur.db.Get(user, query, email)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("Kullanıcı bulunamadı")
		}
		return nil, err
	}

	err = utils.CheckPasswordHash(password, user.Password)

	if err != nil {
		return nil, fmt.Errorf("Şifre yanlış.")
	}
	user.Password = ""

	return user, nil
}
func (ur *UserRepo) Logout(userID int, refreshToken string) (bool, error) {
	if userID == 0 || refreshToken == "" {
		return false, fmt.Errorf("Invalid data")
	}
	refreshTokenHash := ur.HashRefreshToken(refreshToken, config.REFRESH_TOKEN_SECRET)

	query := "DELETE FROM tokens WHERE token = $1 AND user_id = $2"

	result, err := ur.db.Exec(query, refreshTokenHash, userID)

	if err != nil {
		return false, fmt.Errorf("Log out unsuccessfully")
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		return false, fmt.Errorf("no matching token found")
	}
	return true, nil

}
func (ur *UserRepo) Update(user *models.User) (*models.User, error) {
	if user.Email == "" || user.Name == "" || user.Surname == "" || user.ID == 0 {
		return nil, fmt.Errorf("Invalid data")
	}
	query := "UPDATE USERS SET name=$1 ,surname = $2 ,email = $3 ,phone = $4 ,gender = $5 WHERE id=$6"

	_, err := ur.db.Exec(query, user.Name, user.Surname, user.Email, user.Phone, user.Gender, user.ID)

	if err != nil {
		config.Logger.Printf("Failed to update user")
		return nil, fmt.Errorf("Failed to update user")
	}
	return user, nil
}
func (ur *UserRepo) CheckEmailExists(email string) (bool, error) {
	var exists bool

	query := "SELECT EXISTS(SELECT 1 FROM users WHERE email = $1 AND deleted_at IS NULL)"
	err := ur.db.Get(&exists, query, email)

	if err != nil {
		if err == sql.ErrNoRows {
			return false, nil
		}
		return false, err
	}

	return exists, nil
}

func (ur *UserRepo) GetUserDataByID(id int) (*models.User, error) {
	if id == 0 {
		return nil, fmt.Errorf("Invalid data")
	}
	var user models.User
	query := `SELECT id,email,phone,name,surname,gender,role FROM users WHERE id = $1 AND deleted_at IS NULL`

	err := ur.db.Get(&user, query, id)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("User not found")
		}
		return nil, err
	}
	return &user, nil
}

// REFRESH AND ACCESS

func (ur *UserRepo) NewTokens(userId, userRole int) (string, string, error) {
	if userId == 0 {
		return "", "", fmt.Errorf("Invalid data")
	}
	accessToken, err := ur.GenerateAccessToken(userId, userRole)
	if err != nil {
		return "", "", err
	}
	refreshToken, err := utils.GenerateRandomToken(32)
	if err != nil {
		return "", "", err
	}
	err = ur.StoreRefreshToken(userId, refreshToken)

	if err != nil {
		return "", "", err
	}
	return accessToken, refreshToken, nil

}
func (ur *UserRepo) GenerateAccessToken(userID, userRole int) (string, error) {
	expirationTime := time.Now().Add(15 * time.Minute)

	claims := models.AccessToken{
		UserID:   userID,
		UserRole: userRole,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	tokenstring, err := token.SignedString(config.JWT_SECRET)
	if err != nil {
		return "", err
	}
	return tokenstring, nil

}
func (ur *UserRepo) StoreRefreshToken(userID int, refresh string) error {
	if userID == 0 || refresh == "" {
		return fmt.Errorf("Invalid data.")
	}
	expiresAt := time.Now().Add(7 * 24 * time.Hour)

	hashToken := ur.HashRefreshToken(refresh, config.REFRESH_TOKEN_SECRET)

	query := `INSERT INTO tokens (user_id,token, expires_at) VALUES($1, $2, $3)`
	_, err := ur.db.Exec(query, userID, hashToken, expiresAt)
	if err != nil {
		return fmt.Errorf("Database error : %s", err.Error())
	}
	return nil
}
func (ur *UserRepo) HashRefreshToken(token string, secret []byte) string {
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(token))
	return hex.EncodeToString(mac.Sum(nil))
}
func (ur *UserRepo) CheckRefreshToken(token string, hash string, secret []byte) bool {
	return ur.HashRefreshToken(token, secret) == hash
}
func (ur *UserRepo) VerifyAccessToken(tokenStr string) (*models.AccessToken, error) {
	accessToken := &models.AccessToken{}

	token, err := jwt.ParseWithClaims(tokenStr, accessToken, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("Unexpected signing method")
		}
		return []byte(config.JWT_SECRET), nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, fmt.Errorf("Token is not valid")
	}

	return accessToken, nil
}
func (ur *UserRepo) RestoreRefreshToken(token string) (int, int, string, error) {
	refreshHash := ur.HashRefreshToken(token, config.REFRESH_TOKEN_SECRET)
	newRefresh, err := utils.GenerateRandomToken(32)
	if err != nil {
		return 0, 0, "", err
	}
	newRefreshHash := ur.HashRefreshToken(newRefresh, config.REFRESH_TOKEN_SECRET)
	if err != nil {
		return 0, 0, "", err
	}
	var userID, role int
	query := `
    UPDATE tokens t
    SET token = $1
    FROM users u
    WHERE t.token = $2 AND t.expires_at > NOW() AND u.id = t.user_id
    RETURNING t.user_id, u.role
`
	err = ur.db.QueryRow(query, newRefreshHash, refreshHash).Scan(&userID, &role)

	if err != nil {
		return 0, 0, "", err
	}
	return userID, role, newRefresh, nil
}

//ADMİN CONTROL

func (ur *UserRepo) OnlyAdmin(userID int) (bool, error) {
	stmt, err := ur.db.Prepare("SELECT 1 FROM users WHERE role=1 AND id = $1 AND deleted_at IS NULL")

	if err != nil {

		return false, err
	}
	defer stmt.Close()

	var tmp int

	err = stmt.QueryRow(userID).Scan(&tmp)

	if err != nil {
		if err == sql.ErrNoRows {
			return false, nil
		}
		return false, err
	}

	return true, nil

}
