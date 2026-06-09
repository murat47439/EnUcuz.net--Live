package kyc

import (
	"Store-Dio/clients"
	"Store-Dio/config"
	"Store-Dio/models"
	"Store-Dio/repo"
	"context"
	"fmt"
	"strconv"
)

const (
	defaultLevelName   = "id-and-liveness"
	reviewAnswerGreen  = "GREEN"
	reviewAnswerRed    = "RED"
	reviewAnswerYellow = "YELLOW"
)

type KYCService struct {
	userRepo *repo.UserRepo
	sumsub   clients.ISumsubClient
}

func NewKYCService(userRepo *repo.UserRepo, sumsub clients.ISumsubClient) *KYCService {
	return &KYCService{
		userRepo: userRepo,
		sumsub:   sumsub,
	}
}

func (s *KYCService) CreateKYC(ctx context.Context, userID int) (*models.KYC, error) {
	applicantID, err := s.getOrCreateApplicant(ctx, userID)
	if err != nil {
		return nil, err
	}

	token, err := s.sumsub.GetAccessToken(ctx, strconv.Itoa(userID), defaultLevelName)
	if err != nil {
		return nil, fmt.Errorf("failed to get SDK access token: %w", err)
	}

	return &models.KYC{
		ApplicantID: applicantID,
		AccessToken: token,
	}, nil
}

func (s *KYCService) getOrCreateApplicant(ctx context.Context, userID int) (string, error) {
	tx, err := s.userRepo.BeginTx(ctx)
	if err != nil {
		return "", fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer func() { _ = tx.Rollback() }()

	user, err := s.userRepo.GetUserDataByIDForUpdate(ctx, tx, userID)
	if err != nil {
		return "", fmt.Errorf("user not found: %w", err)
	}

	if user.ApplicantID != "" {
		if err := tx.Commit(); err != nil {
			return "", fmt.Errorf("failed to commit: %w", err)
		}
		return user.ApplicantID, nil
	}

	externalID := strconv.Itoa(userID)

	applicantID, err := s.sumsub.GetApplicantByExternalUserID(ctx, externalID)
	if err != nil {
		return "", fmt.Errorf("failed to lookup existing applicant: %w", err)
	}

	if applicantID == "" {
		applicantID, err = s.sumsub.CreateApplicant(ctx, externalID, defaultLevelName)
		if err != nil {
			return "", fmt.Errorf("failed to create applicant: %w", err)
		}
	} else {
		config.Logger.Printf("getOrCreateApplicant: recovered existing applicant for user %d: %s", userID, applicantID)
	}

	if err = s.userRepo.SetApplicantIDTx(ctx, tx, userID, applicantID); err != nil {
		return "", fmt.Errorf("failed to persist applicant ID: %w", err)
	}

	if err = tx.Commit(); err != nil {
		return "", fmt.Errorf("failed to commit: %w", err)
	}
	return applicantID, nil
}

func (s *KYCService) GetKYC(ctx context.Context, userID int) (*models.KYC, error) {
	user, err := s.userRepo.GetUserDataByID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}
	if user.ApplicantID == "" {
		return nil, fmt.Errorf("KYC not initialised for this user")
	}

	review, err := s.sumsub.GetApplicantStatus(ctx, user.ApplicantID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch applicant status: %w", err)
	}

	return &models.KYC{
		ApplicantID:  user.ApplicantID,
		ReviewStatus: review.ReviewStatus,
		ReviewAnswer: review.ReviewAnswer,
	}, nil
}

// UpdateVerificationStatus resolves the verified flag from a review answer.
// GREEN  → verified=1 (approved)
// RED    → verified=0 (rejected — final)
// YELLOW → verified=0 (rejected — may retry, per reviewRejectType on the caller side)
func (s *KYCService) UpdateVerificationStatus(ctx context.Context, applicantID, reviewAnswer string) error {
	user, err := s.userRepo.GetUserByApplicantID(ctx, applicantID)
	if err != nil {
		return fmt.Errorf("user not found for applicantId %q: %w", applicantID, err)
	}

	verified := 0
	switch reviewAnswer {
	case reviewAnswerGreen:
		verified = 1
	case reviewAnswerRed:
		config.Logger.Printf("UpdateVerificationStatus: applicantId=%s RED (final rejection)", applicantID)
	case reviewAnswerYellow:
		config.Logger.Printf("UpdateVerificationStatus: applicantId=%s YELLOW (retry allowed)", applicantID)
	default:
		config.Logger.Printf("UpdateVerificationStatus: applicantId=%s unknown answer=%q", applicantID, reviewAnswer)
	}

	return s.userRepo.UpdateVerifiedStatus(ctx, user.ID, verified)
}

func (s *KYCService) MarkWebhookProcessed(ctx context.Context, correlationID string) (bool, error) {
	if correlationID == "" {
		config.Logger.Printf("MarkWebhookProcessed: empty correlationId — processing anyway")
		return true, nil
	}
	return s.userRepo.MarkWebhookProcessed(ctx, correlationID)
}
