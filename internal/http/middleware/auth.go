package middleware

import (
	"net/http"
	"strings"

	"github.com/congdv/go-auth/api/internal/config"
	"github.com/congdv/go-auth/api/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type ctxKey string

const (
	ctxUserID ctxKey = "userId"
	ctxRoles  ctxKey = "roles"
)

type accessClaims struct {
	UserId string   `json:"uid"`
	Roles  []string `json:"roles"`
	jwt.RegisteredClaims
}

func Authenticate(cfg *config.Config, auth services.AuthService) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		authHeader := ctx.GetHeader("Authorization")
		if !strings.HasPrefix(authHeader, "Bearer ") {
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing token"})
			return
		}

		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
		token, err := jwt.ParseWithClaims(tokenStr, &accessClaims{}, func(t *jwt.Token) (interface{}, error) {
			return []byte(cfg.JWTAccessSecret), nil
		})

		if err != nil || !token.Valid {
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			return
		}
		claims, ok := token.Claims.(*accessClaims)
		if !ok {
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid claims"})
			return
		}

		uid, err := uuid.Parse(claims.UserId)
		if err != nil {
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid uid"})
		}
		ctx.Set(string(ctxUserID), uid)
		ctx.Set(string(ctxRoles), claims.Roles)
		ctx.Next()
	}
}

func RequireRoles(roles ...string) gin.HandlerFunc {
	required := map[string]struct{}{}
	for _, r := range roles {
		required[r] = struct{}{}
	}

	return func(ctx *gin.Context) {
		val, exists := ctx.Get(string(ctxRoles))
		if !exists {
			ctx.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "no roles"})
			return
		}
		userRoles, _ := val.([]string)
		for _, ur := range userRoles {
			if _, ok := required[ur]; ok {
				ctx.Next()
				return
			}
		}
		ctx.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "insufficient role"})
	}
}
