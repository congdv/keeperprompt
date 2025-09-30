package main

import (
	"log"
	"net/http"
	"time"

	"github.com/congdv/go-auth/api/internal/config"
	"github.com/congdv/go-auth/api/internal/database"
	"github.com/congdv/go-auth/api/internal/http/handlers"
	"github.com/congdv/go-auth/api/internal/http/middleware"
	"github.com/congdv/go-auth/api/internal/repository"
	"github.com/congdv/go-auth/api/internal/services"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config error: %v", err)
	}

	db, err := database.Connect(cfg.DBURL)

	if err != nil {
		log.Fatalf("db connect error: %v", err)
	}

	defer db.Close()

	userRepo := repository.NewUserRepo(db)
	roleRepo := repository.NewRoleRepo(db)
	tokenRepo := repository.NewTokenRepo(db)

	authService := services.NewAuthService(cfg, userRepo, roleRepo, tokenRepo)

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{cfg.FrontendOrigin},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	r.GET("/health", func(ctx *gin.Context) {
		ctx.String(http.StatusOK, "ok")
	})

	api := r.Group("/api")

	authHandler := handlers.NewAuthHandler(authService, cfg)
	api.POST("/auth/register", authHandler.Register)
	api.POST("/auth/login", authHandler.Login)
	api.POST("/auth/refresh", authHandler.Refresh)
	api.POST("/auth/logout", middleware.Authenticate(cfg, authService), authHandler.LogOut)
	api.POST("/auth/me", middleware.Authenticate(cfg, authService), authHandler.Me)

	googleHandler := handlers.NewGoogleAuthHandler(authService, cfg)
	api.GET("/auth/google/start", googleHandler.Start)
	api.GET("/auth/google/callback", googleHandler.Callback)

	userHandler := handlers.NewUserHandler()
	api.GET("/user/profile", middleware.Authenticate(cfg, authService), userHandler.Profile)

	addr := ":" + cfg.Port
	log.Printf("API listening on %s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatalf("server error: %v", err)
	}
}
