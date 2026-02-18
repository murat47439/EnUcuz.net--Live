package utils

import (
	"regexp"
	"strings"
)

var (
	regNonAlnum  = regexp.MustCompile(`[^a-z0-9]+`)
	regMultiDash = regexp.MustCompile(`-+`)
)

func Slugify(text string) string {
	text = strings.ToLower(text)

	replacer := strings.NewReplacer(
		"ç", "c", "ğ", "g", "ı", "i",
		"ö", "o", "ş", "s", "ü", "u",
		"Ç", "c", "Ğ", "g", "İ", "i",
		"Ö", "o", "Ş", "s", "Ü", "u",
	)

	text = replacer.Replace(text)

	text = regNonAlnum.ReplaceAllString(text, "-")
	text = regMultiDash.ReplaceAllString(text, "-")

	text = strings.Trim(text, "-")
	return text
}
