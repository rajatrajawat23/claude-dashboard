package models

import (
	"time"

	"github.com/google/uuid"
)

type Terminal struct {
	ID           uuid.UUID     `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name         string        `gorm:"size:255;default:Terminal" json:"name"`
	Shell        string        `gorm:"size:50;default:/bin/zsh" json:"shell"`
	Cwd          string        `gorm:"type:text;default:~" json:"cwd"`
	PID          *int          `json:"pid"`
	Cols         int           `gorm:"default:80" json:"cols"`
	Rows         int           `gorm:"default:24" json:"rows"`
	Status       string        `gorm:"size:20;default:running" json:"status"`
	SessionID    *uuid.UUID    `gorm:"type:uuid" json:"sessionId"`
	CreatedAt    time.Time     `json:"createdAt"`
	LastActiveAt time.Time     `gorm:"default:now()" json:"lastActiveAt"`
	Logs         []TerminalLog `gorm:"foreignKey:TerminalID" json:"logs,omitempty"`
}

type TerminalLog struct {
	ID         uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	TerminalID uuid.UUID `gorm:"type:uuid;index;not null" json:"terminalId"`
	Content    string    `gorm:"type:text;not null" json:"content"`
	LogType    string    `gorm:"size:10;default:output" json:"logType"`
	CreatedAt  time.Time `json:"createdAt"`
}
