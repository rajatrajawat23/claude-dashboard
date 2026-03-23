package handlers

import (
	"github.com/claude-dashboard/backend/internal/services"
	"github.com/gofiber/fiber/v2"
)

type ClaudeSessionsHandler struct {
	Bridge *services.ClaudeBridge
}

func NewClaudeSessionsHandler(bridge *services.ClaudeBridge) *ClaudeSessionsHandler {
	return &ClaudeSessionsHandler{Bridge: bridge}
}

func (h *ClaudeSessionsHandler) ListProjects(c *fiber.Ctx) error {
	sessions, err := h.Bridge.ListSessions()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"data": sessions})
}
