# Claude Dashboard - System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                          │
│  React 18 + TypeScript + Vite + shadcn/ui           │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐    │
│  │ Zustand   │ │ TanStack │ │ WebSocket Client │    │
│  │ (State)   │ │ (Cache)  │ │ (Real-time)      │    │
│  └──────────┘ └──────────┘ └──────────────────┘    │
│  ┌──────────────────────────────────────────────┐   │
│  │ Theme Engine (40+40 shades, 200 colors)      │   │
│  └──────────────────────────────────────────────┘   │
└───────────────────────┬─────────────────────────────┘
                        │ HTTP/REST + WebSocket
┌───────────────────────┴─────────────────────────────┐
│                    BACKEND                           │
│  Go 1.22 + Fiber v2                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐    │
│  │ REST API  │ │ WS Hub   │ │ File Watcher     │    │
│  │ (Fiber)   │ │ (Gorilla)│ │ (fsnotify)       │    │
│  └──────────┘ └──────────┘ └──────────────────┘    │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐    │
│  │ PTY Mgr   │ │ Git Ops  │ │ Claude Bridge    │    │
│  │ (creack)  │ │ (go-git) │ │ (CLI wrapper)    │    │
│  └──────────┘ └──────────┘ └──────────────────┘    │
└───────────────────────┬─────────────────────────────┘
                        │
┌───────────────────────┴─────────────────────────────┐
│                  DATA LAYER                          │
│  ┌──────────────┐  ┌───────────────────────────┐    │
│  │ PostgreSQL 16 │  │ File System               │    │
│  │ (App State)   │  │ (~/.claude/ configs)      │    │
│  └──────────────┘  └───────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Directory Structure
```
frontend/
├── public/
│   └── favicon.svg
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── router.tsx
│   │   └── providers.tsx
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components
│   │   ├── layout/
│   │   │   ├── AppShell.tsx       # Main layout wrapper
│   │   │   ├── Sidebar.tsx        # Dynamic sidebar (6 variants)
│   │   │   ├── Header.tsx
│   │   │   ├── Breadcrumbs.tsx
│   │   │   └── CommandPalette.tsx
│   │   ├── terminal/
│   │   │   ├── TerminalView.tsx   # xterm.js wrapper
│   │   │   ├── TerminalTabs.tsx
│   │   │   └── TerminalSplit.tsx
│   │   ├── session/
│   │   │   ├── SessionTree.tsx    # Hierarchy tree
│   │   │   ├── ChatViewer.tsx
│   │   │   └── SessionCard.tsx
│   │   ├── settings/
│   │   │   ├── SettingsForm.tsx
│   │   │   ├── PermissionGrid.tsx
│   │   │   └── MCPConfig.tsx
│   │   ├── git/
│   │   │   ├── BranchTree.tsx
│   │   │   ├── CommitGraph.tsx
│   │   │   ├── DiffViewer.tsx
│   │   │   └── PRCard.tsx
│   │   ├── worktree/
│   │   │   ├── WorktreeList.tsx
│   │   │   └── WorktreeCompare.tsx
│   │   ├── plugin/
│   │   │   ├── PluginCard.tsx
│   │   │   └── MarketplaceGrid.tsx
│   │   ├── memory/
│   │   │   ├── MemoryEditor.tsx
│   │   │   └── MemoryTimeline.tsx
│   │   └── theme/
│   │       ├── ThemeStudio.tsx
│   │       ├── ColorPicker.tsx
│   │       └── SidebarPreview.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Settings.tsx
│   │   ├── Terminals.tsx
│   │   ├── Sessions.tsx
│   │   ├── Worktrees.tsx
│   │   ├── Git.tsx
│   │   ├── GitHub.tsx
│   │   ├── Plugins.tsx
│   │   ├── Memory.tsx
│   │   ├── Database.tsx
│   │   ├── FileHistory.tsx
│   │   ├── Tasks.tsx
│   │   ├── ThemeStudio.tsx
│   │   └── About.tsx
│   ├── hooks/
│   │   ├── useTheme.ts
│   │   ├── useWebSocket.ts
│   │   ├── useTerminal.ts
│   │   ├── useSettings.ts
│   │   └── useSidebar.ts
│   ├── stores/
│   │   ├── themeStore.ts
│   │   ├── sidebarStore.ts
│   │   ├── terminalStore.ts
│   │   └── sessionStore.ts
│   ├── lib/
│   │   ├── api.ts               # Axios/fetch client
│   │   ├── ws.ts                # WebSocket client
│   │   ├── utils.ts             # shadcn utils
│   │   └── cn.ts
│   ├── theme/
│   │   ├── tokens.ts            # Design tokens
│   │   ├── colors.ts            # 200 color palette
│   │   ├── shades.ts            # 40+40 shade definitions
│   │   ├── radius.ts            # Dynamic border radius
│   │   ├── sidebar-variants.ts  # 6 sidebar designs
│   │   └── index.css            # CSS custom properties
│   ├── types/
│   │   ├── settings.ts
│   │   ├── session.ts
│   │   ├── terminal.ts
│   │   ├── git.ts
│   │   ├── theme.ts
│   │   └── api.ts
│   └── main.tsx
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── components.json            # shadcn config
```

