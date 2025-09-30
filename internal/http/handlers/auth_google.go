package handlers

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/congdv/go-auth/api/internal/config"
	"github.com/congdv/go-auth/api/internal/services"
	"github.com/gin-gonic/gin"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

type GoogleAuthHandler struct {
	auth  services.AuthService
	cfg   *config.Config
	oauth *oauth2.Config
}

func NewGoogleAuthHandler(auth services.AuthService, cfg *config.Config) *GoogleAuthHandler {
	return &GoogleAuthHandler{
		auth: auth,
		cfg:  cfg,
		oauth: &oauth2.Config{
			ClientID:     cfg.GoogleClientID,
			ClientSecret: cfg.GoogleClientSecret,
			RedirectURL:  cfg.GoogleRedirectUrl,
			Scopes:       []string{"openid", "email", "profile"},
			Endpoint:     google.Endpoint,
		},
	}
}

func (h *GoogleAuthHandler) Start(c *gin.Context) {
	if h.cfg.GoogleClientID == "" || h.cfg.GoogleClientSecret == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "google auth not configured"})
		return
	}

	state := randomState(32)

	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie("oauth_state", state, int((5 * time.Minute).Seconds()), "/api/auth/google", h.cfg.CookieDomain, h.cfg.CookieSecure, true)

	url := h.oauth.AuthCodeURL(state, oauth2.SetAuthURLParam("prompt", "select_account"))

	c.Redirect(http.StatusFound, url)
}

func (h *GoogleAuthHandler) Callback(c *gin.Context) {
	stateParam := c.Query("state")
	code := c.Query("code")
	stateCookie, err := c.Cookie("oauth_state")

	fmt.Printf("State param: '%s'\n", stateParam)
	fmt.Printf("State cookie: '%s'\n", stateCookie)
	fmt.Printf("Cookie error: %v\n", err)
	fmt.Printf("States equal: %t\n", stateCookie == stateParam)

	if err != nil || stateCookie == "" || stateParam == "" || stateCookie != stateParam {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid oauth state"})
		return
	}

	ctx := context.Background()
	token, err := h.oauth.Exchange(ctx, code)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "oauth exchange failed"})
		return
	}

	client := h.oauth.Client(ctx, token)
	resp, err := client.Get("https://www.googleapis.com/oauth2/v3/userinfo")
	if err != nil || resp.StatusCode != http.StatusOK {
		c.JSON(http.StatusBadGateway, gin.H{"error": "failed to fetch user info"})
		return
	}

	defer resp.Body.Close()

	var info struct {
		Sub           string `json:"sub"`
		Email         string `json:"email"`
		EmailVerified bool   `json:"email_verified"`
		Name          string `json:"name"`
		Picture       string `json:"picture"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&info); err != nil {
		fmt.Printf("Decoded error: %v\n", err)
		c.JSON(http.StatusBadGateway, gin.H{"error": "invalid user info"})
		return
	}

	if info.Email == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "email not provided by provider"})
		return
	}

	auth, err := h.auth.FindOrCreateOauthUser(c.Request.Context(), info.Email, "google", info.Sub)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to process user"})
		return
	}

	accessToken, _, err := h.auth.GenerateAccessToken(auth.User, auth.Roles)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to issue access token"})
		return
	}
	refresh, jti, refreshExp, err := h.auth.GenerateFreshToken(auth.User)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to issue refresh token"})
		return
	}
	if err := h.auth.SaveRefresh(c.Request.Context(), auth.User.ID, jti, refreshExp); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save refresh token"})
		return
	}

	// Set refresh cookie (path limited to /api/auth)
	httpOnlyRefreshCookie(c, h.cfg, refresh, refreshExp)
	url := h.cfg.FrontendOrigin + "/oauth/callback?token=" + accessToken
	c.Redirect(http.StatusFound, url)
}

func randomState(n int) string {
	b := make([]byte, n)
	_, _ = rand.Read(b)
	return base64.RawURLEncoding.EncodeToString(b)
}
