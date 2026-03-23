package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
)

type Worktree struct {
	ID           uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Path         string    `gorm:"type:text;uniqueIndex;not null" json:"path"`
	Branch       string    `gorm:"size:255;not null" json:"branch"`
	HeadCommit   *string   `gorm:"size:40" json:"headCommit"`
	IsMain       bool      `gorm:"default:false" json:"isMain"`
	Status       string    `gorm:"size:20;default:active" json:"status"`
	CreatedAt    time.Time `json:"createdAt"`
	LastSyncedAt time.Time `gorm:"default:now()" json:"lastSyncedAt"`
}

type Plugin struct {
	ID          uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name        string         `gorm:"size:255;uniqueIndex;not null" json:"name"`
	Version     *string        `gorm:"size:50" json:"version"`
	Marketplace string         `gorm:"size:100;default:claude-plugins-official" json:"marketplace"`
	Enabled     bool           `gorm:"default:true" json:"enabled"`
	Blocked     bool           `gorm:"default:false" json:"blocked"`
	InstalledAt time.Time      `gorm:"default:now()" json:"installedAt"`
	Config      datatypes.JSON `gorm:"type:jsonb;default:'{}'" json:"config"`
	Metadata    datatypes.JSON `gorm:"type:jsonb;default:'{}'" json:"metadata"`
}

type Memory struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name        string    `gorm:"size:255;uniqueIndex;not null" json:"name"`
	Description *string   `gorm:"type:text" json:"description"`
	MemoryType  string    `gorm:"size:20;not null" json:"memoryType"`
	Content     string    `gorm:"type:text;not null" json:"content"`
	FilePath    *string   `gorm:"type:text" json:"filePath"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type Theme struct {
	ID             uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name           string         `gorm:"size:255;uniqueIndex;not null" json:"name"`
	Mode           string         `gorm:"size:10;not null" json:"mode"`
	Colors         datatypes.JSON `gorm:"type:jsonb;not null" json:"colors"`
	DarkShades     datatypes.JSON `gorm:"type:jsonb;not null" json:"darkShades"`
	LightShades    datatypes.JSON `gorm:"type:jsonb;not null" json:"lightShades"`
	BorderRadius   datatypes.JSON `gorm:"type:jsonb;not null" json:"borderRadius"`
	SidebarVariant string         `gorm:"size:20;default:standard" json:"sidebarVariant"`
	Typography     datatypes.JSON `gorm:"type:jsonb;default:'{}'" json:"typography"`
	IsActive       bool           `gorm:"default:false" json:"isActive"`
	IsPreset       bool           `gorm:"default:false" json:"isPreset"`
	CreatedAt      time.Time      `json:"createdAt"`
	UpdatedAt      time.Time      `json:"updatedAt"`
}

type Task struct {
	ID           uuid.UUID        `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Subject      string           `gorm:"size:500;not null" json:"subject"`
	Description  *string          `gorm:"type:text" json:"description"`
	Status       string           `gorm:"size:20;default:pending" json:"status"`
	Owner        *string          `gorm:"size:100" json:"owner"`
	Priority     int              `gorm:"default:0" json:"priority"`
	Metadata     datatypes.JSON   `gorm:"type:jsonb;default:'{}'" json:"metadata"`
	CreatedAt    time.Time        `json:"createdAt"`
	UpdatedAt    time.Time        `json:"updatedAt"`
	Dependencies []TaskDependency `gorm:"foreignKey:TaskID" json:"dependencies,omitempty"`
}

type TaskDependency struct {
	TaskID    uuid.UUID `gorm:"type:uuid;primaryKey" json:"taskId"`
	DependsOn uuid.UUID `gorm:"type:uuid;primaryKey" json:"dependsOn"`
}

type FileSnapshot struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	FilePath    string    `gorm:"type:text;index;not null" json:"filePath"`
	ContentHash string    `gorm:"size:64;not null" json:"contentHash"`
	SizeBytes   int64     `json:"sizeBytes"`
	SnapshotAt  time.Time `gorm:"default:now()" json:"snapshotAt"`
}

type SystemEvent struct {
	ID        uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	EventType string         `gorm:"size:50;index;not null" json:"eventType"`
	Source    *string        `gorm:"size:100" json:"source"`
	Payload   datatypes.JSON `gorm:"type:jsonb;default:'{}'" json:"payload"`
	CreatedAt time.Time      `gorm:"index" json:"createdAt"`
}
