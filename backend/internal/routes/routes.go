package routes

import (
	"os"

	"github.com/claude-dashboard/backend/internal/config"
	"github.com/claude-dashboard/backend/internal/handlers"
	"github.com/claude-dashboard/backend/internal/services"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

func Setup(app *fiber.App, db *gorm.DB, cfg *config.Config) {
	bridge := services.NewClaudeBridge(cfg.ClaudeHome)

	api := app.Group("/api/v1")

	// Health & System
	health := handlers.NewHealthHandler(db)
	api.Get("/health", health.HealthCheck)
	api.Get("/system/info", health.SystemInfo)

	// DB Settings (CRUD in database)
	settings := handlers.NewSettingsHandler(db, cfg)
	api.Get("/settings", settings.GetAll)
	api.Get("/settings/scope/:scope", settings.GetByScope)
	api.Put("/settings/:id", settings.Update)
	api.Get("/settings/:id/history", settings.GetHistory)

	// Claude Live Settings (reads from ~/.claude/)
	claudeSettings := handlers.NewClaudeSettingsHandler(bridge)
	api.Get("/claude/settings/global", claudeSettings.GetGlobalSettings)
	api.Get("/claude/settings/local", claudeSettings.GetLocalSettings)
	api.Put("/claude/settings/global", claudeSettings.UpdateGlobalSettings)
	api.Put("/claude/settings/local", claudeSettings.UpdateLocalSettings)

	// Sessions
	sessions := handlers.NewSessionHandler(db)
	api.Get("/sessions", sessions.List)
	api.Get("/sessions/tree", sessions.GetTree)
	api.Get("/sessions/:id", sessions.Get)
	api.Get("/sessions/:id/messages", sessions.GetMessages)
	api.Delete("/sessions/:id", sessions.Archive)

	// Terminals
	terminals := handlers.NewTerminalHandler(db)
	api.Get("/terminals", terminals.List)
	api.Post("/terminals", terminals.Create)
	api.Get("/terminals/:id", terminals.Get)
	api.Delete("/terminals/:id", terminals.Close)
	api.Post("/terminals/:id/resize", terminals.Resize)

	// Memory (reads from ~/.claude/memory/)
	memory := handlers.NewMemoryHandler(bridge)
	api.Get("/memory", memory.List)
	api.Get("/memory/:name", memory.Get)
	api.Post("/memory", memory.Create)
	api.Put("/memory/:name", memory.Update)
	api.Delete("/memory/:name", memory.Delete)

	// Plugins
	plugins := handlers.NewPluginHandler(db, bridge)
	api.Get("/plugins", plugins.List)
	api.Put("/plugins/:id/toggle", plugins.Toggle)

	// Git
	cwd, _ := os.Getwd()
	git := handlers.NewGitHandler(cwd)
	api.Get("/git/status", git.Status)
	api.Get("/git/branches", git.Branches)
	api.Get("/git/commits", git.Commits)
	api.Get("/git/worktrees", git.Worktrees)

	// Theme
	theme := handlers.NewThemeHandler(db)
	api.Get("/theme", theme.GetActive)
	api.Put("/theme", theme.Save)
	api.Get("/theme/presets", theme.ListPresets)

	// Tasks
	tasks := handlers.NewTaskHandler(db)
	api.Get("/tasks", tasks.List)
	api.Post("/tasks", tasks.Create)
	api.Put("/tasks/:id", tasks.Update)
	api.Delete("/tasks/:id", tasks.Delete)
}
