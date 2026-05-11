package repo

import (
	"Store-Dio/models"
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type SessionRepo struct {
	db *sqlx.DB
}

func NewSessionRepo(db *sqlx.DB) *SessionRepo {
	return &SessionRepo{db: db}
}

func (sr *SessionRepo) NewSession(ctx context.Context, session models.NewSession) error {
	query := `INSERT INTO users.sessions(user_id, ip_address, user_agent, token) VALUES($1, $2, $3, $4)`
	_, err := sr.db.ExecContext(ctx, query, session.UserId, session.IpAddress, session.UserAgent, session.Token)
	if err != nil {
		return err
	}
	return nil
}

func (sr *SessionRepo) GetActiveSession(ctx context.Context, user_id int) ([]*models.Session, error) {
	var sessions []*models.Session
	query := `SELECT s.id, s.user_id, s.started_at, s.ip_address, s.last_activity_at , s.is_active, s.user_agent, s.expires_at FROM users.sessions s WHERE s.user_id = $1 AND expires_at > NOW() AND is_active = true`
	rows, err := sr.db.QueryxContext(ctx, query, user_id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var s models.Session
		if err := rows.StructScan(&s); err != nil {
			return nil, fmt.Errorf("Rows error : %s", err.Error())
		}
		sessions = append(sessions, &s)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("Rows error : %s", err.Error())
	}
	return sessions, nil

}
func (sr *SessionRepo) ShutdownSession(ctx context.Context, token string, user_id int) error {
	query := `UPDATE users.sessions SET expires_at = NOW(), is_active = false WHERE token = $1 AND is_active = true AND user_id = $2`

	res, err := sr.db.ExecContext(ctx, query, token, user_id)
	if err != nil {
		return err
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("Session not found")
	}
	return nil
}
func (sr *SessionRepo) DropSession(ctx context.Context, user_id int, id uuid.UUID) error {
	query := `UPDATE users.sessions SET expires_at = NOW(), is_active = false WHERE id = $1 AND is_active = true AND user_id = $2`

	res, err := sr.db.ExecContext(ctx, query, id, user_id)
	if err != nil {
		return err
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("Session not found")
	}
	return nil
}
