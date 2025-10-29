package utils

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
)

func GenerateRandomToken(n int) (string, error) {
	bytes := make([]byte, n)

	_, err := rand.Read(bytes)

	if err != nil {
		return "", fmt.Errorf("Could not generate random token :%v ", err)
	}
	return hex.EncodeToString(bytes), nil
}
