package models

type UploadResponse struct {
	Success bool `json:"success"`
	Result  struct {
		ID       string   `json:"id"`
		Variants []string `json:"variants"`
	} `json:"result"`
	Errors []struct {
		Message string `json:"message"`
	} `json:"errors"`
}
type CFMessage struct {
	Code             int    `json:"code"`
	Message          string `json:"message"`
	DocumentationURL string `json:"documentation_url"`
	Source           struct {
		Pointer string `json:"pointer"`
	} `json:"source"`
}

type DeleteResponse struct {
	Success  bool        `json:"success"`
	Result   interface{} `json:"result"`
	Errors   []CFMessage `json:"errors"`
	Messages []CFMessage `json:"messages"`
}
