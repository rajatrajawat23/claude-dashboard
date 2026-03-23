package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
)

type Session struct {
	ID              uuid.UUID        `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	ClaudeSessionID *string          `gorm:"size:255;uniqueIndex" json:"claudeSessionId"`
	ParentID        *uuid.UUID       `gorm:"type:uuid;index" json:"parentId"`
	Parent          *Session         `gorm:"foreignKey:ParentID" json:"-"`
	Children        []Session        `gorm:"foreignKey:ParentID" json:"children,omitempty"`
	ProjectPath     *string          `gorm:"type:text" json:"projectPath"`
	Status          string           `gorm:"size:20;default:active;index" json:"status"`
	StartedAt       time.Time        `gorm:"default:now()" json:"startedAt"`
	EndedAt         *time.Time       `json:"endedAt"`
	TokenCount      int              `gorm:"default:0" json:"tokenCount"`
	MessageCount    int              `gorm:"default:0" json:"messageCount"`
	Metadata        datatypes.JSON   `gorm:"type:jsonb;default:'{}'" json:"metadata"`
	CreatedAt       time.Time        `json:"createdAt"`
	Messages        []SessionMessage `gorm:"foreignKey:SessionID" json:"messages,omitempty"`
}

type SessionMessage struct {
	ID        uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	SessionID uuid.UUID      `gorm:"type:uuid;index;not null" json:"sessionId"`
	Role      string         `gorm:"size:20;not null" json:"role"`
	Content   string         `gorm:"type:text;not null" json:"content"`
	ToolUse   datatypes.JSON `gorm:"type:jsonb" json:"toolUse"`
	Tokens    int            `gorm:"default:0" json:"tokens"`
	CreatedAt time.Time      `json:"createdAt"`
}
