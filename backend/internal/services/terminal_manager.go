package services

import (
	"fmt"
	"io"
	"os"
	"os/exec"
	"sync"
	"time"

	"github.com/creack/pty"
	"github.com/google/uuid"
)

// TerminalStatus represents the state of a terminal
type TerminalStatus string

const (
	StatusRunning TerminalStatus = "running"
	StatusStopped TerminalStatus = "stopped"
	StatusError   TerminalStatus = "error"
)

// TerminalInstance represents a single terminal with PTY
type TerminalInstance struct {
	ID         string         `json:"id"`
	Name       string         `json:"name"`
	ParentID   *string        `json:"parentId"`
	Shell      string         `json:"shell"`
	CWD        string         `json:"cwd"`
	PID        int            `json:"pid"`
	Cols       uint16         `json:"cols"`
	Rows       uint16         `json:"rows"`
	Status     TerminalStatus `json:"status"`
	CreatedAt  time.Time      `json:"createdAt"`
	LastActive time.Time      `json:"lastActive"`
	ExitCode   *int           `json:"exitCode"`

	// Internal - not serialized
	cmd       *exec.Cmd
	ptmx      *os.File // PTY master
	mu        sync.Mutex
	outputBuf []byte                 // Ring buffer for recent output
	wsClients map[string]chan []byte // WebSocket client channels
	wsMu      sync.RWMutex
	done      chan struct{}
}

// TerminalTree represents a terminal with its children for hierarchy view
type TerminalTree struct {
	TerminalInstance
	Children []*TerminalTree `json:"children"`
}

// TerminalManager manages all terminal instances
type TerminalManager struct {
	terminals map[string]*TerminalInstance
	mu        sync.RWMutex
}

// NewTerminalManager creates a new terminal manager
func NewTerminalManager() *TerminalManager {
	return &TerminalManager{
		terminals: make(map[string]*TerminalInstance),
	}
}

