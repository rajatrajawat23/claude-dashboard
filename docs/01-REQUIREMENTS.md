# Claude Dashboard - Requirements Specification

## Project Overview
**Name**: Claude Dashboard
**Type**: Full-Stack Web Application
**Purpose**: Comprehensive management dashboard for Claude Code CLI - settings, terminals, sessions, worktrees, git, plugins, memory, and more.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| UI Library | shadcn/ui + Tailwind CSS 4 |
| Icons | Lucide React + React Icons (200+ icons) |
| State | Zustand + TanStack Query |
| Routing | React Router v7 |
| Backend | Go 1.22 + Fiber v2 |
| ORM | GORM |
| Database | PostgreSQL 16 |
| Real-time | WebSocket (gorilla/websocket) |
| Terminal | xterm.js (frontend) + pty (backend) |
| Auth | JWT + session-based |

---

## Functional Requirements

### FR-01: Settings Management
- Read/display all Claude Code settings (settings.json, settings.local.json)
- CRUD operations on settings with live preview
- Permission management (bash commands, tools, directories)
- MCP server configuration
- Plugin management (install/uninstall/enable/disable)
- Effort level configuration
- Settings diff viewer (local vs global)
- Import/Export settings
- Settings history with rollback

### FR-02: Terminal Management
- List all active terminal sessions
- Open new terminal instances
- View terminal output in real-time (xterm.js)
- Send commands to terminals
- Terminal tabs with drag-and-drop reorder
- Split terminal views (horizontal/vertical)
- Terminal session persistence
- Terminal themes (synced with app theme)

### FR-03: Session & Chat Management
- View all Claude Code sessions (active/archived)
- Session hierarchy (parent -> child sessions)
- Multi-hierarchy tree view
- Session chat history viewer
- Session metadata (duration, tokens, cost)
- Session search and filter
- Session export (JSON/Markdown)
- Resume/continue sessions

### FR-04: Worktree Management
- List all git worktrees
- Create new worktrees
- Switch between worktrees
- Delete worktrees (with safety checks)
- Worktree status indicators
- Branch association view
- Merge worktree changes
- Worktree comparison view

### FR-05: Git & GitHub Integration
- Repository overview dashboard
- Branch management (create/delete/switch)
- Commit history with diff viewer
- Staged/unstaged changes view
- Pull request management
- Issue tracker integration
- GitHub Actions status
- Repository statistics

### FR-06: Database Management
- Connection management
- Schema browser
- Query editor with syntax highlighting
- Query history
- Table data viewer with pagination
- Migration management
- Database statistics

### FR-07: Plugin Ecosystem
- Installed plugins list
- Plugin marketplace browser
- Plugin configuration editor
- Plugin enable/disable toggle
- Plugin version management
- Plugin blocklist management

### FR-08: Memory Management
- View all memory files
- Create/edit/delete memories
- Memory categorization (user/feedback/project/reference)
- Memory search
- Memory timeline view
- MEMORY.md index manager

### FR-09: File History & Backups
- File version browser
- Version diff viewer
- Restore from backup
- Backup configuration
- Backup schedule management

### FR-10: Task & Progress Tracking
- Active task list
- Task creation/management
- Task dependencies
- Progress visualization
- Task history

---

## Non-Functional Requirements

### NFR-01: Theming System
- Dark theme: 40 color shades (slate-900 to slate-50 spectrum)
- Light theme: 40 color shades (white to gray spectrum)
- 200 named colors for icons, badges, charts, status indicators
- Dynamic border radius (0px to 24px, configurable)
- 6 sidebar design variants
- Theme persistence (localStorage + DB sync)
- System theme auto-detection
- Smooth theme transitions (300ms)
- CSS custom properties for all tokens
- Apple-like design aesthetics (SF Pro-inspired, glassmorphism, subtle shadows)

### NFR-02: Performance
- First Contentful Paint < 1.5s
- Lighthouse score > 90
- Virtual scrolling for large lists
- Code splitting per route
- WebSocket for real-time updates (no polling)

### NFR-03: Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- Focus management
- Color contrast ratios maintained across all themes

### NFR-04: Security
- JWT authentication
- CORS configuration
- Input sanitization
- SQL injection prevention (GORM parameterized queries)
- XSS prevention
- Rate limiting
- HTTPS enforcement

---

## User Personas

### P1: Developer (Primary)
- Uses Claude Code daily
- Needs quick access to settings and terminals
- Wants visual overview of all sessions and worktrees

### P2: Team Lead
- Monitors multiple sessions
- Reviews git/GitHub activity
- Manages team settings templates

---

## Pages & Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Dashboard | Overview with key metrics and quick actions |
| `/settings` | Settings | Claude Code settings CRUD |
| `/settings/permissions` | Permissions | Permission management |
| `/settings/mcp` | MCP Servers | MCP server configuration |
| `/terminals` | Terminals | Terminal manager |
| `/sessions` | Sessions | Session browser and hierarchy |
| `/sessions/:id` | Session Detail | Chat history and metadata |
| `/worktrees` | Worktrees | Worktree management |
| `/git` | Git | Repository and branch management |
| `/git/commits` | Commits | Commit history |
| `/git/prs` | Pull Requests | PR management |
| `/github` | GitHub | GitHub integration |
| `/plugins` | Plugins | Plugin management |
| `/plugins/marketplace` | Marketplace | Plugin marketplace |
| `/memory` | Memory | Memory management |
| `/database` | Database | DB management |
| `/files` | File History | File version browser |
| `/tasks` | Tasks | Task tracker |
| `/theme` | Theme Studio | Theme customization |
| `/about` | About | App info and system status |
