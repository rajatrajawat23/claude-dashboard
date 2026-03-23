package handlers

import (
	"os/exec"
	"strings"

	"github.com/gofiber/fiber/v2"
)

type GitHandler struct {
	WorkDir string
}

func NewGitHandler(workDir string) *GitHandler {
	return &GitHandler{WorkDir: workDir}
}

func (h *GitHandler) Status(c *fiber.Ctx) error {
	dir := c.Query("dir", h.WorkDir)
	cmd := exec.Command("git", "status", "--porcelain")
	cmd.Dir = dir
	out, err := cmd.Output()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	lines := strings.Split(strings.TrimSpace(string(out)), "\n")
	var files []map[string]string
	for _, line := range lines {
		if len(line) < 3 {
			continue
		}
		files = append(files, map[string]string{
			"status": strings.TrimSpace(line[:2]),
			"file":   strings.TrimSpace(line[3:]),
		})
	}
	return c.JSON(fiber.Map{"data": files})
}

func (h *GitHandler) Branches(c *fiber.Ctx) error {
	dir := c.Query("dir", h.WorkDir)
	cmd := exec.Command("git", "branch", "-a", "--format=%(refname:short) %(objectname:short) %(HEAD)")
	cmd.Dir = dir
	out, err := cmd.Output()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	lines := strings.Split(strings.TrimSpace(string(out)), "\n")
	var branches []map[string]interface{}
	for _, line := range lines {
		parts := strings.Fields(line)
		if len(parts) < 2 {
			continue
		}
		branches = append(branches, map[string]interface{}{
			"name":    parts[0],
			"commit":  parts[1],
			"current": len(parts) > 2 && parts[2] == "*",
		})
	}
	return c.JSON(fiber.Map{"data": branches})
}

func (h *GitHandler) Commits(c *fiber.Ctx) error {
	dir := c.Query("dir", h.WorkDir)
	limit := c.Query("limit", "50")
	cmd := exec.Command("git", "log", "--format=%H|%h|%s|%an|%ar", "-n", limit)
	cmd.Dir = dir
	out, err := cmd.Output()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	lines := strings.Split(strings.TrimSpace(string(out)), "\n")
	var commits []map[string]string
	for _, line := range lines {
		parts := strings.SplitN(line, "|", 5)
		if len(parts) < 5 {
			continue
		}
		commits = append(commits, map[string]string{
			"hash":      parts[0],
			"shortHash": parts[1],
			"message":   parts[2],
			"author":    parts[3],
			"date":      parts[4],
		})
	}
	return c.JSON(fiber.Map{"data": commits})
}

func (h *GitHandler) Worktrees(c *fiber.Ctx) error {
	dir := c.Query("dir", h.WorkDir)
	cmd := exec.Command("git", "worktree", "list", "--porcelain")
	cmd.Dir = dir
	out, err := cmd.Output()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	blocks := strings.Split(strings.TrimSpace(string(out)), "\n\n")
	var worktrees []map[string]string
	for _, block := range blocks {
		wt := map[string]string{}
		for _, line := range strings.Split(block, "\n") {
			if strings.HasPrefix(line, "worktree ") {
				wt["path"] = strings.TrimPrefix(line, "worktree ")
			} else if strings.HasPrefix(line, "HEAD ") {
				wt["head"] = strings.TrimPrefix(line, "HEAD ")
			} else if strings.HasPrefix(line, "branch ") {
				wt["branch"] = strings.TrimPrefix(line, "branch refs/heads/")
			} else if line == "bare" {
				wt["bare"] = "true"
			}
		}
		if wt["path"] != "" {
			worktrees = append(worktrees, wt)
		}
	}
	return c.JSON(fiber.Map{"data": worktrees})
}