### State Management Strategy
- **Zustand**: UI state (sidebar, theme, modals, layout preferences)
- **TanStack Query**: Server state (settings, sessions, git data, plugins)
- **WebSocket**: Real-time state (terminal output, file changes, session updates)

### Sidebar Variants
1. **Minimal** - Icons only, expand on hover
2. **Compact** - Small icons + labels
3. **Standard** - Full sidebar with sections
4. **Floating** - Overlay sidebar with blur background
5. **Docked** - Collapsible panels like VS Code
6. **Rail** - Thin rail + flyout panels

## Backend Architecture

### Directory Structure
```
backend/
├── cmd/
│   └── server/
│       └── main.go
├── internal/
│   ├── config/
│   │   └── config.go
│   ├── database/
│   │   ├── postgres.go
│   │   └── migrations/
│   │       └── 001_initial.go
│   ├── models/
│   │   ├── setting.go
│   │   ├── session.go
│   │   ├── terminal.go
│   │   ├── worktree.go
│   │   ├── plugin.go
│   │   ├── memory.go
│   │   ├── theme.go
│   │   └── task.go
│   ├── handlers/
│   │   ├── settings.go
│   │   ├── sessions.go
│   │   ├── terminals.go
│   │   ├── worktrees.go
│   │   ├── git.go
│   │   ├── github.go
│   │   ├── plugins.go
│   │   ├── memory.go
│   │   ├── database.go
│   │   ├── files.go
│   │   ├── tasks.go
│   │   ├── theme.go
│   │   └── ws.go
│   ├── services/
│   │   ├── claude_bridge.go    # Reads/writes ~/.claude/
│   │   ├── terminal_mgr.go    # PTY management
│   │   ├── git_service.go     # Git operations
│   │   ├── github_service.go  # GitHub API
│   │   ├── file_watcher.go    # fsnotify
│   │   └── ws_hub.go          # WebSocket hub
│   ├── middleware/
│   │   ├── auth.go
│   │   ├── cors.go
│   │   ├── logger.go
│   │   └── ratelimit.go
│   └── routes/
│       └── routes.go
├── pkg/
│   └── utils/
│       └── helpers.go
├── go.mod
├── go.sum
├── Makefile
└── Dockerfile
```

### API Design (RESTful)

#### Settings API
```
GET    /api/v1/settings                 # Get all settings
GET    /api/v1/settings/global          # Get global settings
GET    /api/v1/settings/local           # Get local settings
PUT    /api/v1/settings/global          # Update global settings
PUT    /api/v1/settings/local           # Update local settings
GET    /api/v1/settings/permissions     # List permissions
POST   /api/v1/settings/permissions     # Add permission
DELETE /api/v1/settings/permissions/:id # Remove permission
GET    /api/v1/settings/mcp            # List MCP servers
POST   /api/v1/settings/mcp            # Add MCP server
PUT    /api/v1/settings/mcp/:name      # Update MCP server
DELETE /api/v1/settings/mcp/:name      # Remove MCP server
POST   /api/v1/settings/export         # Export settings
POST   /api/v1/settings/import         # Import settings
```

