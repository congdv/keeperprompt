package services

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"github.com/congdv/go-auth/api/internal/config"
	"github.com/congdv/go-auth/api/internal/models"
	"github.com/congdv/go-auth/api/internal/repository"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type AuthService interface {
	Register(ctx context.Context, email, password string) (models.AuthUser, error)
	Login(ctx context.Context, email, password string) (models.AuthUser, string, string, uuid.UUID, time.Time, error)
	Me(ctx context.Context, userID uuid.UUID) (models.AuthUser, error)

	// Social
	FindOrCreateOauthUser(ctx context.Context, email, provider, providerId string) (models.AuthUser, error)

	// Tokens
	GenerateAccessToken(user models.User, roles []string) (string, time.Time, error)
	GenerateFreshToken(user models.User) (string, uuid.UUID, time.Time, error)
	ValidateRefreshToken(refreshJWT string) (uuid.UUID, uuid.UUID, time.Time, error)
	SaveRefresh(ctx context.Context, userId uuid.UUID, jti uuid.UUID, exp time.Time) error
	RevokeRefresh(ctx context.Context, jti uuid.UUID) error
	RevokeAllForUser(ctx context.Context, userId uuid.UUID) error
	GetFreshByJTI(ctx context.Context, jti uuid.UUID) (models.RefreshToken, error)
}

type authService struct {
	cfg    *config.Config
	users  repository.UserRepo
	roles  repository.RoleRepo
	tokens repository.TokenRepo
}

func NewAuthService(cfg *config.Config, users repository.UserRepo, roles repository.RoleRepo, tokens repository.TokenRepo) AuthService {
	return &authService{
		cfg:    cfg,
		users:  users,
		roles:  roles,
		tokens: tokens,
	}
}

func (a *authService) Register(ctx context.Context, email, password string) (models.AuthUser, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return models.AuthUser{}, err
	}

	u, err := a.users.Create(ctx, email, string(hash))
	if err != nil {
		return models.AuthUser{}, err
	}

	_ = a.users.AddRole(ctx, u.ID, "user")
	rs, _ := a.users.GetUserRoles(ctx, u.ID)
	return models.AuthUser{User: u, Roles: rs}, nil
}
func (a *authService) Login(ctx context.Context, email, password string) (models.AuthUser, string, string, uuid.UUID, time.Time, error) {
	u, err := a.users.FindByEmail(ctx, email)
	if err != nil {
		return models.AuthUser{}, "", "", uuid.Nil, time.Time{}, errors.New("invalid credentials")
	}
	if !u.PasswordHash.Valid {
		return models.AuthUser{}, "", "", uuid.Nil, time.Time{}, errors.New("invalid credentials")
	}
	if err := bcrypt.CompareHashAndPassword([]byte(u.PasswordHash.String), []byte(password)); err != nil {
		return models.AuthUser{}, "", "", uuid.Nil, time.Time{}, errors.New("invalid credentials")
	}
	roles, _ := a.users.GetUserRoles(ctx, u.ID)
	access, _, err := a.GenerateAccessToken(u, roles)
	if err != nil {
		return models.AuthUser{}, "", "", uuid.Nil, time.Time{}, err
	}

	refresh, jti, exp, err := a.GenerateFreshToken(u)
	if err != nil {
		return models.AuthUser{}, "", "", uuid.Nil, time.Time{}, err
	}
	if err := a.SaveRefresh(ctx, u.ID, jti, exp); err != nil {
		return models.AuthUser{}, "", "", uuid.Nil, time.Time{}, err
	}
	return models.AuthUser{User: u, Roles: roles}, access, refresh, jti, exp, nil
}

func (a *authService) Me(ctx context.Context, userID uuid.UUID) (models.AuthUser, error) {
	u, err := a.users.FindByID(ctx, userID)
	if err != nil {
		return models.AuthUser{}, err
	}
	roles, _ := a.users.GetUserRoles(ctx, u.ID)
	return models.AuthUser{User: u, Roles: roles}, nil
}

