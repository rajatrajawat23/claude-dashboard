package handlers

import (
	"github.com/claude-dashboard/backend/internal/models"
	"github.com/claude-dashboard/backend/internal/services"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PluginHandler struct {
	DB     *gorm.DB
	Bridge *services.ClaudeBridge
}

func NewPluginHandler(db *gorm.DB, bridge *services.ClaudeBridge) *PluginHandler {
	return &PluginHandler{DB: db, Bridge: bridge}
}

func (h *PluginHandler) List(c *fiber.Ctx) error {
	// First try to get from Claude's actual plugin list
	plugins, err := h.Bridge.ListPlugins()
	if err == nil {
		return c.JSON(fiber.Map{"data": plugins, "source": "claude"})
	}

	// Fallback to DB
	if h.DB != nil {
		var dbPlugins []models.Plugin
		if err := h.DB.Find(&dbPlugins).Error; err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}
		return c.JSON(fiber.Map{"data": dbPlugins, "source": "database"})
	}

	// No DB and bridge failed - return empty list with the error
	return c.JSON(fiber.Map{"data": []interface{}{}, "source": "none", "error": err.Error()})
}

func (h *PluginHandler) Toggle(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid ID"})
	}

	var plugin models.Plugin
	if err := h.DB.First(&plugin, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Plugin not found"})
	}

	plugin.Enabled = !plugin.Enabled
	if err := h.DB.Save(&plugin).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"data": plugin})
}
