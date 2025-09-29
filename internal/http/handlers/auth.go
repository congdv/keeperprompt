package handlers

import (
	"net/http"
	"time"

	"github.com/congdv/go-auth/api/internal/config"
	"github.com/congdv/go-auth/api/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type AuthHander struct {
	auth services.AuthService
	cfg  *config.Config
}

func NewAuthHandler(auth services.AuthService, cfg *config.Config) *AuthHander {
	return &AuthHander{auth: auth, cfg: cfg}
}

type registerRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
}

func (h *AuthHander) Register(c *gin.Context) {
	var req registerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid email and password"})
		return
	}
	auth, err := h.auth.Register(c.Request.Context(), req.Email, req.Password)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "unable to register"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"user": auth.User, "roles": auth.Roles})
}

type loginReq struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func (h *AuthHander) Login(c *gin.Context) {
	var req loginReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "email or password is invalid"})
		return
	}

	auth, access, refresh, _, refreshExp, err := h.auth.Login(c.Request.Context(), req.Email, req.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "email or password is invalid"})
	}
	setRefreshCookie(c, h.cfg, refresh, refreshExp)
	c.JSON(http.StatusOK, gin.H{
		"access_token": access,
		"user":         auth.User,
		"roles":        auth.Roles,
	})
}

func setRefreshCookie(c *gin.Context, cfg *config.Config, value string, exp time.Time) {
	httpOnlyRefreshCookie(c, cfg, value, exp)
}

func httpOnlyRefreshCookie(c *gin.Context, cfg *config.Config, value string, exp time.Time) {
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie("refresh_token", value, int(time.Until(exp).Seconds()), "/api/auth", cfg.CookieDomain, cfg.CookieSecure, true)
}

func (h *AuthHander) Refresh(c *gin.Context) {
	cookie, err := c.Cookie("refresh_token")
	if err != nil || cookie == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "missing refresh token"})
		return
	}

	userID, jti, _, err := h.auth.ValidateRefreshToken(cookie)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid refresh token"})
		return
	}

	rt, err := h.auth.GetFreshByJTI(c.Request.Context(), jti)
	if err != nil || rt.IsRevoked || time.Now().After(rt.ExpiresAt) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "refresh token revoked or expired"})
		return
	}

	_ = h.auth.RevokeRefresh(c.Request.Context(), jti)

	auth, err := h.auth.Me(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not found"})
		return
	}

	access, _, err := h.auth.GenerateAccessToken(auth.User, auth.Roles)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to issue access token"})
		return
	}

	refresh, newJTI, refreshExp, err := h.auth.GenerateFreshToken(auth.User)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to issue refresh token"})
		return
	}

	if err := h.auth.SaveRefresh(c.Request.Context(), auth.User.ID, newJTI, refreshExp); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save refresh token"})
		return
	}

	setRefreshCookie(c, h.cfg, refresh, refreshExp)
	c.JSON(http.StatusOK, gin.H{
		"access_token": access,
		"user":         auth.User,
		"roles":        auth.Roles,
	})
}

func (h *AuthHander) LogOut(c *gin.Context) {
	if cookie, err := c.Cookie("refresh_token"); err == nil && cookie != "" {
		if _, jti, _, err := h.auth.ValidateRefreshToken(cookie); err != nil {
			_ = h.auth.RevokeRefresh(c.Request.Context(), jti)
		}

		httpOnlyRefreshCookie(c, h.cfg, "", time.Unix(0, 0))
		c.JSON(http.StatusOK, gin.H{"message": "logged out"})
	}
}

func (h *AuthHander) Me(c *gin.Context) {
	uidVal, _ := c.Get("userId")
	userId := uidVal.(uuid.UUID)
	auth, err := h.auth.Me(c.Request.Context(), userId)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"user": auth.User, "roles": auth.Roles})
}
