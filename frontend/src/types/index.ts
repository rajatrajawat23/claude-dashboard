// Settings types
export interface ClaudeSettings {
  permissions: Permission[];
  mcpServers: Record<string, MCPServer>;
  enabledPlugins: string[];
  effort: string;
}

export interface Permission {
  type: 'bash' | 'tool' | 'directory';
  value: string;
}

export interface MCPServer {
  command: string;
  args: string[];
  env?: Record<string, string>;
}

// Session types
export interface Session {
  id: string;
  claudeSessionId?: string;
  parentId?: string;
  projectPath?: string;
  status: 'active' | 'paused' | 'completed' | 'archived';
  startedAt: string;
  endedAt?: string;
  tokenCount: number;
  messageCount: number;
  children?: Session[];
}

export interface SessionMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  toolUse?: Record<string, unknown>;
  tokens: number;
  createdAt: string;
}

// Terminal types
export interface Terminal {
  id: string;
  name: string;
  shell: string;
  cwd: string;
  pid?: number;
  cols: number;
  rows: number;
  status: 'running' | 'stopped' | 'error';
}

// Theme types
export interface ThemeConfig {
  mode: 'light' | 'dark' | 'system';
  sidebarVariant: SidebarVariant;
  radiusMultiplier: number;
  colors: Record<string, string>;
}

export type SidebarVariant = 'minimal' | 'compact' | 'standard' | 'floating' | 'docked' | 'rail';

// Plugin types
export interface Plugin {
  id: string;
  name: string;
  version: string;
  enabled: boolean;
  blocked: boolean;
  marketplace: string;
}

// Memory types
export interface Memory {
  id: string;
  name: string;
  description: string;
  memoryType: 'user' | 'feedback' | 'project' | 'reference';
  content: string;
  filePath?: string;
}

// Git types
export interface GitBranch {
  name: string;
  current: boolean;
  remote?: string;
  lastCommit: string;
}

export interface GitCommit {
  hash: string;
  shortHash: string;
  message: string;
  author: string;
  date: string;
}

export interface Worktree {
  id: string;
  path: string;
  branch: string;
  headCommit?: string;
  isMain: boolean;
  status: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
