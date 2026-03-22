# Claude Dashboard - Implementation Plan (SDLC)

## Methodology: Agile-Waterfall Hybrid (AgiWater)
Best of both: upfront design + iterative sprints + parallel worktree execution.

---

## Phase Breakdown

### Phase 1: Foundation (Sprint 0)
**Duration**: Setup
**Deliverables**:
- [x] Requirements document (01-REQUIREMENTS.md)
- [x] Architecture document (02-ARCHITECTURE.md)
- [x] Database schema (03-DATABASE.md)
- [x] Theming specification (04-THEMING.md)
- [x] Implementation plan (this document)
- [ ] Project scaffolding

### Phase 2: Project Scaffolding
**Worktree**: `scaffold`
**Parallel Agents**: 3

**Agent 2A - Frontend Init**:
- Vite + React + TypeScript project
- Tailwind CSS 4 + shadcn/ui setup
- Directory structure creation
- Base shadcn components install
- ESLint + Prettier config

**Agent 2B - Backend Init**:
- Go module init
- Fiber framework setup
- GORM + PostgreSQL driver
- Directory structure
- Basic health endpoint
- Makefile

**Agent 2C - Infrastructure**:
- Docker Compose (frontend + backend + postgres)
- Database init script
- Environment configs (.env.example)
- Git init + .gitignore
- CLAUDE.md for the project

### Phase 3: Theming Engine
**Worktree**: `theming`
**Parallel Agents**: 2

**Agent 3A - CSS + Token System**:
- CSS custom properties (all 200 colors + 80 shades)
- Tailwind theme extension
- Dark/light mode toggle
- Dynamic radius system
- Animation tokens
- Typography scale

**Agent 3B - Theme Components**:
- ThemeProvider context
- useTheme hook
- Theme store (Zustand)
- ThemeStudio page (live customizer)
- Sidebar variant system (6 variants)
- Theme persistence (localStorage + API)

### Phase 4: Backend Core
**Worktree**: `backend-core`
**Parallel Agents**: 4

**Agent 4A - Database Layer**:
- All GORM models
- PostgreSQL connection pool
- Auto-migration
- Seed data

**Agent 4B - Claude Bridge Service**:
- Read ~/.claude/settings.json
- Read ~/.claude/settings.local.json
- Read sessions, memory, plugins
- File watcher (fsnotify) for live updates
- Write-back capabilities

**Agent 4C - REST API Handlers**:
- Settings CRUD handlers
- Sessions/messages handlers
- Memory CRUD handlers
- Plugin handlers
- Theme handlers
- System info handlers

**Agent 4D - Real-time Layer**:
- WebSocket hub
- Terminal PTY manager
- Event broadcasting
- Connection management

### Phase 5: Frontend Core
**Worktree**: `frontend-core`
**Parallel Agents**: 4

**Agent 5A - Layout System**:
- AppShell component
- 6 Sidebar variant components
- Header with breadcrumbs
- Command palette (Cmd+K)
- Responsive breakpoints

**Agent 5B - Routing + State**:
- React Router setup (all 20+ routes)
- Zustand stores (theme, sidebar, terminal, session)
- TanStack Query setup + API hooks
- WebSocket client hook

**Agent 5C - Base UI Components**:
- Install all needed shadcn components
- Custom DataTable component
- DiffViewer component
- CodeEditor component
- TreeView component
- StatusBadge component

**Agent 5D - Dashboard Page**:
- Stats cards (sessions, terminals, worktrees, plugins)
- Recent activity feed
- Quick actions grid
- System health indicator
- Active sessions widget

### Phase 6: Feature Pages
**Worktree**: `features`
**Parallel Agents**: 6

**Agent 6A - Settings Pages**:
- Settings overview with tabs
- Global vs Local settings diff
- Permission grid (checkboxes)
- MCP server cards
- Import/Export buttons
- Settings history timeline

**Agent 6B - Terminal Manager**:
- xterm.js integration
- Terminal tabs bar
- Split views
- Terminal settings
- WebSocket terminal I/O
- Terminal themes

**Agent 6C - Session & Chat Pages**:
- Session list with filters
- Session hierarchy tree
- Chat message viewer (markdown render)
- Session metadata panel
- Session search
- Export functionality

**Agent 6D - Git & GitHub Pages**:
- Branch tree visualization
- Commit graph
- Diff viewer (side-by-side)
- PR list and detail
- Issue browser
- Actions status

**Agent 6E - Plugin & Memory Pages**:
- Installed plugin grid
- Marketplace browser
- Plugin config editor
- Memory list with type badges
- Memory editor (markdown)
- MEMORY.md index view

**Agent 6F - Remaining Pages**:
- Worktree manager
- Database browser
- File history viewer
- Task tracker
- About/System info page
- Theme studio (if not done in Phase 3)

### Phase 7: Integration & Polish
**Worktree**: `integration`
**Parallel Agents**: 3

**Agent 7A - API Integration**:
- Connect all frontend pages to backend
- Error handling and loading states
- Optimistic updates
- Cache invalidation

**Agent 7B - Real-time Features**:
- Terminal WebSocket connection
- Live settings file watching
- Session status updates
- System event notifications

**Agent 7C - Polish & UX**:
- Loading skeletons
- Empty states
- Error boundaries
- Toast notifications
- Keyboard shortcuts
- Responsive design fixes

### Phase 8: Continuation System
**Worktree**: `main`

- Progress tracker script
- Memory integration
- GitHub sync
- Auto-continue logic
- Documentation updates

---

## Merge Strategy

```
main
  ├── scaffold    → merge → main
  ├── theming     → merge → main
  ├── backend-core → merge → main
  ├── frontend-core → merge → main
  ├── features    → merge → main
  └── integration → merge → main
```

Each phase: create worktree → implement → test → merge → cleanup.

---

## Agent Distribution (34 total)

| Phase | Agents | Names |
|-------|--------|-------|
| Phase 1 | 1 | Documentation (done) |
| Phase 2 | 3 | 2A, 2B, 2C |
| Phase 3 | 2 | 3A, 3B |
| Phase 4 | 4 | 4A, 4B, 4C, 4D |
| Phase 5 | 4 | 5A, 5B, 5C, 5D |
| Phase 6 | 6 | 6A, 6B, 6C, 6D, 6E, 6F |
| Phase 7 | 3 | 7A, 7B, 7C |
| Phase 8 | 1 | Continuation |
| **Explore** | 1 | Initial analysis |
| **Review** | 6 | Code review per phase |
| **Test** | 3 | Testing agents |
| **Total** | **34** | |

---

## Quality Gates

Each phase must pass before merge:
1. All code compiles/builds without errors
2. No TypeScript errors
3. No Go vet/lint errors
4. API endpoints return correct status codes
5. Theme renders correctly in both modes
6. All routes are accessible
7. WebSocket connections are stable

---

## File Structure Summary

```
claude-dashboard/
├── docs/                          # SDLC documentation
│   ├── 01-REQUIREMENTS.md
│   ├── 02-ARCHITECTURE.md
│   ├── 03-DATABASE.md
│   ├── 04-THEMING.md
│   └── 05-IMPLEMENTATION-PLAN.md
├── scripts/
│   └── continue.sh                # Continuation script
├── frontend/                      # React + Vite + shadcn
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── backend/                       # Go + Fiber
│   ├── cmd/
│   ├── internal/
│   ├── go.mod
│   └── Makefile
├── database/
│   └── migrations/
├── docker-compose.yml
├── .env.example
├── .gitignore
├── CLAUDE.md
└── README.md
```
