package handlers

import (
	"github.com/claude-dashboard/backend/internal/config"
	"github.com/claude-dashboard/backend/internal/models"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type SettingsHandler struct {
	DB  *gorm.DB
	Cfg *config.Config
}

func NewSettingsHandler(db *gorm.DB, cfg *config.Config) *SettingsHandler {
	return &SettingsHandler{DB: db, Cfg: cfg}
}

func (h *SettingsHandler) GetAll(c *fiber.Ctx) error {
	var settings []models.Setting
	if err := h.DB.Find(&settings).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"data": settings})
}

func (h *SettingsHandler) GetByScope(c *fiber.Ctx) error {
	scope := c.Params("scope")
	var settings []models.Setting
	if err := h.DB.Where("scope = ?", scope).Find(&settings).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"data": settings})
}

func (h *SettingsHandler) Update(c *fiber.Ctx) error {
	id := c.Params("id")
	uid, err := uuid.Parse(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid ID"})
	}

	var setting models.Setting
	if err := h.DB.First(&setting, uid).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Setting not found"})
	}

	var body models.Setting
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	// Save history
	history := models.SettingHistory{
		SettingID: setting.ID,
		OldValue:  setting.Value,
		NewValue:  body.Value,
	}
	if err := h.DB.Create(&history).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to save history: " + err.Error()})
	}

	setting.Value = body.Value
	if err := h.DB.Save(&setting).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"data": setting})
}

func (h *SettingsHandler) GetHistory(c *fiber.Ctx) error {
	id := c.Params("id")
	uid, err := uuid.Parse(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid ID"})
	}

	var history []models.SettingHistory
	if err := h.DB.Where("setting_id = ?", uid).Order("changed_at DESC").Find(&history).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"data": history})
}
