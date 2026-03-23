package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type Setting struct {
	ID        uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Scope     string         `gorm:"size:20;not null" json:"scope"`
	Key       string         `gorm:"size:255;not null" json:"key"`
	Value     datatypes.JSON `gorm:"type:jsonb;not null" json:"value"`
	FilePath  string         `gorm:"type:text;not null" json:"filePath"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
}

type SettingHistory struct {
	ID        uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	SettingID uuid.UUID      `gorm:"type:uuid" json:"settingId"`
	Setting   Setting        `gorm:"foreignKey:SettingID" json:"-"`
	OldValue  datatypes.JSON `gorm:"type:jsonb" json:"oldValue"`
	NewValue  datatypes.JSON `gorm:"type:jsonb;not null" json:"newValue"`
	ChangedBy string         `gorm:"size:100;default:dashboard" json:"changedBy"`
	ChangedAt time.Time      `gorm:"default:now()" json:"changedAt"`
}

type MCPServer struct {
	ID        uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name      string         `gorm:"size:255;uniqueIndex;not null" json:"name"`
	Command   string         `gorm:"size:50;not null" json:"command"`
	Args      datatypes.JSON `gorm:"type:jsonb;default:'[]'" json:"args"`
	Env       datatypes.JSON `gorm:"type:jsonb;default:'{}'" json:"env"`
	Status    string         `gorm:"size:20;default:active" json:"status"`
	NeedsAuth bool           `gorm:"default:false" json:"needsAuth"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
}

func (s *Setting) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return nil
}
