package config

import (
	"os"
	"path/filepath"
)

type Config struct {
	Port        string
	DatabaseURL string
	CorsOrigins string
	ClaudeHome  string
	JWTSecret   string
	Environment string
}

func Load() *Config {
	homeDir, _ := os.UserHomeDir()

	return &Config{
		Port:        getEnv("PORT", "8080"),
		DatabaseURL: getEnv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/claude_dashboard?sslmode=disable"),
		CorsOrigins: getEnv("CORS_ORIGINS", "http://localhost:3000"),
		ClaudeHome:  getEnv("CLAUDE_HOME", filepath.Join(homeDir, ".claude")),
		JWTSecret:   getEnv("JWT_SECRET", "claude-dashboard-secret-change-me"),
		Environment: getEnv("ENVIRONMENT", "development"),
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
