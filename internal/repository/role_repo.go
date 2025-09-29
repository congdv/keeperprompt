package repository

import (
	"context"

	"github.com/congdv/go-auth/api/internal/models"
	"github.com/jmoiron/sqlx"
)

type RoleRepo interface {
	List(ctx context.Context) ([]models.Role, error)
}

type roleRepo struct {
	db *sqlx.DB
}

func NewRoleRepo(db *sqlx.DB) RoleRepo {
	return &roleRepo{db: db}
}

func (r *roleRepo) List(ctx context.Context) ([]models.Role, error) {
	var roles []models.Role
	err := r.db.SelectContext(ctx, &roles, `SELECT id, name FROM roles ORDER BY id`)
	return roles, err
}
