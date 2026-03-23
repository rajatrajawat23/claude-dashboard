package handlers

import (
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type HealthHandler struct {
	DB *gorm.DB
}

func NewHealthHandler(db *gorm.DB) *HealthHandler {
	return &HealthHandler{DB: db}
}

func (h *HealthHandler) HealthCheck(c *fiber.Ctx) error {
	dbStatus := "unavailable"

	if h.DB != nil {
		sqlDB, err := h.DB.DB()
		if err == nil {
			if err := sqlDB.Ping(); err == nil {
				dbStatus = "connected"
			}
		}
	}

	return c.JSON(fiber.Map{
		"status":   "healthy",
		"service":  "claude-dashboard-api",
		"version":  "1.0.0",
		"database": dbStatus,
	})
}

func (h *HealthHandler) SystemInfo(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{
		"service":    "claude-dashboard-api",
		"version":    "1.0.0",
		"go_version": "1.22",
		"framework":  "fiber/v2",
		"database":   "postgresql",
	})
}
