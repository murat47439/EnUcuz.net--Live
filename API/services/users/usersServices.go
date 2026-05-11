package users

import (
	"Store-Dio/config"
	"Store-Dio/models"
	"Store-Dio/repo"
	"context"
	"fmt"

	"github.com/google/uuid"
)

type UserService struct {
	UserRepo    *repo.UserRepo
	SessionRepo *repo.SessionRepo
}

func NewUserService(userRepo *repo.UserRepo, sessionRepo *repo.SessionRepo) *UserService {
	return &UserService{UserRepo: userRepo, SessionRepo: sessionRepo}
}

func (s *UserService) CreateUser(ctx context.Context, user models.NewUser) (models.NewUser, error) {

	if user.Name == "" || user.Email == "" || user.Surname == "" || user.Password == "" || user.Kvkk == false {
		return models.NewUser{}, fmt.Errorf("Some data is empty")
	}

	existEmail, err := s.UserRepo.CheckEmailExists(ctx, user.Email)

	if err != nil {
		return models.NewUser{}, fmt.Errorf("CheckEmailExists error : %v", err)
	}
	if existEmail {
		return models.NewUser{}, fmt.Errorf("Email already exists")
	}

	_, err = s.UserRepo.CreateUser(ctx, user)

	if err != nil {
		return models.NewUser{}, fmt.Errorf("Create User error: %v", err)
	}

	return user, nil
}
func (s *UserService) Login(ctx context.Context, user models.User, session models.NewSession) (string, string, *models.User, error) {

	userdata, err := s.UserRepo.Login(ctx, user.Email, user.Password)

	if err != nil {
		return "", "", nil, err
	}
	accessToken, refreshToken, err := s.UserRepo.NewTokens(ctx, userdata.ID, userdata.Role)

	if err != nil {
		return "", "", nil, err
	}
	session.Token = s.UserRepo.HashRefreshToken(refreshToken, config.REFRESH_TOKEN_SECRET)
	session.UserId = userdata.ID
	err = s.SessionRepo.NewSession(ctx, session)

	if err != nil {
		return "", "", nil, err
	}

	return accessToken, refreshToken, userdata, nil

}
func (s *UserService) Logout(ctx context.Context, token string, user_id int) (bool, error) {
	if token == "" || user_id == 0 {
		return false, fmt.Errorf("Invalid data")
	}
	refreshTokenHash := s.UserRepo.HashRefreshToken(token, config.REFRESH_TOKEN_SECRET)
	err := s.SessionRepo.ShutdownSession(ctx, refreshTokenHash, user_id)
	if err != nil {
		return false, err
	}
	return true, nil
}
func (s *UserService) GetSessions(ctx context.Context, user_id int) ([]*models.Session, error) {
	if user_id == 0 {
		return nil, fmt.Errorf("User id 0")
	}
	session, err := s.SessionRepo.GetActiveSession(ctx, user_id)
	if err != nil {
		return nil, err
	}
	return session, nil
}
func (s *UserService) DropSession(ctx context.Context, user_id int, id uuid.UUID) error {
	if user_id == 0 || id == uuid.Nil {
		return fmt.Errorf("Invalid data")
	}
	err := s.SessionRepo.DropSession(ctx, user_id, id)
	if err != nil {
		return err
	}
	return nil
}
func (s *UserService) Update(ctx context.Context, user *models.User) (*models.User, error) {
	if user.ID == 0 {
		return nil, fmt.Errorf("User not found")
	}
	result, err := s.UserRepo.Update(ctx, user)

	if err != nil {
		return nil, err
	}
	return result, nil
}

func (s *UserService) GetUserDataByID(ctx context.Context, id int) (*models.User, error) {
	if id == 0 {
		return nil, fmt.Errorf("Invalid")
	}
	user, err := s.UserRepo.GetUserDataByID(ctx, id)

	if err != nil {
		return nil, err
	}
	return user, nil
}
func (s *UserService) RefreshAccessToken(ctx context.Context, token string) (string, string, error) {
	if token == "" {
		return "", "", fmt.Errorf("Invalid token")
	}
	userID, role, refreshToken, err := s.UserRepo.RestoreRefreshToken(ctx, token)

	if err != nil {
		return "", "", err
	}
	accessToken, err := s.UserRepo.GenerateAccessToken(userID, role)

	if err != nil {
		return "", "", err
	}
	return accessToken, refreshToken, nil
}
