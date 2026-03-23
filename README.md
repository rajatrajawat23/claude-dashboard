# Claude Dashboard

A full-stack management dashboard for [Claude Code](https://claude.ai/claude-code) CLI. View and manage your settings, terminals, sessions, worktrees, plugins, memory, git history, and more from a single, beautiful interface.

![React](https://img.shields.io/badge/React_18-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Go](https://img.shields.io/badge/Go_1.22-00ADD8?style=flat&logo=go&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL_16-4169E1?style=flat&logo=postgresql&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Fiber](https://img.shields.io/badge/Fiber_v2-00ACD7?style=flat&logo=go&logoColor=white)

---

## Features

### Settings Management
- View all Claude Code permissions (bash commands, tools, directories)
- Add and remove permissions in real-time
- Toggle MCP servers on/off
- Compare global vs local settings side-by-side
- Configure effort level (low / medium / high / max)

### Memory Management
- View all persistent memory files from `~/.claude/`
- Full CRUD: create, edit, and delete memory files
- Auto-parses YAML frontmatter (name, type, description)
- Filter by type (user, feedback, project, reference)
- Search across all memories
- Sort by name or type

### Git Integration
- Real commit history with search
- Branch listing with current branch indicator
- File change status (added, modified, deleted)
- Worktree management
- Refresh button for live updates

### Task Tracker
- Create, edit, and delete tasks
- Click-to-cycle status: pending → in progress → completed
- Reorder tasks with up/down controls
- Filter by status
- Progress bar visualization
- Persists to localStorage

### Terminal Manager
- Tabbed terminal interface
- Add and close terminal tabs
- Terminal theme synced with app theme

### Plugin Manager
- View installed Claude Code plugins
- Browse plugin marketplace
- View blocked plugins

### Theme Studio
- Dark / Light / System mode toggle
- Dynamic border radius (0x to 2x multiplier)
- 6 sidebar design variants (Minimal, Compact, Standard, Floating, Docked, Rail)
- Live color palette preview
- All preferences persist across sessions

### Dashboard
- Real-time stats from API (memory count, plugins, branches, worktrees)
- Recent git commits feed
- System health indicator
- Quick action shortcuts
- Auto-refreshes every 30 seconds

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite |
| **UI** | shadcn/ui (25+ components), Tailwind CSS 4 |
| **State** | Zustand (persisted), TanStack Query |
| **Icons** | Lucide React (200+ icons) |
| **Backend** | Go 1.22, Fiber v2 |
| **ORM** | GORM |
| **Database** | PostgreSQL 16 |
| **Real-time** | WebSocket (gorilla/websocket) |

---

## Theme System

The dashboard ships with a rich, Apple-inspired design system:

- **200 named colors** across 12 categories (brand, accent, status, chart, terminal, git, badge, icon, overlay)
- **80 shade tokens** — 40 for dark mode, 40 for light mode
- **Dynamic border radius** — configurable multiplier from sharp (0x) to round (2x)
- **6 sidebar variants** — Minimal, Compact, Standard, Floating, Docked, Rail
- **CSS custom properties** for all tokens (`--shade-1` through `--shade-40`, `--brand-50` through `--brand-900`, etc.)
- **Smooth transitions** on theme switch (300ms)

---

## Project Structure

```
claude-dashboard/
├── docs/                          # SDLC documentation
│   ├── 01-REQUIREMENTS.md         # Functional & non-functional requirements
│   ├── 02-ARCHITECTURE.md         # System architecture & API design
│   ├── 03-DATABASE.md             # PostgreSQL schema (15 tables)
│   ├── 04-THEMING.md              # 200 colors, 80 shades, 6 sidebar variants
│   └── 05-IMPLEMENTATION-PLAN.md  # 7-phase SDLC implementation plan
├── frontend/                      # React + Vite + TypeScript
│   └── src/
│       ├── app/                   # App root, router, providers
│       ├── components/
│       │   ├── ui/                # 25 shadcn/ui components
│       │   └── layout/            # AppShell, Sidebar, Header
│       ├── pages/                 # 11 page components
│       ├── stores/                # Zustand stores (theme, sidebar, tasks)
│       ├── hooks/                 # useTheme, useMobile
│       ├── theme/                 # Color tokens, shades, radius, sidebar variants
│       ├── lib/                   # API client (axios), WebSocket client, utils
│       └── types/                 # TypeScript interfaces
├── backend/                       # Go + Fiber v2
│   ├── cmd/server/                # Entry point
│   ├── internal/
│   │   ├── config/                # Environment configuration
│   │   ├── database/              # PostgreSQL connection + migrations
│   │   ├── models/                # 15 GORM models
│   │   ├── handlers/              # 10 handler files, 36+ endpoints
│   │   ├── services/              # Claude Bridge (reads ~/.claude/)
│   │   └── routes/                # Route registration
│   └── pkg/utils/                 # File helpers
├── database/
│   └── init.sql                   # PostgreSQL initialization
├── scripts/
│   └── continue.sh                # Progress tracker & continuation script
├── docker-compose.yml             # Frontend + Backend + PostgreSQL
├── .env.example                   # Environment variables template
└── CLAUDE.md                      # Claude Code project instructions
```

---

## Getting Started

### Prerequisites

- **Node.js** 20+
- **Go** 1.22+
- **PostgreSQL** 16+ (optional — backend runs without it)

### Quick Start

```bash
# Clone
git clone https://github.com/rajatrajawat23/claude-dashboard.git
cd claude-dashboard

# Frontend
cd frontend
npm install
npm run dev           # Starts on http://localhost:3000

# Backend (new terminal)
cd backend
go mod tidy
go run ./cmd/server   # Starts on http://localhost:8080
```

Open **http://localhost:3000** in your browser.

### With Docker

```bash
cp .env.example .env
docker-compose up -d
```

This starts all three services:
- Frontend on port **3000**
- Backend on port **8080**
- PostgreSQL on port **5433**

---

## API Endpoints

### Claude Settings (reads from `~/.claude/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/claude/settings/global` | Read global settings |
| GET | `/api/v1/claude/settings/local` | Read local settings |
| PUT | `/api/v1/claude/settings/global` | Update global settings |
| PUT | `/api/v1/claude/settings/local` | Update local settings |

### Memory (reads from `~/.claude/memory/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/memory` | List all memory files |
| GET | `/api/v1/memory/:name` | Read a specific memory |
| POST | `/api/v1/memory` | Create a new memory |
| PUT | `/api/v1/memory/:name` | Update a memory |
| DELETE | `/api/v1/memory/:name` | Delete a memory |

### Git
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/git/status?dir=...` | Git status (porcelain) |
| GET | `/api/v1/git/branches?dir=...` | List branches |
| GET | `/api/v1/git/commits?dir=...&limit=50` | Commit history |
| GET | `/api/v1/git/worktrees?dir=...` | List worktrees |

### Plugins
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/plugins` | List installed plugins |
| PUT | `/api/v1/plugins/:id/toggle` | Toggle plugin (DB required) |

### System
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/health` | Health check + DB status |
| GET | `/api/v1/system/info` | System info |

### Database-Dependent (requires PostgreSQL)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/settings` | DB-stored settings |
| GET/POST | `/api/v1/sessions` | Session management |
| GET/POST | `/api/v1/terminals` | Terminal management |
| GET/PUT | `/api/v1/theme` | Theme presets |
| GET/POST/PUT/DELETE | `/api/v1/tasks` | Task management |

---

## Progress Tracker

Run the built-in script to check project status:

```bash
bash scripts/continue.sh
```

Output:
```
━━━ Git Status ━━━
✓ Branch: master
✓ Total commits: 8
✓ Working tree clean

━━━ Frontend Status ━━━
✓ Frontend project exists
✓ Dependencies installed
✓ Build exists
Components: 27 | Pages: 11

━━━ Backend Status ━━━
✓ Backend project exists
Go files: 20 | Handlers: 10 | Models: 4

━━━ Implementation Progress ━━━
✓ Phase 1: SDLC Documentation
✓ Phase 2: Project Scaffolding
✓ Phase 3: Theming Engine
✓ Phase 4: Backend API + DB
✓ Phase 5: Frontend Core
✓ Phase 6: Feature Pages
✓ Phase 7: Continuation Script

Overall Progress: 100% (7/7 phases)
```

---

## SDLC Documentation

The project was built following a structured SDLC process. All planning documents are in `docs/`:

| Document | Contents |
|----------|----------|
| `01-REQUIREMENTS.md` | 10 functional requirements, 4 non-functional requirements, 20+ routes |
| `02-ARCHITECTURE.md` | System architecture, frontend/backend structure, 36 API endpoint designs |
| `03-DATABASE.md` | 15 PostgreSQL tables with full schema, indexes, and migration strategy |
| `04-THEMING.md` | 200 color definitions, 80 shade tokens, 6 sidebar variant specs |
| `05-IMPLEMENTATION-PLAN.md` | 7-phase plan with 34 agent distribution and quality gates |

---

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8080` | Backend server port |
| `DATABASE_URL` | `postgres://postgres:postgres@localhost:5432/claude_dashboard?sslmode=disable` | PostgreSQL connection |
| `CORS_ORIGINS` | `http://localhost:3000` | Allowed CORS origins |
| `CLAUDE_HOME` | `~/.claude` | Path to Claude Code config directory |
| `JWT_SECRET` | `change-me-in-production` | JWT signing secret |

---

## License

MIT

---

Built with Claude Code.
