package clients

import (
	"bytes"
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/url"
	"strconv"
	"time"
)

const (
	SumsubSandboxURL   = "https://api.sandbox.sumsub.com"
	SumsubBaseURL      = "https://api.sumsub.com"
	defaultHTTPTimeout = 30 * time.Second
	maxRetries         = 3
	retryBaseWait      = 300 * time.Millisecond
)

var DefaultClient *SumsubClient

type ISumsubClient interface {
	CreateApplicant(ctx context.Context, externalUserID, levelName string) (string, error)
	GetApplicantByExternalUserID(ctx context.Context, externalUserID string) (string, error)
	GetAccessToken(ctx context.Context, externalUserID, levelName string) (string, error)
	GetApplicantStatus(ctx context.Context, applicantID string) (*ApplicantReview, error)
}

type SumsubClient struct {
	apiKey     string
	secretKey  string
	baseURL    string
	httpClient *http.Client
}

type SumsubAPIError struct {
	HTTPStatus  int    `json:"-"`
	Code        int    `json:"code"`
	Description string `json:"description"`
}

func (e *SumsubAPIError) Error() string {
	return fmt.Sprintf("sumsub API error (http=%d code=%d): %s", e.HTTPStatus, e.Code, e.Description)
}

type ApplicantReview struct {
	ReviewStatus string
	ReviewAnswer string
}

type applicantOneResponse struct {
	ID             string `json:"id"`
	ExternalUserID string `json:"externalUserId"`
	Review         struct {
		ReviewStatus string `json:"reviewStatus"`
		ReviewResult *struct {
			ReviewAnswer string `json:"reviewAnswer"`
		} `json:"reviewResult"`
	} `json:"review"`
}

func NewSumsubClient(apiKey, secretKey string, useSandbox bool) *SumsubClient {
	baseURL := SumsubBaseURL
	if useSandbox {
		baseURL = SumsubSandboxURL
	}
	c := &SumsubClient{
		apiKey:    apiKey,
		secretKey: secretKey,
		baseURL:   baseURL,
		httpClient: &http.Client{
			Timeout: defaultHTTPTimeout,
		},
	}
	DefaultClient = c
	return c
}

func (c *SumsubClient) signRequest(timestamp, method, path string, body []byte) string {
	msg := timestamp + method + path + string(body)
	h := hmac.New(sha256.New, []byte(c.secretKey))
	h.Write([]byte(msg))
	return hex.EncodeToString(h.Sum(nil))
}

func isRetryableError(err error) bool {
	var apiErr *SumsubAPIError
	if errors.As(err, &apiErr) {
		return false
	}
	var netErr net.Error
	if errors.As(err, &netErr) && netErr.Timeout() {
		return true
	}
	return false
}

func (c *SumsubClient) sendRequest(ctx context.Context, method, path string, bodyData interface{}) ([]byte, error) {
	var bodyBytes []byte
	if bodyData != nil {
		var err error
		bodyBytes, err = json.Marshal(bodyData)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal request body: %w", err)
		}
	}

	var lastErr error
	for attempt := 0; attempt < maxRetries; attempt++ {
		if attempt > 0 {
			wait := retryBaseWait * (1 << uint(attempt-1))
			select {
			case <-ctx.Done():
				return nil, ctx.Err()
			case <-time.After(wait):
			}
		}

		result, err := c.doRequest(ctx, method, path, bodyBytes)
		if err == nil {
			return result, nil
		}
		if !isRetryableError(err) {
			return nil, err
		}
		lastErr = err
	}
	return nil, fmt.Errorf("sumsub request failed after %d attempts: %w", maxRetries, lastErr)
}

