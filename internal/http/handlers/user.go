package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type UserHandler struct{}

func NewUserHandler() *UserHandler { return &UserHandler{} }

func (h *UserHandler) Profile(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "This is a protected user profile endpoint.",
	})
}
