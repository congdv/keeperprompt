package models

import (
	"database/sql"
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID           uuid.UUID      `db:"id" json:"id"`
	Email        string         `db:"email" json:"email"`
	PasswordHash sql.NullString `db:"password_hash" json:"-"`
	Provider     sql.NullString `db:"provider" json:"-"`
	ProviderID   sql.NullString `db:"provider_id" json:"-"`
	CreatedAt    time.Time      `db:"created_at" json:"created_at"`
	UpdatedAt    time.Time      `db:"updated_at" json:"updated_at"`
}

type Role struct {
	ID   int    `db:"id" json:"id"`
	Name string `db:"name" json:"name"`
}

type RefreshToken struct {
	ID        uuid.UUID `db:"id"`
	UserID    uuid.UUID `db:"user_id"`
	JTI       uuid.UUID `db:"jti"`
	IsRevoked bool      `db:"is_revoked"`
	ExpiresAt time.Time `db:"expires_at"`
	CreatedAt time.Time `db:"created_at"`
}

type AuthUser struct {
	User  User     `json:"user"`
	Roles []string `json:"roles"`
}