func (c *SumsubClient) doRequest(ctx context.Context, method, path string, bodyBytes []byte) ([]byte, error) {
	var reqBody io.Reader
	if len(bodyBytes) > 0 {
		reqBody = bytes.NewBuffer(bodyBytes)
	} else {
		reqBody = http.NoBody
	}

	req, err := http.NewRequestWithContext(ctx, method, c.baseURL+path, reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to build request: %w", err)
	}

	timestamp := strconv.FormatInt(time.Now().Unix(), 10)
	signature := c.signRequest(timestamp, method, path, bodyBytes)

	req.Header.Set("X-App-Token", c.apiKey)
	req.Header.Set("X-App-Access-Sig", signature)
	req.Header.Set("X-App-Access-Ts", timestamp)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode >= 400 {
		var apiErr SumsubAPIError
		if jsonErr := json.Unmarshal(respBody, &apiErr); jsonErr == nil && apiErr.Description != "" {
			apiErr.HTTPStatus = resp.StatusCode
			return nil, &apiErr
		}
		return nil, fmt.Errorf("sumsub API error (status %d): %s", resp.StatusCode, string(respBody))
	}

	return respBody, nil
}

type createApplicantRequest struct {
	ExternalUserID string `json:"externalUserId"`
}

type createApplicantResponse struct {
	ID string `json:"id"`
}

type accessTokenResponse struct {
	Token string `json:"token"`
}

func (c *SumsubClient) CreateApplicant(ctx context.Context, externalUserID, levelName string) (string, error) {
	path := "/resources/applicants?levelName=" + url.QueryEscape(levelName)
	payload := createApplicantRequest{ExternalUserID: externalUserID}

	respBytes, err := c.sendRequest(ctx, "POST", path, payload)
	if err != nil {
		return "", fmt.Errorf("CreateApplicant: %w", err)
	}

	var result createApplicantResponse
	if err := json.Unmarshal(respBytes, &result); err != nil {
		return "", fmt.Errorf("CreateApplicant: failed to parse response: %w", err)
	}
	if result.ID == "" {
		return "", fmt.Errorf("CreateApplicant: empty applicant ID in response")
	}
	return result.ID, nil
}

func (c *SumsubClient) GetApplicantByExternalUserID(ctx context.Context, externalUserID string) (string, error) {
	path := "/resources/applicants/-;externalUserId=" + url.QueryEscape(externalUserID) + "/one"

	respBytes, err := c.sendRequest(ctx, "GET", path, nil)
	if err != nil {
		var apiErr *SumsubAPIError
		if errors.As(err, &apiErr) && apiErr.HTTPStatus == 404 {
			return "", nil
		}
		return "", fmt.Errorf("GetApplicantByExternalUserID: %w", err)
	}

	var result applicantOneResponse
	if err := json.Unmarshal(respBytes, &result); err != nil {
		return "", fmt.Errorf("GetApplicantByExternalUserID: failed to parse response: %w", err)
	}
	return result.ID, nil
}

func (c *SumsubClient) GetAccessToken(ctx context.Context, externalUserID, levelName string) (string, error) {
	path := "/resources/accessTokens?userId=" + url.QueryEscape(externalUserID) +
		"&levelName=" + url.QueryEscape(levelName)

	respBytes, err := c.sendRequest(ctx, "POST", path, nil)
	if err != nil {
		return "", fmt.Errorf("GetAccessToken: %w", err)
	}

	var result accessTokenResponse
	if err := json.Unmarshal(respBytes, &result); err != nil {
		return "", fmt.Errorf("GetAccessToken: failed to parse response: %w", err)
	}
	if result.Token == "" {
		return "", fmt.Errorf("GetAccessToken: empty token in response")
	}
	return result.Token, nil
}

func (c *SumsubClient) GetApplicantStatus(ctx context.Context, applicantID string) (*ApplicantReview, error) {
	path := "/resources/applicants/" + url.PathEscape(applicantID) + "/one"

	respBytes, err := c.sendRequest(ctx, "GET", path, nil)
	if err != nil {
		return nil, fmt.Errorf("GetApplicantStatus: %w", err)
	}

	var result applicantOneResponse
	if err := json.Unmarshal(respBytes, &result); err != nil {
		return nil, fmt.Errorf("GetApplicantStatus: failed to parse response: %w", err)
	}

	review := &ApplicantReview{
		ReviewStatus: result.Review.ReviewStatus,
	}
	if result.Review.ReviewResult != nil {
		review.ReviewAnswer = result.Review.ReviewResult.ReviewAnswer
	}
	return review, nil
}
