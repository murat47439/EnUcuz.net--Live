package db

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
)

type TxStarter interface {
	BeginTxx(ctx context.Context, opts *sql.TxOptions) (*sqlx.Tx, error)
}
