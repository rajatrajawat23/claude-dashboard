# Claude Dashboard

## Project Overview
Full-stack Claude Code management dashboard.
- Frontend: React + Vite + TypeScript + shadcn/ui (port 3000)
- Backend: Go + Fiber v2 + GORM (port 8080)
- Database: PostgreSQL 16 (port 5432/5433)

## Commands

### Frontend
```bash
cd frontend && npm run dev     # Start dev server on :3000
cd frontend && npm run build   # Production build
cd frontend && npx tsc --noEmit  # Type check
```

### Backend
```bash
cd backend && make dev         # Start dev server on :8080
cd backend && make build       # Build binary
cd backend && make test        # Run tests
cd backend && make tidy        # Tidy go modules
```

### Docker
```bash
docker-compose up -d           # Start all services
docker-compose down            # Stop all services
docker-compose logs -f backend # Follow backend logs
```

### Database
```bash
psql postgres://postgres:postgres@localhost:5433/claude_dashboard  # Connect to DB
```

## Architecture
- Frontend proxies /api/* and /ws/* to backend via Vite dev server
- Backend reads Claude config from ~/.claude/ directory
- WebSocket used for terminal I/O and real-time updates
- All API endpoints under /api/v1/

## Key Directories
- `frontend/src/components/ui/` - shadcn/ui components
- `frontend/src/pages/` - Page components
- `frontend/src/stores/` - Zustand state stores
- `frontend/src/theme/` - Theming system (200 colors, 80 shades)
- `backend/internal/handlers/` - API route handlers
- `backend/internal/models/` - GORM database models
- `backend/internal/services/` - Business logic
- `docs/` - SDLC documentation

## Conventions
- Use TypeScript strict mode
- Use shadcn/ui components, don't create custom UI primitives
- API responses follow: { data: T, message?: string, error?: string }
- Go handlers return fiber.Ctx JSON responses
- Use UUID for all primary keys
- Theme colors use CSS custom properties (--shade-1 through --shade-40)
