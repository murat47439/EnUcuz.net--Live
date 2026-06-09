package user

import (
	"Store-Dio/config"
	"Store-Dio/models"
	"Store-Dio/services/kyc"
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"crypto/sha512"
	"encoding/hex"
	"encoding/json"
	"hash"
	"io"
	"net/http"
	"strings"
	"time"
)

const (
	maxWebhookBodyBytes    = 1 << 20
	webhookMaxAgeDur       = 5 * time.Minute
	algHMACSHA256          = "HMAC_SHA256_HEX"
	algHMACSHA512          = "HMAC_SHA512_HEX"
	eventApplicantReviewed = "applicantReviewed"
	eventApplicantPending  = "applicantPending"
	eventApplicantOnHold   = "applicantOnHold"
)

type WebhookController struct {
	kycService *kyc.KYCService
	secretKey  string
}

func NewWebhookController(kycService *kyc.KYCService) *WebhookController {
	return &WebhookController{
		kycService: kycService,
		secretKey:  config.SUMSUB_SECRET_KEY,
	}
}

type sumsubWebhookPayload struct {
	ApplicantID    string `json:"applicantId"`
	ExternalUserID string `json:"externalUserId"`
	CorrelationID  string `json:"correlationId"`
	Type           string `json:"type"`
	ReviewStatus   string `json:"reviewStatus"`
	CreatedAt      string `json:"createdAt"`
	ReviewResult   *struct {
		ReviewAnswer     string `json:"reviewAnswer"`
		ReviewRejectType string `json:"reviewRejectType"`
	} `json:"reviewResult"`
}

func (wc *WebhookController) verifySignature(body []byte, alg, signature string) bool {
	sig := strings.TrimPrefix(signature, "sha256=")

	var h hash.Hash
	switch strings.ToUpper(alg) {
	case algHMACSHA512:
		h = hmac.New(sha512.New, []byte(wc.secretKey))
	default:
		h = hmac.New(sha256.New, []byte(wc.secretKey))
	}
	h.Write(body)

	sigBytes, err := hex.DecodeString(sig)
	if err != nil {
		return false
	}
	return hmac.Equal(h.Sum(nil), sigBytes)
}

func (wc *WebhookController) HandleWebhook(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(io.LimitReader(r.Body, maxWebhookBodyBytes))
	if err != nil {
		config.Logger.Printf("webhook: failed to read body: %v", err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	alg := r.Header.Get("X-Payload-Digest-Alg")
	sig := r.Header.Get("X-Payload-Digest")
	if sig == "" {
		sig = r.Header.Get("X-Hmac-Signature")
	}

	if !wc.verifySignature(body, alg, sig) {
		config.Logger.Printf("webhook: invalid HMAC signature — possible spoofed request")
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	var payload sumsubWebhookPayload
	if err := json.Unmarshal(body, &payload); err != nil {
		config.Logger.Printf("webhook: failed to parse payload: %v", err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	config.Logger.Printf("webhook: received event type=%s applicantId=%s correlationId=%s status=%s",
		payload.Type, payload.ApplicantID, payload.CorrelationID, payload.ReviewStatus)

	if payload.CreatedAt != "" {
		ts, err := time.Parse(time.RFC3339, payload.CreatedAt)
		if err == nil && time.Since(ts) > webhookMaxAgeDur {
			config.Logger.Printf("webhook: stale event rejected correlationId=%s createdAt=%s",
				payload.CorrelationID, payload.CreatedAt)
			w.WriteHeader(http.StatusOK)
			return
		}
	}

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	var status models.VerifiedStatus
	var shouldUpdate bool

	switch payload.Type {
	case eventApplicantReviewed:
		if payload.ReviewStatus == "completed" && payload.ReviewResult != nil {
			shouldUpdate = true
			switch payload.ReviewResult.ReviewAnswer {
			case "GREEN":
				status = models.VerifiedStatusApproved
			case "RED":
				status = models.VerifiedStatusRejected
			case "YELLOW":
				status = models.VerifiedStatusRetry
			default:
				status = models.VerifiedStatusUnverified
			}
		}

	case eventApplicantPending, eventApplicantOnHold:
		shouldUpdate = true
		status = models.VerifiedStatusPending

	default:
		// Other events are acknowledged with 200 OK without updating database
		shouldUpdate = false
	}

	if shouldUpdate {
		if err := wc.kycService.UpdateVerificationStatus(ctx, payload.ApplicantID, status); err != nil {
			config.Logger.Printf("webhook: failed to update status applicantId=%s status=%d: %v",
				payload.ApplicantID, status, err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		config.Logger.Printf("webhook: verification status updated successfully applicantId=%s status=%d",
			payload.ApplicantID, status)
	}

	w.WriteHeader(http.StatusOK)
}
