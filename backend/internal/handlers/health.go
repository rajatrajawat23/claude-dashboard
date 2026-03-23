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
	sqlDB, err := h.DB.DB()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"status":  "error",
			"message": "Database connection failed",
		})
	}

	if err := sqlDB.Ping(); err != nil {
		return c.Status(500).JSON(fiber.Map{
			"status":  "error",
			"message": "Database ping failed",
		})
	}

	return c.JSON(fiber.Map{
		"status":  "healthy",
		"service": "claude-dashboard-api",
		"version": "1.0.0",
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
