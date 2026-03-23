package handlers

import (
	"github.com/claude-dashboard/backend/internal/services"
	"github.com/gofiber/fiber/v2"
)

type MemoryHandler struct {
	Bridge *services.ClaudeBridge
}

func NewMemoryHandler(bridge *services.ClaudeBridge) *MemoryHandler {
	return &MemoryHandler{Bridge: bridge}
}

func (h *MemoryHandler) List(c *fiber.Ctx) error {
	memories, err := h.Bridge.ListMemories()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"data": memories})
}

func (h *MemoryHandler) Get(c *fiber.Ctx) error {
	name := c.Params("name")
	memory, err := h.Bridge.ReadMemory(name)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Memory not found"})
	}
	return c.JSON(fiber.Map{"data": memory})
}

func (h *MemoryHandler) Create(c *fiber.Ctx) error {
	var body struct {
		Name    string `json:"name"`
		Content string `json:"content"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	if err := h.Bridge.WriteMemory(body.Name, body.Content); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(201).JSON(fiber.Map{"message": "Memory created"})
}

func (h *MemoryHandler) Update(c *fiber.Ctx) error {
	name := c.Params("name")
	var body struct {
		Content string `json:"content"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	if err := h.Bridge.WriteMemory(name, body.Content); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"message": "Memory updated"})
}

func (h *MemoryHandler) Delete(c *fiber.Ctx) error {
	name := c.Params("name")
	if err := h.Bridge.DeleteMemory(name); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"message": "Memory deleted"})
}