#### Sessions API
```
GET    /api/v1/sessions                 # List sessions
GET    /api/v1/sessions/:id             # Get session detail
GET    /api/v1/sessions/:id/chat        # Get session chat history
GET    /api/v1/sessions/tree            # Get session hierarchy
DELETE /api/v1/sessions/:id             # Archive session
POST   /api/v1/sessions/:id/export      # Export session
```

#### Terminals API
```
GET    /api/v1/terminals                # List terminals
POST   /api/v1/terminals                # Create terminal
GET    /api/v1/terminals/:id            # Get terminal info
DELETE /api/v1/terminals/:id            # Close terminal
POST   /api/v1/terminals/:id/resize     # Resize terminal
WS     /api/v1/terminals/:id/ws         # Terminal WebSocket
```

#### Git API
```
GET    /api/v1/git/status               # Git status
GET    /api/v1/git/branches             # List branches
POST   /api/v1/git/branches             # Create branch
DELETE /api/v1/git/branches/:name       # Delete branch
GET    /api/v1/git/commits              # Commit history
GET    /api/v1/git/commits/:hash        # Commit detail
GET    /api/v1/git/diff                 # Current diff
GET    /api/v1/git/worktrees            # List worktrees
POST   /api/v1/git/worktrees            # Create worktree
DELETE /api/v1/git/worktrees/:path      # Remove worktree
```

#### GitHub API
```
GET    /api/v1/github/repos             # List repos
GET    /api/v1/github/prs               # List PRs
GET    /api/v1/github/prs/:number       # PR detail
GET    /api/v1/github/issues            # List issues
GET    /api/v1/github/actions           # Actions status
```

#### Plugins API
```
GET    /api/v1/plugins                  # List installed plugins
GET    /api/v1/plugins/marketplace      # Browse marketplace
POST   /api/v1/plugins/install          # Install plugin
DELETE /api/v1/plugins/:name            # Uninstall plugin
PUT    /api/v1/plugins/:name/toggle     # Enable/disable
GET    /api/v1/plugins/blocklist        # Get blocklist
POST   /api/v1/plugins/blocklist        # Add to blocklist
```

#### Memory API
```
GET    /api/v1/memory                   # List memories
GET    /api/v1/memory/:name             # Get memory
POST   /api/v1/memory                   # Create memory
PUT    /api/v1/memory/:name             # Update memory
DELETE /api/v1/memory/:name             # Delete memory
GET    /api/v1/memory/index             # Get MEMORY.md
```

#### Theme API
```
GET    /api/v1/theme                    # Get current theme
PUT    /api/v1/theme                    # Save theme
GET    /api/v1/theme/presets            # List presets
POST   /api/v1/theme/presets            # Save preset
```

#### System API
```
GET    /api/v1/system/health            # Health check
GET    /api/v1/system/info              # System info
GET    /api/v1/system/stats             # Usage statistics
WS     /api/v1/system/ws               # System events WebSocket
```

## Database Schema

See `03-DATABASE.md` for complete schema.

## Deployment Architecture

```
┌────────────────────────────┐
│   Docker Compose           │
│  ┌────────────────────┐    │
│  │  Frontend (nginx)   │   │
│  │  :3000              │   │
│  └─────────┬──────────┘   │
│  ┌─────────┴──────────┐   │
│  │  Backend (Go)       │   │
│  │  :8080              │   │
│  └─────────┬──────────┘   │
│  ┌─────────┴──────────┐   │
│  │  PostgreSQL         │   │
│  │  :5432              │   │
│  └────────────────────┘   │
└────────────────────────────┘
```
