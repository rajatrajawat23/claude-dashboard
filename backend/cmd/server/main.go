package main

import (
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/claude-dashboard/backend/internal/config"
	"github.com/claude-dashboard/backend/internal/database"
	"github.com/claude-dashboard/backend/internal/routes"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

func main() {
	cfg := config.Load()

	db, err := database.Connect(cfg)
	if err != nil {
		log.Printf("WARNING: Database not available: %v", err)
		log.Println("Server will start without database - Claude file-based endpoints will still work")
	} else {
		if err := database.AutoMigrate(db); err != nil {
			log.Printf("WARNING: Migration failed: %v", err)
		}
	}

	app := fiber.New(fiber.Config{
		AppName:      "Claude Dashboard API",
		ServerHeader: "Claude-Dashboard",
		BodyLimit:    10 * 1024 * 1024, // 10MB
	})

	app.Use(recover.New())
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: cfg.CorsOrigins,
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET, POST, PUT, DELETE, PATCH, OPTIONS",
	}))

	routes.Setup(app, db, cfg)

	go func() {
		addr := fmt.Sprintf(":%s", cfg.Port)
		if err := app.Listen(addr); err != nil {
			log.Fatalf("Server failed: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")
	if err := app.Shutdown(); err != nil {
		log.Fatalf("Server shutdown failed: %v", err)
	}
	log.Println("Server stopped")
}
