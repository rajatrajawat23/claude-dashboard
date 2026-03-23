import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Terminal as TerminalIcon, Plus, X, Maximize2, Loader2 } from 'lucide-react';
import { useThemeStore } from '@/stores/themeStore';
import api from '@/lib/api';
import { colors } from '@/theme';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OutputLine {
  id: number;
  type: 'prompt' | 'output' | 'error' | 'info' | 'system';
  text: string;
}

interface TabState {
  id: string;
  name: string;
  status: 'running' | 'stopped';
  lines: OutputLine[];
  history: string[];
  historyIndex: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const USERNAME = 'claude-dashboard-user';
const CWD = '/Users/rajatrajawatpmac/claude-dashboard';

const LS_OUTPUT = [
  'drwxr-xr-x  frontend/',
  'drwxr-xr-x  backend/',
  'drwxr-xr-x  docs/',
  'drwxr-xr-x  scripts/',
  'drwxr-xr-x  .claude/',
  '-rw-r--r--  docker-compose.yml',
  '-rw-r--r--  CLAUDE.md',
  '-rw-r--r--  README.md',
  '-rw-r--r--  .gitignore',
  '-rw-r--r--  package.json',
];

const HELP_OUTPUT = [
  'Available commands:',
  '',
  '  help          Show this help message',
  '  clear         Clear terminal output',
  '  date          Show current date/time',
  '  whoami        Show current user',
  '  pwd           Print working directory',
  '  ls            List project files',
  '  echo <text>   Echo text back',
  '  theme         Show current theme mode',
  '  status        Fetch API health status',
  '  memory        Fetch memory file list',
  '  git log       Show recent commits',
  '  git status    Show git working tree status',
  '  git branch    Show branches',
  '',
  'Press Up/Down arrow to navigate command history.',
];

// Counter for unique line IDs
let lineIdCounter = 0;
function nextLineId(): number {
  lineIdCounter += 1;
  return lineIdCounter;
}

// ---------------------------------------------------------------------------
// Helper: create initial tab
// ---------------------------------------------------------------------------

let tabIdCounter = 0;
function nextTabId(): string {
  tabIdCounter += 1;
  return String(tabIdCounter);
}

function createTab(name?: string): TabState {
  const id = nextTabId();
  return {
    id,
    name: name ?? `Terminal ${id}`,
    status: 'running',
    lines: [
      { id: nextLineId(), type: 'system', text: 'Welcome to Claude Dashboard Terminal' },
      { id: nextLineId(), type: 'system', text: 'Type "help" for available commands.' },
      { id: nextLineId(), type: 'system', text: '' },
    ],
    history: [],
    historyIndex: -1,
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Terminals() {
  const themeMode = useThemeStore((s) => s.mode);

  // Resolve "system" to actual light/dark
  const resolvedMode =
    themeMode === 'system'
      ? (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light')
      : themeMode;

  const [tabs, setTabs] = useState<TabState[]>(() => {
    const first = createTab();
    return [first];
  });
  const [activeTabId, setActiveTabId] = useState<string>(() => tabs[0].id);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Refs
  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Active tab helpers
  const activeTab = tabs.find((t) => t.id === activeTabId);

  const updateTab = useCallback((id: string, updater: (tab: TabState) => TabState) => {
    setTabs((prev) => prev.map((t) => (t.id === id ? updater(t) : t)));
  }, []);

  // Auto-scroll when lines change
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [activeTab?.lines]);

  // Focus input when switching tabs
  useEffect(() => {
    inputRef.current?.focus();
  }, [activeTabId]);

  // -------------------------------------------------------------------
  // Command execution
  // -------------------------------------------------------------------

  const addLines = useCallback(
    (tabId: string, newLines: Omit<OutputLine, 'id'>[]) => {
      updateTab(tabId, (tab) => ({
        ...tab,
        lines: [...tab.lines, ...newLines.map((l) => ({ ...l, id: nextLineId() }))],
      }));
    },
    [updateTab],
  );

  const executeCommand = useCallback(
    async (raw: string) => {
      const tabId = activeTabId;
      const trimmed = raw.trim();

      // Add prompt line
      addLines(tabId, [{ type: 'prompt', text: trimmed }]);

      if (trimmed === '') return;

      // Update history
      updateTab(tabId, (tab) => ({
        ...tab,
        history: [...tab.history, trimmed],
        historyIndex: -1,
      }));

      // ------- built-in commands -------
      if (trimmed === 'help') {
        addLines(tabId, HELP_OUTPUT.map((t) => ({ type: 'info' as const, text: t })));
        return;
      }

      if (trimmed === 'clear') {
        updateTab(tabId, (tab) => ({ ...tab, lines: [] }));
        return;
      }

      if (trimmed === 'date') {
        addLines(tabId, [{ type: 'output', text: new Date().toString() }]);
        return;
      }

      if (trimmed === 'whoami') {
        addLines(tabId, [{ type: 'output', text: USERNAME }]);
        return;
      }

      if (trimmed === 'pwd') {
        addLines(tabId, [{ type: 'output', text: CWD }]);
        return;
      }

      if (trimmed === 'ls' || trimmed === 'ls -la' || trimmed === 'ls -l') {
        addLines(tabId, LS_OUTPUT.map((t) => ({ type: 'output' as const, text: t })));
        return;
      }

      if (trimmed.startsWith('echo ')) {
        const rest = trimmed.slice(5);
        addLines(tabId, [{ type: 'output', text: rest }]);
        return;
      }

      if (trimmed === 'echo') {
        addLines(tabId, [{ type: 'output', text: '' }]);
        return;
      }

      if (trimmed === 'theme') {
        addLines(tabId, [{ type: 'output', text: `Current theme mode: ${resolvedMode}` }]);
        return;
      }

      // ------- API commands -------
      if (trimmed === 'status') {
        setLoading(true);
        try {
          const res = await api.get('/health');
          const data = res.data;
          addLines(tabId, [
            { type: 'info', text: `Status : ${data.status ?? data.data?.status ?? 'ok'}` },
            { type: 'info', text: `Message: ${data.message ?? data.data?.message ?? 'API is healthy'}` },
          ]);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Unknown error';
          addLines(tabId, [{ type: 'error', text: `Error fetching health: ${msg}` }]);
        } finally {
          setLoading(false);
        }
        return;
      }

      if (trimmed === 'memory') {
        setLoading(true);
        try {
          const res = await api.get('/memory');
          const data = res.data;
          const files: string[] = data.data?.files ?? data.files ?? [];
          if (files.length === 0) {
            addLines(tabId, [{ type: 'info', text: 'No memory files found.' }]);
          } else {
            addLines(tabId, [
              { type: 'info', text: `Memory files (${files.length}):` },
              ...files.map((f: string) => ({ type: 'output' as const, text: `  ${f}` })),
            ]);
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Unknown error';
          addLines(tabId, [{ type: 'error', text: `Error fetching memory: ${msg}` }]);
        } finally {
          setLoading(false);
        }
        return;
      }

      if (trimmed === 'git log') {
        setLoading(true);
        try {
          const res = await api.get('/git/commits');
          const data = res.data;
          const commits: Array<{ hash?: string; sha?: string; message?: string; author?: string; date?: string }> =
            data.data?.commits ?? data.commits ?? data.data ?? [];
          const show = commits.slice(0, 5);
          if (show.length === 0) {
            addLines(tabId, [{ type: 'info', text: 'No commits found.' }]);
          } else {
            const out: Omit<OutputLine, 'id'>[] = [];
            for (const c of show) {
              const hash = (c.hash ?? c.sha ?? '').slice(0, 7);
              out.push({ type: 'output', text: `\u001b[33m${hash}\u001b[0m ${c.message ?? ''}` });
              out.push({ type: 'info', text: `  Author: ${c.author ?? 'unknown'}  Date: ${c.date ?? ''}` });
            }
            addLines(tabId, out);
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Unknown error';
          addLines(tabId, [{ type: 'error', text: `Error fetching git log: ${msg}` }]);
        } finally {
          setLoading(false);
        }
        return;
      }

      if (trimmed === 'git status') {
        setLoading(true);
        try {
          const res = await api.get('/git/status');
          const data = res.data;
          const files: Array<{ path?: string; file?: string; status?: string }> =
            data.data?.files ?? data.files ?? data.data ?? [];
          if (files.length === 0) {
            addLines(tabId, [{ type: 'info', text: 'Nothing to commit, working tree clean.' }]);
          } else {
            addLines(tabId, [
              { type: 'info', text: `Changes (${files.length}):` },
              ...files.map((f) => ({
                type: 'output' as const,
                text: `  ${f.status ?? 'modified'}:  ${f.path ?? f.file ?? ''}`,
              })),
            ]);
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Unknown error';
          addLines(tabId, [{ type: 'error', text: `Error fetching git status: ${msg}` }]);
        } finally {
          setLoading(false);
        }
        return;
      }

      if (trimmed === 'git branch') {
        setLoading(true);
        try {
          const res = await api.get('/git/branches');
          const data = res.data;
          const branches: Array<{ name?: string; current?: boolean }> =
            data.data?.branches ?? data.branches ?? data.data ?? [];
          if (branches.length === 0) {
            addLines(tabId, [{ type: 'info', text: 'No branches found.' }]);
          } else {
            addLines(
              tabId,
              branches.map((b) => ({
                type: 'output' as const,
                text: `${b.current ? '* ' : '  '}${b.name ?? ''}`,
              })),
            );
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Unknown error';
          addLines(tabId, [{ type: 'error', text: `Error fetching git branches: ${msg}` }]);
        } finally {
          setLoading(false);
        }
        return;
      }

      // ------- unknown command -------
      const cmd = trimmed.split(' ')[0];
      addLines(tabId, [{ type: 'error', text: `command not found: ${cmd}. Type 'help' for available commands.` }]);
    },
    [activeTabId, addLines, updateTab, resolvedMode],
  );

  // -------------------------------------------------------------------
  // Input handlers
  // -------------------------------------------------------------------

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    void executeCommand(input);
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!activeTab) return;

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const hist = activeTab.history;
      if (hist.length === 0) return;
      const newIdx =
        activeTab.historyIndex === -1
          ? hist.length - 1
          : Math.max(0, activeTab.historyIndex - 1);
      updateTab(activeTab.id, (t) => ({ ...t, historyIndex: newIdx }));
      setInput(hist[newIdx]);
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const hist = activeTab.history;
      if (activeTab.historyIndex === -1) return;
      const newIdx = activeTab.historyIndex + 1;
      if (newIdx >= hist.length) {
        updateTab(activeTab.id, (t) => ({ ...t, historyIndex: -1 }));
        setInput('');
      } else {
        updateTab(activeTab.id, (t) => ({ ...t, historyIndex: newIdx }));
        setInput(hist[newIdx]);
      }
    }
  };

  // -------------------------------------------------------------------
  // Tab management
  // -------------------------------------------------------------------

  const addTerminal = () => {
    const tab = createTab();
    setTabs((prev) => [...prev, tab]);
    setActiveTabId(tab.id);
    setInput('');
  };

  const closeTerminal = (id: string) => {
    setTabs((prev) => {
      const remaining = prev.filter((t) => t.id !== id);
      if (activeTabId === id && remaining.length > 0) {
        setActiveTabId(remaining[remaining.length - 1].id);
      }
      return remaining;
    });
    setInput('');
  };

  const renameTerminal = (id: string) => {
    const tab = tabs.find((t) => t.id === id);
    if (!tab) return;
    const newName = window.prompt('Rename terminal:', tab.name);
    if (newName && newName.trim()) {
      updateTab(id, (t) => ({ ...t, name: newName.trim() }));
    }
  };

  // -------------------------------------------------------------------
  // Rendering helpers
  // -------------------------------------------------------------------

  const tc = colors.terminal;

  function renderLine(line: OutputLine) {
    if (line.type === 'prompt') {
      return (
        <div key={line.id} className="flex flex-wrap gap-0 leading-6">
          <span style={{ color: tc.green, fontWeight: 600 }}>{USERNAME}</span>
          <span style={{ color: tc.white }}>:</span>
          <span style={{ color: tc.blue, fontWeight: 600 }}>~{CWD}</span>
          <span style={{ color: tc.white }}>$ </span>
          <span style={{ color: tc.white }}>{line.text}</span>
        </div>
      );
    }

    if (line.type === 'error') {
      return (
        <div key={line.id} className="leading-6" style={{ color: tc.red }}>
          {line.text}
        </div>
      );
    }

    if (line.type === 'system') {
      return (
        <div key={line.id} className="leading-6" style={{ color: tc.yellow, fontStyle: 'italic' }}>
          {line.text || '\u00A0'}
        </div>
      );
    }

    if (line.type === 'info') {
      return (
        <div key={line.id} className="leading-6" style={{ color: tc.cyan }}>
          {line.text || '\u00A0'}
        </div>
      );
    }

    // output
    return (
      <div key={line.id} className="leading-6" style={{ color: tc.white }}>
        {line.text || '\u00A0'}
      </div>
    );
  }

  // -------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Terminals
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Manage terminal sessions
          </p>
        </div>
        <Button
          onClick={addTerminal}
          size="sm"
          style={{ background: 'var(--brand-500)', borderRadius: 'var(--radius-md)' }}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Terminal
        </Button>
      </div>

      {/* Tab bar */}
      <div
        className="flex gap-1 overflow-x-auto"
        style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          padding: '4px',
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTabId(tab.id);
              setInput('');
            }}
            onDoubleClick={() => renameTerminal(tab.id)}
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-md whitespace-nowrap transition-colors"
            style={{
              background: activeTabId === tab.id ? 'var(--bg-elevated)' : 'transparent',
              color: activeTabId === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <TerminalIcon className="h-3 w-3" style={{ color: 'var(--icon-terminal)' }} />
            {tab.name}
            <Badge
              variant="outline"
              className="text-[10px] px-1 py-0"
              style={{
                borderColor:
                  tab.status === 'running' ? 'var(--success-500)' : 'var(--error-500)',
              }}
            >
              {tab.status}
            </Badge>
            {tabs.length > 1 && (
              <X
                className="h-3 w-3 cursor-pointer opacity-50 hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  closeTerminal(tab.id);
                }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Terminal area */}
      <div
        className="flex-1 flex flex-col min-h-[400px] overflow-hidden"
        style={{
          background: 'var(--shade-1)',
          borderColor: 'var(--border-subtle)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
        }}
      >
        {/* Title bar (macOS style) */}
        <div
          className="flex items-center justify-between px-4 py-2"
          style={{
            background: 'var(--bg-card)',
            borderBottom: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
          }}
        >
          <div className="flex items-center gap-2">
            {/* macOS traffic lights */}
            <div className="flex gap-1.5">
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: '#ff5f57' }}
                title="Close"
              />
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: '#febc2e' }}
                title="Minimize"
              />
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: '#28c840' }}
                title="Maximize"
              />
            </div>
            <span
              className="text-xs font-mono ml-2"
              style={{ color: 'var(--text-muted)' }}
            >
              /bin/zsh &mdash; {activeTab?.name ?? 'Terminal'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {loading && <Loader2 className="h-3 w-3 animate-spin" style={{ color: tc.cyan }} />}
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Maximize2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Output area */}
        <div
          ref={outputRef}
          className="flex-1 overflow-y-auto p-4 font-mono text-sm select-text"
          style={{
            background: tc.black,
            color: tc.white,
            fontFamily:
              '"SF Mono", "Fira Code", "JetBrains Mono", Menlo, Consolas, monospace',
            minHeight: 0,
          }}
          onClick={() => inputRef.current?.focus()}
        >
          {activeTab?.lines.map((line) => renderLine(line))}

          {/* Active prompt line with input */}
          {activeTab?.status === 'running' && (
            <div className="flex flex-wrap items-center gap-0 leading-6">
              <span style={{ color: tc.green, fontWeight: 600 }}>{USERNAME}</span>
              <span style={{ color: tc.white }}>:</span>
              <span style={{ color: tc.blue, fontWeight: 600 }}>~{CWD}</span>
              <span style={{ color: tc.white }}>$ </span>
              {loading ? (
                <span className="inline-flex items-center gap-1" style={{ color: tc.cyan }}>
                  <Loader2 className="h-3 w-3 animate-spin inline" />
                  <span>running...</span>
                </span>
              ) : (
                <form onSubmit={handleSubmit} className="inline flex-1 min-w-[200px]">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    spellCheck={false}
                    autoComplete="off"
                    className="bg-transparent border-none outline-none w-full caret-current"
                    style={{
                      color: tc.white,
                      fontFamily: 'inherit',
                      fontSize: 'inherit',
                      lineHeight: 'inherit',
                      caretColor: tc.green,
                    }}
                  />
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
