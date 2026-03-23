package handlers

import (
	"github.com/claude-dashboard/backend/internal/models"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type ThemeHandler struct {
	DB *gorm.DB
}

func NewThemeHandler(db *gorm.DB) *ThemeHandler {
	return &ThemeHandler{DB: db}
}

func (h *ThemeHandler) GetActive(c *fiber.Ctx) error {
	var theme models.Theme
	if err := h.DB.Where("is_active = ?", true).First(&theme).Error; err != nil {
		return c.JSON(fiber.Map{"data": nil, "message": "No active theme"})
	}
	return c.JSON(fiber.Map{"data": theme})
}

func (h *ThemeHandler) Save(c *fiber.Ctx) error {
	var theme models.Theme
	if err := c.BodyParser(&theme); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	// Deactivate all themes first
	if err := h.DB.Model(&models.Theme{}).Where("is_active = ?", true).Update("is_active", false).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to deactivate themes: " + err.Error()})
	}

	theme.IsActive = true
	if err := h.DB.Save(&theme).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"data": theme})
}

func (h *ThemeHandler) ListPresets(c *fiber.Ctx) error {
	var presets []models.Theme
	if err := h.DB.Where("is_preset = ?", true).Find(&presets).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"data": presets})
}
