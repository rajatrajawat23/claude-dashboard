package handlers

import (
	"github.com/claude-dashboard/backend/internal/models"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type TerminalHandler struct {
	DB *gorm.DB
}

func NewTerminalHandler(db *gorm.DB) *TerminalHandler {
	return &TerminalHandler{DB: db}
}

func (h *TerminalHandler) List(c *fiber.Ctx) error {
	var terminals []models.Terminal
	if err := h.DB.Order("created_at DESC").Find(&terminals).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"data": terminals})
}

func (h *TerminalHandler) Create(c *fiber.Ctx) error {
	var terminal models.Terminal
	if err := c.BodyParser(&terminal); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	if terminal.Name == "" {
		terminal.Name = "Terminal"
	}
	if terminal.Shell == "" {
		terminal.Shell = "/bin/zsh"
	}
	if terminal.Cols == 0 {
		terminal.Cols = 80
	}
	if terminal.Rows == 0 {
		terminal.Rows = 24
	}
	terminal.Status = "running"

	if err := h.DB.Create(&terminal).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(201).JSON(fiber.Map{"data": terminal})
}

func (h *TerminalHandler) Get(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid ID"})
	}

	var terminal models.Terminal
	if err := h.DB.First(&terminal, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Terminal not found"})
	}
	return c.JSON(fiber.Map{"data": terminal})
}

func (h *TerminalHandler) Close(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid ID"})
	}

	if err := h.DB.Model(&models.Terminal{}).Where("id = ?", id).Update("status", "stopped").Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"message": "Terminal closed"})
}

func (h *TerminalHandler) Resize(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid ID"})
	}

	var body struct {
		Cols int `json:"cols"`
		Rows int `json:"rows"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	if err := h.DB.Model(&models.Terminal{}).Where("id = ?", id).Updates(map[string]interface{}{
		"cols": body.Cols,
		"rows": body.Rows,
	}).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"message": "Terminal resized"})
}
