package database

import (
	"github.com/claude-dashboard/backend/internal/config"
	"github.com/claude-dashboard/backend/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func Connect(cfg *config.Config) (*gorm.DB, error) {
	db, err := gorm.Open(postgres.Open(cfg.DatabaseURL), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return nil, err
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, err
	}

	sqlDB.SetMaxOpenConns(25)
	sqlDB.SetMaxIdleConns(5)

	return db, nil
}

func AutoMigrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&models.Setting{},
		&models.SettingHistory{},
		&models.MCPServer{},
		&models.Session{},
		&models.SessionMessage{},
		&models.Terminal{},
		&models.TerminalLog{},
		&models.Worktree{},
		&models.Plugin{},
		&models.Memory{},
		&models.Theme{},
		&models.Task{},
		&models.TaskDependency{},
		&models.FileSnapshot{},
		&models.SystemEvent{},
	)
}
