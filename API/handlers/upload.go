package handlers

import (
	"Store-Dio/config"
	"bytes"
	"context"
	"fmt"
	"image"
	_ "image"
	"image/draw"
	"image/jpeg"
	_ "image/jpeg"
	_ "image/png"
	"io"
	"math"

	_ "golang.org/x/image/bmp"
	_ "golang.org/x/image/tiff"
	_ "golang.org/x/image/webp"

	"github.com/disintegration/imaging"
	"github.com/imagekit-developer/imagekit-go/v2"
	"github.com/imagekit-developer/imagekit-go/v2/option"
	"github.com/imagekit-developer/imagekit-go/v2/packages/param"
)

const targetMinSize = 200 * 1024
const targetMaxSize = 400 * 1024

func CompressImage(file io.Reader) (*bytes.Buffer, error) {
	// 1️⃣ Görseli aç
	img, err := imaging.Decode(file)
	if err != nil {
		return nil, fmt.Errorf("görsel açılamadı: %v", err)
	}

	// Başlangıç değerleri
	quality := 80
	scale := 1.0

	buf := new(bytes.Buffer)

	for {
		resized := img

		// Ölçekleme mantığı aynı
		if scale < 1.0 {
			w := int(math.Round(float64(img.Bounds().Dx()) * scale))
			h := int(math.Round(float64(img.Bounds().Dy()) * scale))
			resized = imaging.Resize(img, w, h, imaging.Lanczos)
		}

		// RGBA dönüşümü (orijinal mantık)
		bounds := resized.Bounds()
		dst := image.NewRGBA(bounds)
		draw.Draw(dst, bounds, resized, bounds.Min, draw.Src)

		// Buffer'a JPEG olarak kaydet
		buf.Reset()
		err = jpeg.Encode(buf, dst, &jpeg.Options{Quality: quality})
		if err != nil {
			return nil, fmt.Errorf("görsel kaydetme hatası: %v", err)
		}

		size := int64(buf.Len())

		// Boyut kontrolü
		if size >= targetMinSize && size <= targetMaxSize {
			break
		}

		// Çok büyükse kaliteyi düşür / scale uygula
		if size > targetMaxSize {
			if quality > 40 {
				quality -= 10
			} else {
				scale *= 0.85
			}
		} else if size < targetMinSize {
			if quality < 90 {
				quality += 5
			} else {
				break
			}
		}

		// Güvenlik önlemi
		if quality <= 40 && scale <= 0.6 {
			break
		}
	}

	return buf, nil
}
func UploadImage(file io.Reader, fileName string) (string, error) {
	// publicKey :=
	privateKey := config.IMAGEKIT_PRIVATE_KEY
	// urlEndpoint :=
	client := imagekit.NewClient(
		option.WithPrivateKey(privateKey), // defaults to os.LookupEnv("IMAGEKIT_PRIVATE_KEY")
	)

	filePathV2, err := CompressImage(file)
	if err != nil {
		return "", fmt.Errorf("hata: %w", err)
	}

	response, err := client.Files.Upload(context.Background(), imagekit.FileUploadParams{
		File:              filePathV2,
		FileName:          fileName,
		UseUniqueFileName: param.NewOpt(true),
		Folder:            param.NewOpt("/uploads/products"),
		IsPrivateFile:     param.NewOpt(false),
	})
	if err != nil {
		return "", fmt.Errorf("hata: %w", err)

	}
	return response.URL, nil
}
