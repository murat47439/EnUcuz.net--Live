package clients

import (
	"Store-Dio/config"

	"github.com/imagekit-developer/imagekit-go/v2"
	"github.com/imagekit-developer/imagekit-go/v2/option"
)

var ImagekitClient imagekit.Client // pointer değil, struct

func InitImagekitClient() {
	privateKey := config.IMAGEKIT_PRIVATE_KEY

	ImagekitClient = imagekit.NewClient(
		option.WithPrivateKey(privateKey),
	)

	config.Logger.Printf("ImageKit client initialized successfully")
}
