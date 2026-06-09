package models

type KYC struct {
	ApplicantID string `json:"applicantId"`

	ReviewStatus string `json:"reviewStatus,omitempty"`

	ReviewAnswer string `json:"reviewAnswer,omitempty"`

	AccessToken string `json:"token,omitempty"`
}
