package services

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
)

type ClaudeBridge struct {
	HomePath string
}

func NewClaudeBridge(homePath string) *ClaudeBridge {
	return &ClaudeBridge{HomePath: homePath}
}

type ClaudeSettingsFile struct {
	Permissions    json.RawMessage          `json:"permissions"`
	McpServers     map[string]MCPServerConf `json:"mcpServers"`
	EnabledPlugins json.RawMessage          `json:"enabledPlugins"`
	Env            map[string]string        `json:"env"`
}

type MCPServerConf struct {
	Command string            `json:"command"`
	Args    []string          `json:"args"`
	Env     map[string]string `json:"env,omitempty"`
}

func (b *ClaudeBridge) ReadSettings(scope string) (*ClaudeSettingsFile, error) {
	var filePath string
	switch scope {
	case "local":
		filePath = filepath.Join(b.HomePath, "settings.local.json")
	default:
		filePath = filepath.Join(b.HomePath, "settings.json")
	}

	data, err := os.ReadFile(filePath)
	if err != nil {
		return nil, err
	}

	var settings ClaudeSettingsFile
	if err := json.Unmarshal(data, &settings); err != nil {
		return nil, err
	}
	return &settings, nil
}

func (b *ClaudeBridge) WriteSettings(scope string, settings *ClaudeSettingsFile) error {
	var filePath string
	switch scope {
	case "local":
		filePath = filepath.Join(b.HomePath, "settings.local.json")
	default:
		filePath = filepath.Join(b.HomePath, "settings.json")
	}

	data, err := json.MarshalIndent(settings, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(filePath, data, 0644)
}

type ProjectSession struct {
	DirName      string `json:"dirName"`
	ProjectPath  string `json:"projectPath"`
	ProjectName  string `json:"projectName"`
	SessionCount int    `json:"sessionCount"`
	ModifiedAt   string `json:"modifiedAt"`
	HasMemory    bool   `json:"hasMemory"`
}

func (b *ClaudeBridge) ListSessions() ([]ProjectSession, error) {
	projectsDir := filepath.Join(b.HomePath, "projects")
	entries, err := os.ReadDir(projectsDir)
	if err != nil {
		return nil, err
	}

	var sessions []ProjectSession
	for _, entry := range entries {
		if !entry.IsDir() {
			continue
		}
		dirName := entry.Name()

		// Decode the directory name back to a filesystem path
		// e.g. "-Users-rajatrajawatpmac-claude-dashboard" -> "/Users/rajatrajawatpmac/claude-dashboard"
		projectPath := strings.ReplaceAll(dirName, "-", "/")
		// Fix double-dashes which represent literal dashes in the original path
		// Actually the encoding uses single dashes for path separators
		// The raw dirName with leading dash becomes a leading slash
		if !strings.HasPrefix(projectPath, "/") {
			projectPath = "/" + projectPath
		}

		// Project name is the last path segment
		parts := strings.Split(strings.TrimRight(projectPath, "/"), "/")
		projectName := dirName
		if len(parts) > 0 {
			projectName = parts[len(parts)-1]
		}

		// Count .jsonl session files inside the project dir
		subDir := filepath.Join(projectsDir, dirName)
		subEntries, err := os.ReadDir(subDir)
		sessionCount := 0
		hasMemory := false
		var latestMod string
		if err == nil {
			for _, sub := range subEntries {
				if !sub.IsDir() && strings.HasSuffix(sub.Name(), ".jsonl") {
					sessionCount++
					info, infoErr := sub.Info()
					if infoErr == nil {
						mod := info.ModTime().Format("2006-01-02T15:04:05Z07:00")
						if mod > latestMod {
							latestMod = mod
						}
					}
				}
				if sub.IsDir() && sub.Name() == "memory" {
					hasMemory = true
				}
			}
		}

		if latestMod == "" {
			info, infoErr := entry.Info()
			if infoErr == nil {
				latestMod = info.ModTime().Format("2006-01-02T15:04:05Z07:00")
			}
		}

		sessions = append(sessions, ProjectSession{
			DirName:      dirName,
			ProjectPath:  projectPath,
			ProjectName:  projectName,
			SessionCount: sessionCount,
			ModifiedAt:   latestMod,
			HasMemory:    hasMemory,
		})
	}
	return sessions, nil
}

func (b *ClaudeBridge) ListMemories() ([]MemoryFile, error) {
	memoryDir := filepath.Join(b.HomePath, "projects", "-Users-"+currentUser(), "memory")
	entries, err := os.ReadDir(memoryDir)
	if err != nil {
		return nil, err
	}

	var memories []MemoryFile
	for _, entry := range entries {
		if !entry.IsDir() && strings.HasSuffix(entry.Name(), ".md") {
			content, err := os.ReadFile(filepath.Join(memoryDir, entry.Name()))
			if err != nil {
				continue
			}
			memories = append(memories, MemoryFile{
				Name:    entry.Name(),
				Content: string(content),
				Path:    filepath.Join(memoryDir, entry.Name()),
			})
		}
	}
	return memories, nil
}

type MemoryFile struct {
	Name    string `json:"name"`
	Content string `json:"content"`
	Path    string `json:"path"`
}

func (b *ClaudeBridge) ReadMemory(name string) (*MemoryFile, error) {
	memoryDir := filepath.Join(b.HomePath, "projects", "-Users-"+currentUser(), "memory")
	filePath := filepath.Join(memoryDir, name)
	content, err := os.ReadFile(filePath)
	if err != nil {
		return nil, err
	}
	return &MemoryFile{
		Name:    name,
		Content: string(content),
		Path:    filePath,
	}, nil
}

func (b *ClaudeBridge) WriteMemory(name string, content string) error {
	memoryDir := filepath.Join(b.HomePath, "projects", "-Users-"+currentUser(), "memory")
	return os.WriteFile(filepath.Join(memoryDir, name), []byte(content), 0644)
}

func (b *ClaudeBridge) DeleteMemory(name string) error {
	memoryDir := filepath.Join(b.HomePath, "projects", "-Users-"+currentUser(), "memory")
	return os.Remove(filepath.Join(memoryDir, name))
}

func (b *ClaudeBridge) ListPlugins() ([]PluginInfo, error) {
	pluginsFile := filepath.Join(b.HomePath, "plugins", "installed_plugins.json")
	data, err := os.ReadFile(pluginsFile)
	if err != nil {
		return nil, err
	}

	var plugins []PluginInfo
	if err := json.Unmarshal(data, &plugins); err != nil {
		return nil, err
	}
	return plugins, nil
}

type PluginInfo struct {
	Name        string `json:"name"`
	Version     string `json:"version"`
	Marketplace string `json:"marketplace"`
	InstalledAt string `json:"installedAt"`
}

func (b *ClaudeBridge) GetFileHistory() ([]string, error) {
	historyDir := filepath.Join(b.HomePath, "file-history")
	entries, err := os.ReadDir(historyDir)
	if err != nil {
		return nil, err
	}

	var dirs []string
	for _, entry := range entries {
		if entry.IsDir() {
			dirs = append(dirs, entry.Name())
		}
	}
	return dirs, nil
}

func currentUser() string {
	home, _ := os.UserHomeDir()
	parts := strings.Split(home, string(os.PathSeparator))
	if len(parts) > 0 {
		return parts[len(parts)-1]
	}
	return "unknown"
}
