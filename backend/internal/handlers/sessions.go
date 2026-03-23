package handlers

import (
	"github.com/claude-dashboard/backend/internal/models"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type SessionHandler struct {
	DB *gorm.DB
}

func NewSessionHandler(db *gorm.DB) *SessionHandler {
	return &SessionHandler{DB: db}
}

func (h *SessionHandler) List(c *fiber.Ctx) error {
	var sessions []models.Session
	query := h.DB.Preload("Children").Where("parent_id IS NULL")

	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}

	if err := query.Order("created_at DESC").Find(&sessions).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"data": sessions})
}

func (h *SessionHandler) Get(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid ID"})
	}

	var session models.Session
	if err := h.DB.Preload("Children").Preload("Messages").First(&session, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Session not found"})
	}
	return c.JSON(fiber.Map{"data": session})
}

func (h *SessionHandler) GetTree(c *fiber.Ctx) error {
	var sessions []models.Session
	if err := h.DB.Preload("Children").Where("parent_id IS NULL").Find(&sessions).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"data": sessions})
}

func (h *SessionHandler) GetMessages(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid ID"})
	}

	var messages []models.SessionMessage
	if err := h.DB.Where("session_id = ?", id).Order("created_at ASC").Find(&messages).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"data": messages})
}

func (h *SessionHandler) Archive(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid ID"})
	}

	if err := h.DB.Model(&models.Session{}).Where("id = ?", id).Update("status", "archived").Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"message": "Session archived"})
}
