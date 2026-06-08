package repo

import (
	"Store-Dio/config"
	"Store-Dio/models"
	"Store-Dio/utils"
	"context"
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

const (
	UserRole   = 0
	AdminRole  = 1
	SellerRole = 2
)

// USER

func (ur *UserRepo) CreateUser(ctx context.Context, user models.NewUser) (bool, error) {
	tx, err := ur.db.BeginTxx(ctx, nil)

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
			if commitErr := tx.Commit(); commitErr != nil {
				err = fmt.Errorf("transaction commit error: %w", commitErr)
			}
		}

	}()

	password, err := utils.HashPassword(user.Password)
	if err != nil {
		config.Logger.Printf("Hash Password Error")
		return false, err
	}
	user.Password = password

	query := `INSERT INTO users.users(email, phone, name, surname, gender, role, password) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id `
	var id int
	err = tx.QueryRowContext(ctx, query, user.Email, user.Phone, user.Name, user.Surname, user.Gender, models.UserRole, user.Password).Scan(&id)

	if err != nil {
		return false, fmt.Errorf("Database error : %s", err.Error())
	}
	var acceptedID []int
	if user.Contact == true {
		acceptedID = []int{1, 2, 3, 4}
	} else {
		acceptedID = []int{1, 2, 3}

	}
	query = `INSERT INTO users.user_contracts(user_id, contract_id, ip_address, user_agent ) VALUES ($1, $2, $3, $4)`
	for _, contractID := range acceptedID {
		_, err := tx.ExecContext(ctx, query, id, contractID, user.IpAddress, user.UserAgent)
		if err != nil {
			return false, err
		}
	}
	return true, nil
}

func (ur *UserRepo) Login(ctx context.Context, email string, password string) (*models.User, error) {
	if email == "" || password == "" {
		return nil, fmt.Errorf("Invalid data")
	}
	user := &models.User{}

	query := `SELECT id,email, phone, name, surname, gender, role, password FROM users.users WHERE email = $1 AND deleted_at IS NULL`
	err := ur.db.GetContext(ctx, user, query, email)

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

func (ur *UserRepo) Update(ctx context.Context, user *models.User) (*models.User, error) {
	if user.Email == "" || user.Name == "" || user.Surname == "" || user.ID == 0 {
		return nil, fmt.Errorf("Invalid data")
	}
	query := "UPDATE users.users SET name=$1 ,surname = $2 ,email = $3 ,phone = $4 ,gender = $5 WHERE id=$6"

	_, err := ur.db.ExecContext(ctx, query, user.Name, user.Surname, user.Email, user.Phone, user.Gender, user.ID)

	if err != nil {
		config.Logger.Printf("Failed to update user")
		return nil, fmt.Errorf("Failed to update user")
	}
	return user, nil
}
func (ur *UserRepo) CheckEmailExists(ctx context.Context, email string) (bool, error) {
	var exists bool

	query := "SELECT EXISTS(SELECT 1 FROM users.users WHERE email = $1 AND deleted_at IS NULL)"
	err := ur.db.GetContext(ctx, &exists, query, email)

	if err != nil {
		if err == sql.ErrNoRows {
			return false, nil
		}
		return false, err
	}

	return exists, nil
}

func (ur *UserRepo) GetUserDataByID(ctx context.Context, id int) (*models.User, error) {
	if id == 0 {
		return nil, fmt.Errorf("Invalid data")
	}
	var user models.User
	query := `SELECT id,email,phone,name,surname,gender,role FROM users.users WHERE id = $1 AND deleted_at IS NULL`

	err := ur.db.GetContext(ctx, &user, query, id)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("User not found")
		}
		return nil, err
	}
	return &user, nil
}

// REFRESH AND ACCESS

func (ur *UserRepo) NewTokens(ctx context.Context, userId int, userRole models.Role) (string, string, error) {
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
	return accessToken, refreshToken, nil

}
func (ur *UserRepo) GenerateAccessToken(userID int, userRole models.Role) (string, error) {
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
func (ur *UserRepo) RestoreRefreshToken(ctx context.Context, token string) (int, models.Role, string, error) {
	refreshHash := ur.HashRefreshToken(token, config.REFRESH_TOKEN_SECRET)

	var userID int
	var role models.Role
	query := `
    SELECT u.id, u.role
    FROM users.sessions t
    JOIN users.users u ON u.id = t.user_id
    WHERE t.token = $1 AND t.expires_at > NOW() AND t.is_active = true AND u.deleted_at IS NULL
`
	err := ur.db.QueryRowContext(ctx, query, refreshHash).Scan(&userID, &role)

	if err != nil {
		return 0, 0, "", err
	}

	_, _ = ur.db.ExecContext(ctx, `UPDATE users.sessions SET last_activity_at = NOW() WHERE token = $1`, refreshHash)

	return userID, role, token, nil
}

//ADMİN CONTROL

func (ur *UserRepo) OnlyAdmin(ctx context.Context, userID int) (bool, error) {
	query := "SELECT 1 FROM users.users WHERE role=$1 AND id = $2 AND deleted_at IS NULL"

	var tmp int
	err := ur.db.QueryRowContext(ctx, query, models.AdminRole, userID).Scan(&tmp)

	if err != nil {
		if err == sql.ErrNoRows {
			return false, nil
		}
		return false, err
	}

	return true, nil

}
