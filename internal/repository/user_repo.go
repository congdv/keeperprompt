package repository

import (
	"context"
	"database/sql"
	"strings"
	"time"

	"github.com/congdv/go-auth/api/internal/models"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type UserRepo interface {
	Create(ctx context.Context, email, passwordHash string) (models.User, error)
	CreateOAuth(ctx context.Context, email, provider, providerID string) (models.User, error)
	FindByEmail(ctx context.Context, email string) (models.User, error)
	FindByID(ctx context.Context, id uuid.UUID) (models.User, error)
	GetUserRoles(ctx context.Context, userID uuid.UUID) ([]string, error)
	AddRole(ctx context.Context, userId uuid.UUID, roleName string) error
}

type userRepo struct {
	db *sqlx.DB
}

func NewUserRepo(db *sqlx.DB) UserRepo {
	return &userRepo{db: db}
}

func (r *userRepo) Create(ctx context.Context, email, passwordHash string) (models.User, error) {
	now := time.Now()
	u := models.User{
		ID:           uuid.New(),
		Email:        strings.ToLower(email),
		PasswordHash: sql.NullString{String: passwordHash, Valid: true},
		CreatedAt:    now,
		UpdatedAt:    now,
	}
	_, err := r.db.NamedExecContext(ctx, `
			INSERT INTO users (id, email, password_hash, provider, provider_id, created_at, updated_at)
			VALUES (:id, :email, :password_hash, NULL, NULL, :created_at, :updated_at)
	`, &u)
	return u, err
}

func (r *userRepo) CreateOAuth(ctx context.Context, email, provider, providerID string) (models.User, error) {
	now := time.Now()
	u := models.User{
		ID:         uuid.New(),
		Email:      strings.ToLower(email),
		Provider:   sql.NullString{String: provider, Valid: true},
		ProviderID: sql.NullString{String: providerID, Valid: true},
		CreatedAt:  now,
		UpdatedAt:  now,
	}

	_, err := r.db.NamedExecContext(ctx, `
			INSERT INTO users (id, email, password_hash, provider, provider_id, created_at, updated_at)
				VALUES (:id, :email, NULL, :provider, :provider_id, :created_at, :updated_at)
	`, &u)

	return u, err
}

func (r *userRepo) FindByEmail(ctx context.Context, email string) (models.User, error) {
	var u models.User
	err := r.db.GetContext(ctx, &u, `SELECT * FROM users WHERE email = $1`, email)
	return u, err
}

func (r *userRepo) FindByID(ctx context.Context, id uuid.UUID) (models.User, error) {
	var u models.User
	err := r.db.GetContext(ctx, &u, `SELECT * FROM users WHERE id = $1`, id)
	return u, err
}

func (r *userRepo) GetUserRoles(ctx context.Context, userID uuid.UUID) ([]string, error) {
	var roles []string
	err := r.db.SelectContext(ctx, &roles, `
			SELECT r.name
			FROM user_roles ur
			JOIN roles r ON r.id = ur.role_id
			WHERE ur.user_id = $1
	`, userID)

	return roles, err
}

func (r *userRepo) AddRole(ctx context.Context, userId uuid.UUID, roleName string) error {
	var roleId int
	if err := r.db.GetContext(ctx, &roleId, `SELECT id FROM roles WHERE name = $1`, roleName); err != nil {
		return err
	}

	_, err := r.db.ExecContext(ctx, `
		INSERT INTO user_roles(user_id, role_id)
		VALUES ($1, $2) ON CONFLICT DO NOTHING
	`, userId, roleId)
	return err
}
