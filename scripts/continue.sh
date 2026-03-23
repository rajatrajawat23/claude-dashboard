#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# Claude Dashboard - Continuation & Progress Script
# Run this to check progress, update tracker, and continue work
# ============================================================

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MEMORY_DIR="$HOME/.claude/projects/-Users-$(whoami)/memory"
TRACKER_FILE="$PROJECT_DIR/.claude/progress.json"
LOG_FILE="$PROJECT_DIR/.claude/progress.log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

log() { echo -e "${CYAN}[$(date '+%H:%M:%S')]${NC} $1"; }
success() { echo -e "${GREEN}✓${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC} $1"; }
error() { echo -e "${RED}✗${NC} $1"; }
header() { echo -e "\n${BLUE}━━━ $1 ━━━${NC}"; }

# Ensure .claude directory exists
mkdir -p "$PROJECT_DIR/.claude"

# ─── 1. Check Git Status ───
header "Git Status"
cd "$PROJECT_DIR"

if [ -d ".git" ]; then
    BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
    COMMITS=$(git rev-list --count HEAD 2>/dev/null || echo "0")
    LAST_COMMIT=$(git log -1 --format="%h - %s (%cr)" 2>/dev/null || echo "No commits")
    UNCOMMITTED=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')

    success "Branch: $BRANCH"
    success "Total commits: $COMMITS"
    success "Last commit: $LAST_COMMIT"
    [ "$UNCOMMITTED" -gt 0 ] && warn "Uncommitted changes: $UNCOMMITTED files" || success "Working tree clean"

    # Check worktrees
    WORKTREES=$(git worktree list 2>/dev/null | wc -l | tr -d ' ')
    [ "$WORKTREES" -gt 1 ] && log "Active worktrees: $WORKTREES"
else
    error "Not a git repository"
fi

# ─── 2. Check Frontend Status ───
header "Frontend Status"
if [ -f "$PROJECT_DIR/frontend/package.json" ]; then
    success "Frontend project exists"

    if [ -d "$PROJECT_DIR/frontend/node_modules" ]; then
        success "Dependencies installed"
    else
        warn "Dependencies not installed (run: cd frontend && npm install)"
    fi

    if [ -d "$PROJECT_DIR/frontend/dist" ]; then
        success "Build exists"
    else
        warn "No build found"
    fi

    # Count components
    COMPONENTS=$(find "$PROJECT_DIR/frontend/src/components" -name "*.tsx" 2>/dev/null | wc -l | tr -d ' ')
    PAGES=$(find "$PROJECT_DIR/frontend/src/pages" -name "*.tsx" 2>/dev/null | wc -l | tr -d ' ')
    log "Components: $COMPONENTS | Pages: $PAGES"
else
    error "Frontend not initialized"
fi

# ─── 3. Check Backend Status ───
header "Backend Status"
if [ -f "$PROJECT_DIR/backend/go.mod" ]; then
    success "Backend project exists"

    # Check if binary exists
    if [ -f "$PROJECT_DIR/backend/build/claude-dashboard-api" ]; then
        success "Binary built"
    else
        warn "Binary not built (run: cd backend && make build)"
    fi

    # Count source files
    GO_FILES=$(find "$PROJECT_DIR/backend" -name "*.go" 2>/dev/null | wc -l | tr -d ' ')
    HANDLERS=$(find "$PROJECT_DIR/backend/internal/handlers" -name "*.go" 2>/dev/null | wc -l | tr -d ' ')
    MODELS=$(find "$PROJECT_DIR/backend/internal/models" -name "*.go" 2>/dev/null | wc -l | tr -d ' ')
    log "Go files: $GO_FILES | Handlers: $HANDLERS | Models: $MODELS"
else
    error "Backend not initialized"
fi

# ─── 4. Check Database Status ───
header "Database Status"
if command -v psql &>/dev/null; then
    if psql "postgres://postgres:postgres@localhost:5432/claude_dashboard" -c "SELECT 1" &>/dev/null 2>&1; then
        success "PostgreSQL connected (port 5432)"
    elif psql "postgres://postgres:postgres@localhost:5433/claude_dashboard" -c "SELECT 1" &>/dev/null 2>&1; then
        success "PostgreSQL connected (port 5433 - Docker)"
    else
        warn "PostgreSQL not reachable"
    fi
else
    warn "psql not found"
fi

# ─── 5. Check Docker Status ───
header "Docker Status"
if command -v docker &>/dev/null; then
    if docker compose ps --format "table {{.Name}}\t{{.Status}}" 2>/dev/null | grep -q "claude"; then
        docker compose ps --format "table {{.Name}}\t{{.Status}}" 2>/dev/null
    else
        warn "Docker containers not running"
    fi
else
    warn "Docker not found"
fi