func (a *authService) FindOrCreateOauthUser(ctx context.Context, email, provider, providerId string) (models.AuthUser, error) {
	u, err := a.users.FindByEmail(ctx, email)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			u, err = a.users.CreateOAuth(ctx, email, provider, providerId)
			if err != nil {
				return models.AuthUser{}, err
			}
		} else {
			return models.AuthUser{}, err
		}
	}
	roles, _ := a.users.GetUserRoles(ctx, u.ID)
	return models.AuthUser{User: u, Roles: roles}, nil
}

type accessClaims struct {
	UserId string   `json:"uid"`
	Roles  []string `json:"roles"`
	jwt.RegisteredClaims
}

type refreshClaims struct {
	UserId string `json:"uid"`
	jwt.RegisteredClaims
}

func (a *authService) GenerateAccessToken(user models.User, roles []string) (string, time.Time, error) {
	now := time.Now()
	exp := now.Add(time.Duration(a.cfg.JWTAccessTTLMinutes) * time.Minute)

	claims := accessClaims{
		UserId: user.ID.String(),
		Roles:  roles,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   user.ID.String(),
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(exp),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	s, err := token.SignedString([]byte(a.cfg.JWTAccessSecret))
	return s, exp, err
}
func (a *authService) GenerateFreshToken(user models.User) (string, uuid.UUID, time.Time, error) {
	now := time.Now()
	exp := now.Add(time.Duration(a.cfg.JWTRefreshTTLHrs) * time.Hour)
	jti := uuid.New()

	claims := refreshClaims{
		UserId: user.ID.String(),
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   user.ID.String(),
			ID:        jti.String(),
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(exp),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	s, err := token.SignedString([]byte(a.cfg.JWTRefreshSecret))
	return s, jti, exp, err
}
func (a *authService) ValidateRefreshToken(refreshJWT string) (uuid.UUID, uuid.UUID, time.Time, error) {
	token, err := jwt.ParseWithClaims(refreshJWT, &refreshClaims{}, func(t *jwt.Token) (interface{}, error) {
		return []byte(a.cfg.JWTRefreshSecret), nil
	})

	if err != nil || !token.Valid {
		return uuid.Nil, uuid.Nil, time.Time{}, errors.New("invalid refresh token")
	}
	rc, ok := token.Claims.(*refreshClaims)
	if !ok {
		return uuid.Nil, uuid.Nil, time.Time{}, errors.New("invalid claims")
	}

	uid, err := uuid.Parse(rc.UserId)
	if err != nil {
		return uuid.Nil, uuid.Nil, time.Time{}, errors.New("invalid claims")
	}

	jti, err := uuid.Parse(rc.ID)
	if err != nil {
		return uuid.Nil, uuid.Nil, time.Time{}, errors.New("invalid jti")
	}
	if rc.ExpiresAt == nil || time.Now().After(rc.ExpiresAt.Time) {
		return uuid.Nil, uuid.Nil, time.Time{}, errors.New("refresh expired")
	}

	return uid, jti, rc.ExpiresAt.Time, nil
}

func (a *authService) SaveRefresh(ctx context.Context, userId uuid.UUID, jti uuid.UUID, exp time.Time) error {
	return a.tokens.Insert(ctx, models.RefreshToken{
		ID:        uuid.New(),
		UserID:    userId,
		JTI:       jti,
		IsRevoked: false,
		ExpiresAt: exp,
	})
}

func (a *authService) RevokeRefresh(ctx context.Context, jti uuid.UUID) error {
	return a.tokens.RevokeByJTI(ctx, jti)
}
func (a *authService) RevokeAllForUser(ctx context.Context, userId uuid.UUID) error {
	return a.tokens.RevokeAllForUser(ctx, userId)
}
func (a *authService) GetFreshByJTI(ctx context.Context, jti uuid.UUID) (models.RefreshToken, error) {
	return a.tokens.FindByJTI(ctx, jti)
}
