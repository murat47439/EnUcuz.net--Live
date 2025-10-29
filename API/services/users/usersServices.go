package users

import (
	"Store-Dio/models"
	"Store-Dio/repo"
	"fmt"
)

type UserService struct {
	UserRepo *repo.UserRepo
}

func NewUserService(userRepo *repo.UserRepo) *UserService {
	return &UserService{UserRepo: userRepo}
}

func (s *UserService) CreateUser(user models.User) (models.User, error) {

	if user.Name == "" || user.Email == "" || user.Surname == "" || user.Password == "" {
		return models.User{}, fmt.Errorf("Some data is empty")
	}

	existEmail, err := s.UserRepo.CheckEmailExists(user.Email)

	if err != nil {
		return models.User{}, fmt.Errorf("CheckEmailExists error : %v", err)
	}
	if existEmail {
		return models.User{}, fmt.Errorf("Email already exists")
	}

	_, err = s.UserRepo.CreateUser(user)

	if err != nil {
		return models.User{}, fmt.Errorf("Create User error: %v", err)
	}

	return user, nil
}
func (s *UserService) Login(user models.User) (string, string, *models.User, error) {

	userdata, err := s.UserRepo.Login(user.Email, user.Password)

	if err != nil {
		return "", "", nil, err
	}
	accessToken, refreshToken, err := s.UserRepo.NewTokens(userdata.ID, userdata.Role)

	if err != nil {
		return "", "", nil, err
	}

	return accessToken, refreshToken, userdata, nil

}
func (s *UserService) Logout(token string, user_id int) (bool, error) {
	if token == "" || user_id == 0 {
		return false, fmt.Errorf("Invalid data")
	}
	_, err := s.UserRepo.Logout(user_id, token)
	if err != nil {
		return false, err
	}
	return true, nil
}
func (s *UserService) Update(user *models.User) (*models.User, error) {
	if user.ID == 0 {
		return nil, fmt.Errorf("User not found")
	}
	result, err := s.UserRepo.Update(user)

	if err != nil {
		return nil, err
	}
	return result, nil
}

func (s *UserService) GetUserDataByID(id int) (*models.User, error) {
	if id == 0 {
		return nil, fmt.Errorf("Invalid")
	}
	user, err := s.UserRepo.GetUserDataByID(id)

	if err != nil {
		return nil, err
	}
	return user, nil
}
func (s *UserService) RefreshAccessToken(token string) (string, string, error) {
	if token == "" {
		return "", "", fmt.Errorf("Invalid token")
	}
	userID, role, refreshToken, err := s.UserRepo.RestoreRefreshToken(token)

	if err != nil {
		return "", "", err
	}
	accessToken, err := s.UserRepo.GenerateAccessToken(userID, role)

	if err != nil {
		return "", "", err
	}
	return accessToken, refreshToken, nil
}
