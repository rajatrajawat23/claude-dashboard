package routes

import (
	"os"

	"github.com/claude-dashboard/backend/internal/config"
	"github.com/claude-dashboard/backend/internal/handlers"
	"github.com/claude-dashboard/backend/internal/services"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
	"gorm.io/gorm"
)

func Setup(app *fiber.App, db *gorm.DB, cfg *config.Config) {
	bridge := services.NewClaudeBridge(cfg.ClaudeHome)

	api := app.Group("/api/v1")

	// Health & System (always available)
	health := handlers.NewHealthHandler(db)
	api.Get("/health", health.HealthCheck)
	api.Get("/system/info", health.SystemInfo)

	// Claude Live Settings (reads from ~/.claude/ - no DB needed)
	claudeSettings := handlers.NewClaudeSettingsHandler(bridge)
	api.Get("/claude/settings/global", claudeSettings.GetGlobalSettings)
	api.Get("/claude/settings/local", claudeSettings.GetLocalSettings)
	api.Put("/claude/settings/global", claudeSettings.UpdateGlobalSettings)
	api.Put("/claude/settings/local", claudeSettings.UpdateLocalSettings)

	// Memory (reads from ~/.claude/memory/ - no DB needed)
	memory := handlers.NewMemoryHandler(bridge)
	api.Get("/memory", memory.List)
	api.Get("/memory/:name", memory.Get)
	api.Post("/memory", memory.Create)
	api.Put("/memory/:name", memory.Update)
	api.Delete("/memory/:name", memory.Delete)

	// Plugins (tries filesystem first, falls back to DB)
	plugins := handlers.NewPluginHandler(db, bridge)
	api.Get("/plugins", plugins.List)

	// Claude Sessions (reads from ~/.claude/projects/ - no DB needed)
	claudeSessions := handlers.NewClaudeSessionsHandler(bridge)
	api.Get("/claude/sessions", claudeSessions.ListProjects)

	// Git (shell commands - no DB needed)
	cwd, _ := os.Getwd()
	git := handlers.NewGitHandler(cwd)
	api.Get("/git/status", git.Status)
	api.Get("/git/branches", git.Branches)
	api.Get("/git/commits", git.Commits)
	api.Get("/git/worktrees", git.Worktrees)

	// Terminals (real PTY - no DB needed)
	termManager := services.NewTerminalManager()
	terminals := handlers.NewTerminalHandler(termManager)
	api.Get("/terminals", terminals.List)
	api.Get("/terminals/tree", terminals.GetTree)
	api.Post("/terminals", terminals.Create)
	api.Get("/terminals/:id", terminals.Get)
	api.Get("/terminals/:id/children", terminals.GetChildren)
	api.Delete("/terminals/:id", terminals.Remove)
	api.Post("/terminals/:id/kill", terminals.Kill)
	api.Post("/terminals/:id/resize", terminals.Resize)
	api.Put("/terminals/:id/rename", terminals.Rename)
	api.Post("/terminals/:id/restart", terminals.Restart)

	// Terminal WebSocket
	app.Use("/ws/terminals/:id", terminals.WebSocketUpgrade)
	app.Get("/ws/terminals/:id", websocket.New(terminals.WebSocket))

	// DB-dependent routes (only register if DB is available)
	if db != nil {
		// DB Settings (CRUD in database)
		settings := handlers.NewSettingsHandler(db, cfg)
		api.Get("/settings", settings.GetAll)
		api.Get("/settings/scope/:scope", settings.GetByScope)
		api.Put("/settings/:id", settings.Update)
		api.Get("/settings/:id/history", settings.GetHistory)

		// Sessions
		sessions := handlers.NewSessionHandler(db)
		api.Get("/sessions", sessions.List)
		api.Get("/sessions/tree", sessions.GetTree)
		api.Get("/sessions/:id", sessions.Get)
		api.Get("/sessions/:id/messages", sessions.GetMessages)
		api.Delete("/sessions/:id", sessions.Archive)

		// Plugin toggle (needs DB)
		api.Put("/plugins/:id/toggle", plugins.Toggle)

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
	} else {
		// Return friendly message for DB-dependent routes when DB is unavailable
		dbUnavailable := func(c *fiber.Ctx) error {
			return c.Status(503).JSON(fiber.Map{
				"error":   "Database not available",
				"message": "Start PostgreSQL and restart the server to enable this endpoint",
			})
		}
		api.Get("/settings", dbUnavailable)
		api.Get("/sessions", dbUnavailable)
		api.Get("/theme", dbUnavailable)
		api.Get("/tasks", dbUnavailable)
	}
}
