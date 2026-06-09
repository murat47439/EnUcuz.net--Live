package user

import (
	"Store-Dio/config"
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
	maxWebhookBodyBytes  = 1 << 20
	webhookMaxAgeDur     = 5 * time.Minute
	algHMACSHA256        = "HMAC_SHA256_HEX"
	algHMACSHA512        = "HMAC_SHA512_HEX"
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

// verifySignature validates the Sumsub webhook HMAC digest.
// Per Sumsub documentation: X-Payload-Digest = HMAC(secretKey, rawBody).
// The algorithm is specified in X-Payload-Digest-Alg (default: HMAC_SHA256_HEX).
// Timestamp is NOT part of the Sumsub signature — replay protection is handled
// separately via createdAt freshness check and correlationId deduplication.
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

	switch payload.Type {
	case eventApplicantReviewed:
		if payload.ReviewStatus != "completed" || payload.ReviewResult == nil {
			w.WriteHeader(http.StatusOK)
			return
		}
		wc.handleReviewCompleted(w, ctx, &payload)

	case eventApplicantPending, eventApplicantOnHold:
		config.Logger.Printf("webhook: applicant lifecycle event type=%s applicantId=%s correlationId=%s",
			payload.Type, payload.ApplicantID, payload.CorrelationID)
		w.WriteHeader(http.StatusOK)

	default:
		w.WriteHeader(http.StatusOK)
	}
}

func (wc *WebhookController) handleReviewCompleted(w http.ResponseWriter, ctx context.Context, payload *sumsubWebhookPayload) {
	isNew, err := wc.kycService.MarkWebhookProcessed(ctx, payload.CorrelationID)
	if err != nil {
		config.Logger.Printf("webhook: replay check failed correlationId=%s applicantId=%s: %v",
			payload.CorrelationID, payload.ApplicantID, err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	if !isNew {
		config.Logger.Printf("webhook: duplicate event ignored correlationId=%s applicantId=%s",
			payload.CorrelationID, payload.ApplicantID)
		w.WriteHeader(http.StatusOK)
		return
	}

	answer := payload.ReviewResult.ReviewAnswer
	rejectType := payload.ReviewResult.ReviewRejectType

	if err := wc.kycService.UpdateVerificationStatus(ctx, payload.ApplicantID, answer); err != nil {
		config.Logger.Printf("webhook: failed to update status correlationId=%s applicantId=%s answer=%s: %v",
			payload.CorrelationID, payload.ApplicantID, answer, err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	config.Logger.Printf("webhook: verification updated correlationId=%s applicantId=%s answer=%s rejectType=%s",
		payload.CorrelationID, payload.ApplicantID, answer, rejectType)
	w.WriteHeader(http.StatusOK)
}