// CreateTerminal spawns a new PTY terminal
func (m *TerminalManager) CreateTerminal(name, shell, cwd string, parentID *string, cols, rows uint16) (*TerminalInstance, error) {
	if shell == "" {
		shell = "/bin/zsh"
	}
	if cwd == "" {
		cwd, _ = os.UserHomeDir()
	}
	if cols == 0 {
		cols = 120
	}
	if rows == 0 {
		rows = 30
	}
	if name == "" {
		name = "Terminal"
	}

	// If parent exists, inherit CWD when no explicit CWD given
	if parentID != nil {
		m.mu.RLock()
		parent, ok := m.terminals[*parentID]
		m.mu.RUnlock()
		if ok && cwd == "" {
			cwd = parent.CWD
		}
	}

	id := uuid.New().String()

	cmd := exec.Command(shell)
	cmd.Dir = cwd
	cmd.Env = append(os.Environ(),
		"TERM=xterm-256color",
		fmt.Sprintf("CLAUDE_TERMINAL_ID=%s", id),
	)

	// Start PTY
	ptmx, err := pty.StartWithSize(cmd, &pty.Winsize{
		Rows: rows,
		Cols: cols,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to start PTY: %w", err)
	}

	term := &TerminalInstance{
		ID:         id,
		Name:       name,
		ParentID:   parentID,
		Shell:      shell,
		CWD:        cwd,
		PID:        cmd.Process.Pid,
		Cols:       cols,
		Rows:       rows,
		Status:     StatusRunning,
		CreatedAt:  time.Now(),
		LastActive: time.Now(),
		cmd:        cmd,
		ptmx:       ptmx,
		outputBuf:  make([]byte, 0, 64*1024), // 64KB buffer
		wsClients:  make(map[string]chan []byte),
		done:       make(chan struct{}),
	}

	m.mu.Lock()
	m.terminals[id] = term
	m.mu.Unlock()

	// Start output reader goroutine
	go m.readOutput(term)

	// Start process waiter goroutine
	go m.waitProcess(term)

	return term, nil
}

// readOutput reads PTY output and broadcasts to WebSocket clients
func (m *TerminalManager) readOutput(term *TerminalInstance) {
	buf := make([]byte, 4096)
	for {
		n, err := term.ptmx.Read(buf)
		if n > 0 {
			data := make([]byte, n)
			copy(data, buf[:n])

			term.mu.Lock()
			// Keep last 64KB in buffer
			term.outputBuf = append(term.outputBuf, data...)
			if len(term.outputBuf) > 64*1024 {
				term.outputBuf = term.outputBuf[len(term.outputBuf)-64*1024:]
			}
			term.LastActive = time.Now()
			term.mu.Unlock()

			// Broadcast to all WebSocket clients
			term.wsMu.RLock()
			for _, ch := range term.wsClients {
				select {
				case ch <- data:
				default:
					// Client channel full, skip
				}
			}
			term.wsMu.RUnlock()
		}
		if err != nil {
			if err != io.EOF {
				// Unexpected read error; logged implicitly by exiting
				_ = err
			}
			break
		}
	}
}

// waitProcess waits for the shell process to exit
func (m *TerminalManager) waitProcess(term *TerminalInstance) {
	err := term.cmd.Wait()

	term.mu.Lock()
	if err != nil {
		term.Status = StatusError
		exitCode := -1
		if exitErr, ok := err.(*exec.ExitError); ok {
			exitCode = exitErr.ExitCode()
		}
		term.ExitCode = &exitCode
	} else {
		term.Status = StatusStopped
		exitCode := 0
		term.ExitCode = &exitCode
	}
	term.mu.Unlock()

	close(term.done)
}

// WriteInput sends input to the terminal PTY
func (m *TerminalManager) WriteInput(id string, data []byte) error {
	m.mu.RLock()
	term, ok := m.terminals[id]
	m.mu.RUnlock()
	if !ok {
		return fmt.Errorf("terminal not found: %s", id)
	}
	if term.Status != StatusRunning {
		return fmt.Errorf("terminal is not running")
	}

	_, err := term.ptmx.Write(data)
	if err != nil {
		return fmt.Errorf("failed to write to PTY: %w", err)
	}
	term.mu.Lock()
	term.LastActive = time.Now()
	term.mu.Unlock()
	return nil
}

// ResizeTerminal resizes the PTY
func (m *TerminalManager) ResizeTerminal(id string, cols, rows uint16) error {
	m.mu.RLock()
	term, ok := m.terminals[id]
	m.mu.RUnlock()
	if !ok {
		return fmt.Errorf("terminal not found: %s", id)
	}

	err := pty.Setsize(term.ptmx, &pty.Winsize{
		Rows: rows,
		Cols: cols,
	})
	if err != nil {
		return err
	}

	term.mu.Lock()
	term.Cols = cols
	term.Rows = rows
	term.mu.Unlock()
	return nil
}

// KillTerminal kills a terminal and all its children
func (m *TerminalManager) KillTerminal(id string) error {
	// First kill all children recursively
	children := m.GetChildren(id)
	for _, child := range children {
		_ = m.KillTerminal(child.ID)
	}

	m.mu.RLock()
	term, ok := m.terminals[id]
	m.mu.RUnlock()
	if !ok {
		return fmt.Errorf("terminal not found: %s", id)
	}

	if term.cmd.Process != nil {
		_ = term.cmd.Process.Kill()
	}
	if term.ptmx != nil {
		_ = term.ptmx.Close()
	}

	// Wait for process to finish
	select {
	case <-term.done:
	case <-time.After(3 * time.Second):
	}

	return nil
}

// RemoveTerminal removes a terminal from the registry
func (m *TerminalManager) RemoveTerminal(id string) {
	// First kill it if running
	_ = m.KillTerminal(id)

	m.mu.Lock()
	delete(m.terminals, id)
	m.mu.Unlock()
}

// GetTerminal returns a terminal by ID
func (m *TerminalManager) GetTerminal(id string) (*TerminalInstance, bool) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	term, ok := m.terminals[id]
	return term, ok
}

