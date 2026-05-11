package models

import (
	"database/sql"

	"github.com/google/uuid"
)

type NewSession struct {
	UserId    int
	IpAddress string
	UserAgent string
	Token     string
}
type Session struct {
	ID             uuid.UUID    `db:"id" json:"ID"`
	UserId         int64        `db:"user_id" json:"UserId"`
	IpAddress      string       `json:"IpAddress" db:"ip_address"`
	UserAgent      string       `json:"UserAgent" db:"user_agent"`
	StartedAt      sql.NullTime `json:"StartedAt" db:"started_at"`
	LastActivityAt sql.NullTime `json:"LastActivityAt" db:"last_activity_at"`
	IsActive       bool         `json:"IsActive" db:"is_active"`
	ExpiresAt      sql.NullTime `json:"ExpiresAt" db:"expires_at"`
}