# ─── 6. Check Memory & Claude Config ───
header "Memory & Tracker"
if [ -f "$MEMORY_DIR/MEMORY.md" ]; then
    success "MEMORY.md found"
    MEMORY_COUNT=$(find "$MEMORY_DIR" -name "*.md" ! -name "MEMORY.md" 2>/dev/null | wc -l | tr -d ' ')
    log "Memory files: $MEMORY_COUNT"
else
    warn "No MEMORY.md found"
fi

# ─── 7. Check Implementation Progress ───
header "Implementation Progress"

# Phase tracking
declare -A PHASES
PHASES[1]="SDLC Documentation"
PHASES[2]="Project Scaffolding"
PHASES[3]="Theming Engine"
PHASES[4]="Backend API + DB"
PHASES[5]="Frontend Core"
PHASES[6]="Feature Pages"
PHASES[7]="Continuation Script"

check_phase() {
    local phase=$1
    case $phase in
        1) [ -f "$PROJECT_DIR/docs/05-IMPLEMENTATION-PLAN.md" ] && echo "done" || echo "pending" ;;
        2) [ -f "$PROJECT_DIR/frontend/package.json" ] && [ -f "$PROJECT_DIR/backend/go.mod" ] && echo "done" || echo "pending" ;;
        3) [ -f "$PROJECT_DIR/frontend/src/theme/colors.ts" ] && echo "done" || echo "pending" ;;
        4) [ $(find "$PROJECT_DIR/backend/internal/handlers" -name "*.go" 2>/dev/null | wc -l) -gt 2 ] && echo "done" || echo "pending" ;;
        5) [ $(find "$PROJECT_DIR/frontend/src/pages" -name "*.tsx" 2>/dev/null | wc -l) -gt 2 ] && echo "done" || echo "pending" ;;
        6) [ $(find "$PROJECT_DIR/frontend/src/pages" -name "*.tsx" 2>/dev/null | wc -l) -gt 10 ] && echo "done" || echo "pending" ;;
        7) [ -f "$PROJECT_DIR/scripts/continue.sh" ] && echo "done" || echo "pending" ;;
    esac
}

TOTAL=7
COMPLETED=0
for i in $(seq 1 7); do
    STATUS=$(check_phase $i)
    if [ "$STATUS" = "done" ]; then
        success "Phase $i: ${PHASES[$i]} ✓"
        ((COMPLETED++))
    else
        warn "Phase $i: ${PHASES[$i]} ○"
    fi
done

PROGRESS=$((COMPLETED * 100 / TOTAL))
echo ""
log "Overall Progress: ${PROGRESS}% ($COMPLETED/$TOTAL phases)"

# ─── 8. Generate Progress JSON ───
cat > "$TRACKER_FILE" << TRACKER_EOF
{
  "project": "claude-dashboard",
  "lastChecked": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "branch": "${BRANCH:-master}",
  "totalCommits": ${COMMITS:-0},
  "uncommittedFiles": ${UNCOMMITTED:-0},
  "progress": {
    "total": $TOTAL,
    "completed": $COMPLETED,
    "percentage": $PROGRESS
  },
  "phases": {
    "1_documentation": "$(check_phase 1)",
    "2_scaffolding": "$(check_phase 2)",
    "3_theming": "$(check_phase 3)",
    "4_backend": "$(check_phase 4)",
    "5_frontend_core": "$(check_phase 5)",
    "6_features": "$(check_phase 6)",
    "7_continuation": "$(check_phase 7)"
  },
  "stats": {
    "frontendComponents": ${COMPONENTS:-0},
    "frontendPages": ${PAGES:-0},
    "goFiles": ${GO_FILES:-0},
    "handlers": ${HANDLERS:-0},
    "models": ${MODELS:-0}
  }
}
TRACKER_EOF

success "Progress saved to .claude/progress.json"

# ─── 9. Append to log ───
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Progress: ${PROGRESS}% | Commits: ${COMMITS:-0} | Branch: ${BRANCH:-master}" >> "$LOG_FILE"

# ─── 10. Context for next session ───
header "Context for Next Session"
echo ""

if [ "$PROGRESS" -lt 100 ]; then
    NEXT_PHASE=""
    for i in $(seq 1 7); do
        if [ "$(check_phase $i)" = "pending" ]; then
            NEXT_PHASE=$i
            break
        fi
    done

    if [ -n "$NEXT_PHASE" ]; then
        echo -e "Next: ${YELLOW}Phase $NEXT_PHASE - ${PHASES[$NEXT_PHASE]}${NC}"
        echo ""
        echo "To continue, run Claude Code in the project directory:"
        echo -e "  ${CYAN}cd $PROJECT_DIR && claude${NC}"
        echo ""
        echo "Then tell Claude:"
        echo -e "  ${CYAN}\"Continue from Phase $NEXT_PHASE - ${PHASES[$NEXT_PHASE]}. Check docs/05-IMPLEMENTATION-PLAN.md and .claude/progress.json for context.\"${NC}"
    fi
else
    success "All phases complete! 🎉"
fi

echo ""
