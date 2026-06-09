package models

// KYC represents the KYC verification state of a user.
type KYC struct {
	// ApplicantID is the Sumsub applicant identifier.
	ApplicantID string `json:"applicantId"`

	// ReviewStatus is the lifecycle stage reported by Sumsub:
	// "init", "pending", "queued", "completed", "onHold".
	ReviewStatus string `json:"reviewStatus,omitempty"`

	// ReviewAnswer is the final decision once ReviewStatus == "completed":
	// "GREEN" (approved) or "RED" (rejected).
	ReviewAnswer string `json:"reviewAnswer,omitempty"`

	// AccessToken is the short-lived Sumsub WebSDK token.
	// Only present in the CreateKYC response; never returned by GetKYC.
	AccessToken string `json:"token,omitempty"`
}
