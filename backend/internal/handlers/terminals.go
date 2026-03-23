package handlers

import (
	"encoding/json"
	"log"

	"github.com/claude-dashboard/backend/internal/services"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
	"github.com/google/uuid"
)

type TerminalHandler struct {
	Manager *services.TerminalManager
}

func NewTerminalHandler(manager *services.TerminalManager) *TerminalHandler {
	return &TerminalHandler{Manager: manager}
}

// List returns all terminals
func (h *TerminalHandler) List(c *fiber.Ctx) error {
	terminals := h.Manager.ListTerminals()
	return c.JSON(fiber.Map{"data": terminals})
}

// GetTree returns terminal hierarchy
func (h *TerminalHandler) GetTree(c *fiber.Ctx) error {
	tree := h.Manager.GetTree()
	return c.JSON(fiber.Map{"data": tree})
}

// Get returns a single terminal
func (h *TerminalHandler) Get(c *fiber.Ctx) error {
	id := c.Params("id")
	term, ok := h.Manager.GetTerminal(id)
	if !ok {
		return c.Status(404).JSON(fiber.Map{"error": "Terminal not found"})
	}
	return c.JSON(fiber.Map{"data": term})
}

// GetChildren returns children of a terminal
func (h *TerminalHandler) GetChildren(c *fiber.Ctx) error {
	id := c.Params("id")
	children := h.Manager.GetChildren(id)
	return c.JSON(fiber.Map{"data": children})
}

// Create spawns a new terminal
func (h *TerminalHandler) Create(c *fiber.Ctx) error {
	var body struct {
		Name     string  `json:"name"`
		Shell    string  `json:"shell"`
		CWD      string  `json:"cwd"`
		ParentID *string `json:"parentId"`
		Cols     uint16  `json:"cols"`
		Rows     uint16  `json:"rows"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	term, err := h.Manager.CreateTerminal(body.Name, body.Shell, body.CWD, body.ParentID, body.Cols, body.Rows)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(201).JSON(fiber.Map{"data": term})
}

// Kill stops a terminal (and its children)
func (h *TerminalHandler) Kill(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := h.Manager.KillTerminal(id); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"message": "Terminal killed"})
}

// Remove deletes a terminal completely
func (h *TerminalHandler) Remove(c *fiber.Ctx) error {
	id := c.Params("id")
	h.Manager.RemoveTerminal(id)
	return c.JSON(fiber.Map{"message": "Terminal removed"})
}

// Resize changes terminal dimensions
func (h *TerminalHandler) Resize(c *fiber.Ctx) error {
	id := c.Params("id")
	var body struct {
		Cols uint16 `json:"cols"`
		Rows uint16 `json:"rows"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	if err := h.Manager.ResizeTerminal(id, body.Cols, body.Rows); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"message": "Terminal resized"})
}

// Rename changes terminal name
func (h *TerminalHandler) Rename(c *fiber.Ctx) error {
	id := c.Params("id")
	var body struct {
		Name string `json:"name"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	if err := h.Manager.RenameTerminal(id, body.Name); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"message": "Terminal renamed"})
}

// Restart kills and respawns a terminal
func (h *TerminalHandler) Restart(c *fiber.Ctx) error {
	id := c.Params("id")
	term, err := h.Manager.RestartTerminal(id)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"data": term})
}

// WebSocketUpgrade is middleware to check if request is WS
func (h *TerminalHandler) WebSocketUpgrade(c *fiber.Ctx) error {
	if websocket.IsWebSocketUpgrade(c) {
		return c.Next()
	}
	return fiber.ErrUpgradeRequired
}

// WebSocket handles the WebSocket connection for a terminal
func (h *TerminalHandler) WebSocket(c *websocket.Conn) {
	termID := c.Params("id")
	clientID := uuid.New().String()

	// Register for output
	outputCh, replay, err := h.Manager.RegisterWSClient(termID, clientID)
	if err != nil {
		log.Printf("WS error: %v", err)
		c.WriteJSON(fiber.Map{"type": "error", "data": err.Error()})
		c.Close()
		return
	}
	defer h.Manager.UnregisterWSClient(termID, clientID)

	// Send replay buffer (existing output)
	if len(replay) > 0 {
		c.WriteMessage(websocket.BinaryMessage, replay)
	}

	// Send terminal info
	term, _ := h.Manager.GetTerminal(termID)
	if term != nil {
		infoJSON, _ := json.Marshal(fiber.Map{
			"type": "info",
			"data": fiber.Map{
				"id":   term.ID,
				"name": term.Name,
				"cols": term.Cols,
				"rows": term.Rows,
				"pid":  term.PID,
			},
		})
		c.WriteMessage(websocket.TextMessage, infoJSON)
	}

	// Read from WebSocket (user input) in a goroutine
	done := make(chan struct{})
	go func() {
		defer close(done)
		for {
			msgType, msg, err := c.ReadMessage()
			if err != nil {
				return
			}

			if msgType == websocket.TextMessage {
				// JSON control message
				var ctrl struct {
					Type string `json:"type"`
					Data string `json:"data"`
					Cols uint16 `json:"cols"`
					Rows uint16 `json:"rows"`
				}
				if json.Unmarshal(msg, &ctrl) == nil {
					switch ctrl.Type {
					case "input":
						h.Manager.WriteInput(termID, []byte(ctrl.Data))
					case "resize":
						h.Manager.ResizeTerminal(termID, ctrl.Cols, ctrl.Rows)
					}
				}
			} else if msgType == websocket.BinaryMessage {
				// Raw binary input
				h.Manager.WriteInput(termID, msg)
			}
		}
	}()

	// Write PTY output to WebSocket
	for {
		select {
		case data, ok := <-outputCh:
			if !ok {
				return
			}
			if err := c.WriteMessage(websocket.BinaryMessage, data); err != nil {
				return
			}
		case <-done:
			return
		}
	}
}
