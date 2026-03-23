package routes

import (
	"github.com/claude-dashboard/backend/internal/config"
	"github.com/claude-dashboard/backend/internal/handlers"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

func Setup(app *fiber.App, db *gorm.DB, cfg *config.Config) {
	api := app.Group("/api/v1")

	// Health
	health := handlers.NewHealthHandler(db)
	api.Get("/health", health.HealthCheck)
	api.Get("/system/info", health.SystemInfo)

	// Settings
	settings := handlers.NewSettingsHandler(db, cfg)
	api.Get("/settings", settings.GetAll)
	api.Get("/settings/:scope", settings.GetByScope)
	api.Put("/settings/:id", settings.Update)
	api.Get("/settings/:id/history", settings.GetHistory)
}