// ListTerminals returns all terminals
func (m *TerminalManager) ListTerminals() []*TerminalInstance {
	m.mu.RLock()
	defer m.mu.RUnlock()

	list := make([]*TerminalInstance, 0, len(m.terminals))
	for _, term := range m.terminals {
		list = append(list, term)
	}
	return list
}

// GetChildren returns direct children of a terminal
func (m *TerminalManager) GetChildren(parentID string) []*TerminalInstance {
	m.mu.RLock()
	defer m.mu.RUnlock()

	var children []*TerminalInstance
	for _, term := range m.terminals {
		if term.ParentID != nil && *term.ParentID == parentID {
			children = append(children, term)
		}
	}
	return children
}

// GetRootTerminals returns terminals with no parent
func (m *TerminalManager) GetRootTerminals() []*TerminalInstance {
	m.mu.RLock()
	defer m.mu.RUnlock()

	var roots []*TerminalInstance
	for _, term := range m.terminals {
		if term.ParentID == nil {
			roots = append(roots, term)
		}
	}
	return roots
}

// GetTree builds the full terminal hierarchy tree
func (m *TerminalManager) GetTree() []*TerminalTree {
	roots := m.GetRootTerminals()
	trees := make([]*TerminalTree, len(roots))
	for i, root := range roots {
		trees[i] = m.buildTree(root)
	}
	return trees
}

func (m *TerminalManager) buildTree(term *TerminalInstance) *TerminalTree {
	tree := &TerminalTree{
		TerminalInstance: *term,
	}
	children := m.GetChildren(term.ID)
	tree.Children = make([]*TerminalTree, len(children))
	for i, child := range children {
		tree.Children[i] = m.buildTree(child)
	}
	return tree
}

// RegisterWSClient registers a WebSocket client for terminal output
func (m *TerminalManager) RegisterWSClient(termID, clientID string) (chan []byte, []byte, error) {
	m.mu.RLock()
	term, ok := m.terminals[termID]
	m.mu.RUnlock()
	if !ok {
		return nil, nil, fmt.Errorf("terminal not found: %s", termID)
	}

	ch := make(chan []byte, 256)

	term.wsMu.Lock()
	term.wsClients[clientID] = ch
	term.wsMu.Unlock()

	// Return existing buffer for replay
	term.mu.Lock()
	buf := make([]byte, len(term.outputBuf))
	copy(buf, term.outputBuf)
	term.mu.Unlock()

	return ch, buf, nil
}

// UnregisterWSClient removes a WebSocket client
func (m *TerminalManager) UnregisterWSClient(termID, clientID string) {
	m.mu.RLock()
	term, ok := m.terminals[termID]
	m.mu.RUnlock()
	if !ok {
		return
	}

	term.wsMu.Lock()
	if ch, exists := term.wsClients[clientID]; exists {
		close(ch)
		delete(term.wsClients, clientID)
	}
	term.wsMu.Unlock()
}

// RenameTerminal renames a terminal
func (m *TerminalManager) RenameTerminal(id, name string) error {
	m.mu.RLock()
	term, ok := m.terminals[id]
	m.mu.RUnlock()
	if !ok {
		return fmt.Errorf("terminal not found: %s", id)
	}
	term.mu.Lock()
	term.Name = name
	term.mu.Unlock()
	return nil
}

// RestartTerminal kills and respawns a terminal with the same config
func (m *TerminalManager) RestartTerminal(id string) (*TerminalInstance, error) {
	m.mu.RLock()
	old, ok := m.terminals[id]
	m.mu.RUnlock()
	if !ok {
		return nil, fmt.Errorf("terminal not found: %s", id)
	}

	// Save config
	name := old.Name
	shell := old.Shell
	cwd := old.CWD
	parentID := old.ParentID
	cols := old.Cols
	rows := old.Rows

	// Kill old
	m.RemoveTerminal(id)

	// Create new with same config
	return m.CreateTerminal(name, shell, cwd, parentID, cols, rows)
}
