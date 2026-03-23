package handlers

import (
	"github.com/claude-dashboard/backend/internal/services"
	"github.com/gofiber/fiber/v2"
)

type ClaudeSettingsHandler struct {
	Bridge *services.ClaudeBridge
}

func NewClaudeSettingsHandler(bridge *services.ClaudeBridge) *ClaudeSettingsHandler {
	return &ClaudeSettingsHandler{Bridge: bridge}
}

func (h *ClaudeSettingsHandler) GetGlobalSettings(c *fiber.Ctx) error {
	settings, err := h.Bridge.ReadSettings("global")
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"data": settings, "scope": "global"})
}

func (h *ClaudeSettingsHandler) GetLocalSettings(c *fiber.Ctx) error {
	settings, err := h.Bridge.ReadSettings("local")
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"data": settings, "scope": "local"})
}

func (h *ClaudeSettingsHandler) UpdateGlobalSettings(c *fiber.Ctx) error {
	var body services.ClaudeSettingsFile
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	if err := h.Bridge.WriteSettings("global", &body); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"message": "Settings updated", "scope": "global"})
}

func (h *ClaudeSettingsHandler) UpdateLocalSettings(c *fiber.Ctx) error {
	var body services.ClaudeSettingsFile
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	if err := h.Bridge.WriteSettings("local", &body); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"message": "Settings updated", "scope": "local"})
}
