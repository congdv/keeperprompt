package repository

import (
	"context"
	"time"

	"github.com/congdv/go-auth/api/internal/models"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type TokenRepo interface {
	Insert(ctx context.Context, t models.RefreshToken) error
	FindByJTI(ctx context.Context, jti uuid.UUID) (models.RefreshToken, error)
	RevokeByJTI(ctx context.Context, jti uuid.UUID) error
	RevokeAllForUser(ctx context.Context, userID uuid.UUID) error
}

type tokenRepo struct {
	db *sqlx.DB
}

func NewTokenRepo(db *sqlx.DB) TokenRepo {
	return &tokenRepo{db: db}
}

func (r *tokenRepo) Insert(ctx context.Context, t models.RefreshToken) error {
	_, err := r.db.ExecContext(ctx, `
		INSERT INTO refresh_tokens (id, user_id, jti, is_revoked, expires_at, created_at)
		VALUES ($1, $2, $3, $4, $5, $6)
	`, t.ID, t.UserID, t.JTI, t.IsRevoked, t.ExpiresAt, time.Now())
	return err
}

func (r *tokenRepo) FindByJTI(ctx context.Context, jti uuid.UUID) (models.RefreshToken, error) {
	var t models.RefreshToken
	err := r.db.GetContext(ctx, &t, `
		SELECT * FROM refresh_tokens WHERE jti = $1
	`, jti)

	return t, err
}

func (r *tokenRepo) RevokeByJTI(ctx context.Context, jti uuid.UUID) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE refresh_tokens SET is_revoked = TRUE WHERE jti = $1
	`, jti)

	return err
}

func (r *tokenRepo) RevokeAllForUser(ctx context.Context, userID uuid.UUID) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE refresh_tokens SET is_revoked = TRUE WHERE user_id = $1 AND is_revoked = FALSE
	`, userID)

	return err
}
