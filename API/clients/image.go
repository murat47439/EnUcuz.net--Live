package clients

import (
	"Store-Dio/config"
	"Store-Dio/models"
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"time"
)

// var ImagekitClient imagekit.Client // pointer değil, struct

// func InitImagekitClient() {
// 	privateKey := config.IMAGEKIT_PRIVATE_KEY

// 	ImagekitClient = imagekit.NewClient(
// 		option.WithPrivateKey(privateKey),
// 	)

//		config.Logger.Printf("ImageKit client initialized successfully")
//	}
type ImagesClient struct {
	AccountID string
	APIToken  string
	Client    *http.Client
}

func NewImagesClient(accountID, apiToken string) *ImagesClient {
	return &ImagesClient{
		AccountID: accountID,
		APIToken:  apiToken,
		Client: &http.Client{
			Timeout: 20 * time.Second,
		},
	}
}
func (c *ImagesClient) UploadImageV2(ctx context.Context, file multipart.File, filename string) (string, string, error) {
	defer file.Close()

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	part, err := writer.CreateFormFile("file", filename)
	if err != nil {
		return "", "", err
	}

	if _, err := io.Copy(part, file); err != nil {
		return "", "", err
	}
	if err := writer.Close(); err != nil {
		return "", "", err
	}

	url := fmt.Sprintf(
		"https://api.cloudflare.com/client/v4/accounts/%s/images/v1",
		c.AccountID,
	)

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, body)
	if err != nil {
		return "", "", err
	}
	req.Header.Set("Authorization", "Bearer "+config.CLOUDFLARE_API_KEY)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	resp, err := c.Client.Do(req)
	if err != nil {
		return "", "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return "", "", fmt.Errorf("cloudflare api error : %s", resp.Status)
	}
	var result models.UploadResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", "", err
	}

	if !result.Success {
		if len(result.Errors) > 0 {
			return "", "", errors.New(result.Errors[0].Message)
		}
		return "", "", errors.New("upload failed")
	}

	return result.Result.ID, result.Result.Variants[0], nil

}
func (c *ImagesClient) DeleteImageV2(ctx context.Context, id string) (bool, error) {
	url := fmt.Sprintf("https://api.cloudflare.com/client/v4/accounts/%s/images/v1/%s", c.AccountID, id)

	req, err := http.NewRequestWithContext(ctx, http.MethodDelete, url, nil)
	if err != nil {
		return false, err
	}
	req.Header.Set("Authorization", "Bearer "+config.CLOUDFLARE_API_KEY)

	resp, err := c.Client.Do(req)
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return false, fmt.Errorf("cloudflare error: %s", body)
	}
	var result models.DeleteResponse

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return false, err
	}
	if !result.Success {
		if len(result.Errors) > 0 {
			return false, errors.New(result.Errors[0].Message)
		}
		return false, errors.New("delete failed")
	}
	return true, nil
}
