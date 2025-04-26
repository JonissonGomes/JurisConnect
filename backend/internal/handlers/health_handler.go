package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jurisconnect/backend/internal/database"
)

type HealthHandler struct {
	db *database.MongoDB
}

func NewHealthHandler(db *database.MongoDB) *HealthHandler {
	return &HealthHandler{db: db}
}

func (h *HealthHandler) Check(c *gin.Context) {
	// Verificar conexão com o MongoDB
	err := h.db.Ping()
	if err != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"status":  "error",
			"message": "Database connection failed",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "ok",
		"message": "Service is healthy",
	})
}
