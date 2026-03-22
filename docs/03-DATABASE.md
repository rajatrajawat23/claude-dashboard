# Claude Dashboard - Database Schema

## PostgreSQL 16

### ERD Overview

```
settings ──┐
            ├── settings_history
mcp_servers ┘

sessions ──── session_messages
  │
  └── session_hierarchy

terminals ──── terminal_logs

worktrees

plugins ──── plugin_configs

memories

themes ──── theme_presets

tasks ──── task_dependencies

file_snapshots

system_events
```

---

## Tables

### settings
```sql
CREATE TABLE settings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scope           VARCHAR(20) NOT NULL CHECK (scope IN ('global', 'local', 'project')),
    key             VARCHAR(255) NOT NULL,
    value           JSONB NOT NULL,
    file_path       TEXT NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(scope, key)
);
```

### settings_history
```sql
CREATE TABLE settings_history (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_id      UUID REFERENCES settings(id) ON DELETE CASCADE,
    old_value       JSONB,
    new_value       JSONB NOT NULL,
    changed_by      VARCHAR(100) DEFAULT 'dashboard',
    changed_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### mcp_servers
```sql
CREATE TABLE mcp_servers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL UNIQUE,
    command         VARCHAR(50) NOT NULL,
    args            JSONB DEFAULT '[]',
    env             JSONB DEFAULT '{}',
    status          VARCHAR(20) DEFAULT 'active',
    needs_auth      BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### sessions
```sql
CREATE TABLE sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claude_session_id VARCHAR(255) UNIQUE,
    parent_id       UUID REFERENCES sessions(id),
    project_path    TEXT,
    status          VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
    started_at      TIMESTAMPTZ DEFAULT NOW(),
    ended_at        TIMESTAMPTZ,
    token_count     INTEGER DEFAULT 0,
    message_count   INTEGER DEFAULT 0,
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sessions_parent ON sessions(parent_id);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_project ON sessions(project_path);
```

### session_messages
```sql
CREATE TABLE session_messages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      UUID REFERENCES sessions(id) ON DELETE CASCADE,
    role            VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
    content         TEXT NOT NULL,
    tool_use        JSONB,
    tokens          INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_session ON session_messages(session_id);
```

### terminals
```sql
CREATE TABLE terminals (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) DEFAULT 'Terminal',
    shell           VARCHAR(50) DEFAULT '/bin/zsh',
    cwd             TEXT DEFAULT '~',
    pid             INTEGER,
    cols            INTEGER DEFAULT 80,
    rows            INTEGER DEFAULT 24,
    status          VARCHAR(20) DEFAULT 'running' CHECK (status IN ('running', 'stopped', 'error')),
    session_id      UUID REFERENCES sessions(id),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    last_active_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### terminal_logs
```sql
CREATE TABLE terminal_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    terminal_id     UUID REFERENCES terminals(id) ON DELETE CASCADE,
    content         TEXT NOT NULL,
    log_type        VARCHAR(10) DEFAULT 'output' CHECK (log_type IN ('input', 'output', 'error')),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_terminal_logs_terminal ON terminal_logs(terminal_id);
```

### worktrees
```sql
CREATE TABLE worktrees (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    path            TEXT NOT NULL UNIQUE,
    branch          VARCHAR(255) NOT NULL,
    head_commit     VARCHAR(40),
    is_main         BOOLEAN DEFAULT FALSE,
    status          VARCHAR(20) DEFAULT 'active',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    last_synced_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### plugins
```sql
CREATE TABLE plugins (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL UNIQUE,
    version         VARCHAR(50),
    marketplace     VARCHAR(100) DEFAULT 'claude-plugins-official',
    enabled         BOOLEAN DEFAULT TRUE,
    blocked         BOOLEAN DEFAULT FALSE,
    installed_at    TIMESTAMPTZ DEFAULT NOW(),
    config          JSONB DEFAULT '{}',
    metadata        JSONB DEFAULT '{}'
);
```

### memories
```sql
CREATE TABLE memories (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL UNIQUE,
    description     TEXT,
    memory_type     VARCHAR(20) NOT NULL CHECK (memory_type IN ('user', 'feedback', 'project', 'reference')),
    content         TEXT NOT NULL,
    file_path       TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### themes
```sql
CREATE TABLE themes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL UNIQUE,
    mode            VARCHAR(10) NOT NULL CHECK (mode IN ('light', 'dark', 'system')),
    colors          JSONB NOT NULL,          -- 200 color definitions
    dark_shades     JSONB NOT NULL,          -- 40 dark shades
    light_shades    JSONB NOT NULL,          -- 40 light shades
    border_radius   JSONB NOT NULL,          -- radius scale
    sidebar_variant VARCHAR(20) DEFAULT 'standard',
    typography      JSONB DEFAULT '{}',
    is_active       BOOLEAN DEFAULT FALSE,
    is_preset       BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### tasks
```sql
CREATE TABLE tasks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject         VARCHAR(500) NOT NULL,
    description     TEXT,
    status          VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'deleted')),
    owner           VARCHAR(100),
    priority        INTEGER DEFAULT 0,
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE task_dependencies (
    task_id         UUID REFERENCES tasks(id) ON DELETE CASCADE,
    depends_on      UUID REFERENCES tasks(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, depends_on)
);
```

### file_snapshots
```sql
CREATE TABLE file_snapshots (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_path       TEXT NOT NULL,
    content_hash    VARCHAR(64) NOT NULL,
    size_bytes      BIGINT,
    snapshot_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_snapshots_path ON file_snapshots(file_path);
```

### system_events
```sql
CREATE TABLE system_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type      VARCHAR(50) NOT NULL,
    source          VARCHAR(100),
    payload         JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_type ON system_events(event_type);
CREATE INDEX idx_events_created ON system_events(created_at);
```

---

## Migrations Strategy

Using GORM AutoMigrate for development, versioned SQL migrations for production.

Migration files follow pattern: `YYYYMMDD_HHMMSS_description.sql`
