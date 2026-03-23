import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Terminal,
  Server,
  Database,
  Palette,
  Cpu,
  Activity,
  Brain,
  Puzzle,
  GitCommit,
  RefreshCw,
  Clock,
  Monitor,
  Sparkles,
  Heart,
  Layers,
  Gauge,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useCallback } from 'react';

const PROJECT_DIR = '/Users/rajatrajawatpmac/claude-dashboard';

// ---------------------------------------------------------------------------
// Gradient text style
// ---------------------------------------------------------------------------

const gradientTextStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, var(--brand-500), var(--accent-500))',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
};

// -- Types --

interface HealthData {
  status: string;
  database: string;
  service: string;
  version: string;
}

interface SystemInfo {
  service: string;
  version: string;
  go_version: string;
  framework: string;
  database: string;
}

interface MemoryEntry {
  [key: string]: unknown;
}

interface PluginEntry {
  [key: string]: unknown;
}

interface CommitEntry {
  hash: string;
  shortHash: string;
  message: string;
  author: string;
  date: string;
}

// -- Theme stats (frontend constants) --

const themeStats = [
  { label: 'Colors', value: '200', icon: Palette, color: 'var(--brand-500)' },
  { label: 'Dark Shades', value: '40', icon: Layers, color: 'var(--accent-500)' },
  { label: 'Light Shades', value: '40', icon: Sparkles, color: 'var(--warning-500)' },
  { label: 'Sidebar Variants', value: '6', icon: Monitor, color: 'var(--success-500)' },
];

// -- Helpers --

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 30) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// -- Skeleton components --

function SystemInfoSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-4 rounded animate-shimmer" />
            <Skeleton className="h-4 w-20 animate-shimmer" />
          </div>
          <Skeleton className="h-4 w-36 animate-shimmer" />
        </div>
      ))}
    </div>
  );
}

function StatusSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-3 w-3 rounded-full animate-shimmer" />
            <Skeleton className="h-4 w-20 animate-shimmer" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full animate-shimmer" />
        </div>
      ))}
    </div>
  );
}

function CommitsSkeleton() {
  return (
    <div className="space-y-1">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="h-5 w-14 animate-shimmer" />
            <Skeleton className="h-4 w-3/4 animate-shimmer" />
          </div>
          <Skeleton className="h-3 w-16 animate-shimmer" />
        </div>
      ))}
    </div>
  );
}

// -- Page component --

export default function About() {
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  // Fetch system info (once)
  const systemInfoQuery = useQuery<SystemInfo>({
    queryKey: ['system-info'],
    queryFn: async () => {
      const res = await api.get('/system/info');
      return res.data;
    },
  });

  // Fetch health (auto-refresh every 15 seconds)
  const healthQuery = useQuery<HealthData>({
    queryKey: ['health-about'],
    queryFn: async () => {
      const res = await api.get('/health');
      return res.data;
    },
    refetchInterval: 15000,
  });

  // Fetch memory count
  const memoryQuery = useQuery<MemoryEntry[]>({
    queryKey: ['memory-about'],
    queryFn: async () => {
      const res = await api.get('/memory');
      return res.data.data;
    },
  });

  // Fetch plugin count
  const pluginsQuery = useQuery<PluginEntry[]>({
    queryKey: ['plugins-about'],
    queryFn: async () => {
      const res = await api.get('/plugins');
      return res.data.data;
    },
  });

  // Fetch last 3 git commits
  const commitsQuery = useQuery<CommitEntry[]>({
    queryKey: ['about-commits'],
    queryFn: async () => {
      const res = await api.get('/git/commits', { params: { dir: PROJECT_DIR, limit: 3 } });
      return res.data.data;
    },
  });

  // Track last-checked timestamp whenever health data updates
  const updateTimestamp = useCallback(() => {
    setLastChecked(new Date());
  }, []);

  useEffect(() => {
    if (healthQuery.dataUpdatedAt) {
      updateTimestamp();
    }
  }, [healthQuery.dataUpdatedAt, updateTimestamp]);

  const isApiHealthy = healthQuery.data?.status === 'ok' || healthQuery.data?.status === 'healthy';
  const isDbConnected = healthQuery.data?.database === 'connected';

  // Build system stack rows from live data
  const systemRows = systemInfoQuery.data
    ? [
        { label: 'Service', value: systemInfoQuery.data.service, icon: Server },
        { label: 'Version', value: systemInfoQuery.data.version, icon: Terminal },
        { label: 'Go Version', value: systemInfoQuery.data.go_version, icon: Cpu },
        { label: 'Framework', value: systemInfoQuery.data.framework, icon: Server },
        { label: 'Database Engine', value: systemInfoQuery.data.database, icon: Database },
        { label: 'Frontend', value: 'React 18 + Vite + TypeScript', icon: Monitor },
        { label: 'UI Framework', value: 'shadcn/ui + Tailwind CSS 4', icon: Palette },
      ]
    : [];

  // Status indicators
  const statusItems = [
    {
      label: 'API',
      ok: isApiHealthy,
      loading: healthQuery.isLoading,
      detail: healthQuery.data?.status ?? 'checking',
    },
    {
      label: 'Database',
      ok: isDbConnected,
      loading: healthQuery.isLoading,
      detail: healthQuery.data?.database ?? 'checking',
    },
    {
      label: 'Frontend',
      ok: true,
      loading: false,
      detail: 'running',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 rounded-2xl"
        style={{
          background: 'color-mix(in srgb, var(--bg-card) 80%, transparent)',
          backdropFilter: 'blur(8px)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center animate-float"
            style={{
              background: 'color-mix(in srgb, var(--brand-500) 12%, transparent)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <Heart className="h-5 w-5" style={{ color: 'var(--brand-500)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={gradientTextStyle}>About</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>System information and live status</p>
          </div>
        </div>
      </div>

      {/* Hero card */}
      <Card className="card-premium overflow-hidden" style={{ borderRadius: 'var(--radius-xl)' }}>
        <div
          className="h-1 w-full"
          style={{ background: 'linear-gradient(90deg, var(--brand-500), var(--accent-500), var(--brand-500))', backgroundSize: '200% 100%' }}
        />
        <CardHeader>
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center animate-float"
              style={{
                background: 'linear-gradient(135deg, var(--brand-500), var(--accent-500))',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <Terminal className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle style={{ color: 'var(--text-primary)' }}>Claude Dashboard</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                {systemInfoQuery.isLoading ? (
                  <Skeleton className="h-4 w-16 inline-block animate-shimmer" />
                ) : (
                  <Badge
                    className="text-xs relative overflow-hidden"
                    style={{
                      background: 'color-mix(in srgb, var(--brand-500) 12%, transparent)',
                      color: 'var(--brand-600)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <Gauge className="h-2.5 w-2.5 mr-1" />
                    v{systemInfoQuery.data?.version ?? 'unknown'}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Comprehensive management dashboard for Claude Code CLI. Manage settings, terminals,
            sessions, worktrees, plugins, memory, and more from a single interface.
          </p>
        </CardContent>
      </Card>

      {/* Counts row */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: 'Memories', icon: Brain, loading: memoryQuery.isLoading, value: memoryQuery.data?.length ?? 0, color: 'var(--brand-500)', gradient: 'linear-gradient(135deg, var(--brand-500), var(--brand-600))' },
          { label: 'Plugins', icon: Puzzle, loading: pluginsQuery.isLoading, value: pluginsQuery.data?.length ?? 0, color: 'var(--accent-500)', gradient: 'linear-gradient(135deg, var(--accent-500), var(--accent-600))' },
          { label: 'API Status', icon: Activity, loading: healthQuery.isLoading, value: isApiHealthy ? 'OK' : 'Down', color: 'var(--success-500)', gradient: 'linear-gradient(135deg, var(--success-500), var(--success-600))' },
          { label: 'Database', icon: Database, loading: healthQuery.isLoading, value: isDbConnected ? 'Connected' : 'Down', color: 'var(--warning-500)', gradient: 'linear-gradient(135deg, var(--warning-500), var(--warning-600))' },
        ].map((stat) => (
          <Card
            key={stat.label}
            className="card-premium transition-all hover:scale-[1.03]"
            style={{ borderRadius: 'var(--radius-xl)', borderLeft: `3px solid ${stat.color}` }}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center"
                style={{
                  background: `color-mix(in srgb, ${stat.color} 12%, transparent)`,
                  borderRadius: 'var(--radius-lg)',
                }}
              >
                <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
                <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {stat.loading ? <Skeleton className="h-6 w-10 inline-block animate-shimmer" /> : stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* System Stack (live) */}
        <Card className="card-premium" style={{ borderRadius: 'var(--radius-xl)' }}>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <div
                className="flex h-7 w-7 items-center justify-center"
                style={{ background: 'color-mix(in srgb, var(--brand-500) 12%, transparent)', borderRadius: 'var(--radius-md)' }}
              >
                <Layers className="h-3.5 w-3.5" style={{ color: 'var(--brand-500)' }} />
              </div>
              System Stack
            </CardTitle>
          </CardHeader>
          <CardContent>
            {systemInfoQuery.isLoading ? (
              <SystemInfoSkeleton />
            ) : systemInfoQuery.isError ? (
              <div className="py-4 text-center">
                <p className="text-sm" style={{ color: 'var(--error-500, #ef4444)' }}>Failed to load system info</p>
                <Button size="sm" variant="ghost" onClick={() => void systemInfoQuery.refetch()} className="mt-2" style={{ borderRadius: 'var(--radius-md)' }}>
                  <RefreshCw className="h-3 w-3 mr-1" />Retry
                </Button>
              </div>
            ) : (
              <div className="space-y-1">
                {systemRows.map((info, i) => (
                  <div
                    key={info.label}
                    className="flex items-center justify-between py-2.5 transition-all hover:scale-[1.01]"
                    style={{ borderBottom: i < systemRows.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-7 w-7 items-center justify-center shrink-0"
                        style={{
                          background: 'color-mix(in srgb, var(--brand-500) 8%, transparent)',
                          borderRadius: 'var(--radius-md)',
                        }}
                      >
                        <info.icon className="h-3.5 w-3.5" style={{ color: 'var(--brand-500)' }} />
                      </div>
                      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{info.label}</span>
                    </div>
                    <span
                      className="text-sm font-medium font-mono px-2 py-0.5"
                      style={{
                        color: 'var(--text-primary)',
                        background: 'var(--bg-elevated)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      {info.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Status (live, 15s refresh) */}
        <Card className="card-premium" style={{ borderRadius: 'var(--radius-xl)' }}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <div
                className="flex h-7 w-7 items-center justify-center"
                style={{ background: 'color-mix(in srgb, var(--success-500) 12%, transparent)', borderRadius: 'var(--radius-md)' }}
              >
                <Activity className="h-3.5 w-3.5" style={{ color: 'var(--success-500)' }} />
              </div>
              System Status
            </CardTitle>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => void healthQuery.refetch()}
              className="text-xs transition-all hover:scale-[1.05]"
              style={{ color: 'var(--brand-500)', borderRadius: 'var(--radius-md)' }}
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${healthQuery.isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            {healthQuery.isLoading ? (
              <StatusSkeleton />
            ) : healthQuery.isError ? (
              <div className="py-4 text-center">
                <p className="text-sm" style={{ color: 'var(--error-500, #ef4444)' }}>Cannot reach API server</p>
                <Button size="sm" variant="ghost" onClick={() => void healthQuery.refetch()} className="mt-2" style={{ borderRadius: 'var(--radius-md)' }}>
                  <RefreshCw className="h-3 w-3 mr-1" />Retry
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {statusItems.map((item, i) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between py-2.5 transition-all hover:scale-[1.01]"
                    style={{ borderBottom: i < statusItems.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{
                            background: item.loading
                              ? 'var(--text-muted)'
                              : item.ok
                                ? 'var(--success-500, #22c55e)'
                                : 'var(--error-500, #ef4444)',
                          }}
                        />
                        {item.ok && !item.loading && (
                          <div
                            className="absolute inset-0 h-3 w-3 rounded-full animate-glow"
                            style={{
                              background: 'var(--success-500, #22c55e)',
                              opacity: 0.4,
                            }}
                          />
                        )}
                      </div>
                      <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                    </div>
                    <Badge
                      style={{
                        background: item.ok ? 'color-mix(in srgb, var(--success-500) 12%, transparent)' : 'color-mix(in srgb, var(--error-500) 12%, transparent)',
                        color: item.ok ? 'var(--success-700)' : 'var(--error-700)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      {item.detail}
                    </Badge>
                  </div>
                ))}

                {/* Last checked timestamp */}
                <div className="flex items-center gap-2 pt-2 mt-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <Clock className="h-3 w-3" style={{ color: 'var(--text-muted)' }} />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Last checked: {formatTimestamp(lastChecked)} (auto-refreshes every 15s)
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Changes (git commits) */}
      <Card className="card-premium" style={{ borderRadius: 'var(--radius-xl)' }}>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <div
              className="flex h-7 w-7 items-center justify-center"
              style={{ background: 'color-mix(in srgb, var(--accent-500) 12%, transparent)', borderRadius: 'var(--radius-md)' }}
            >
              <GitCommit className="h-3.5 w-3.5" style={{ color: 'var(--accent-500)' }} />
            </div>
            Recent Changes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {commitsQuery.isLoading && <CommitsSkeleton />}

          {commitsQuery.isError && (
            <div className="py-4 text-center">
              <p className="text-sm" style={{ color: 'var(--error-500, #ef4444)' }}>Failed to load commits</p>
              <Button size="sm" variant="ghost" onClick={() => void commitsQuery.refetch()} className="mt-2" style={{ borderRadius: 'var(--radius-md)' }}>
                <RefreshCw className="h-3 w-3 mr-1" />Retry
              </Button>
            </div>
          )}

          {commitsQuery.isSuccess && (commitsQuery.data?.length ?? 0) === 0 && (
            <p className="py-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No commits found</p>
          )}

          {commitsQuery.isSuccess && (commitsQuery.data?.length ?? 0) > 0 && (
            <div className="space-y-1">
              {commitsQuery.data?.map((commit, i) => (
                <div
                  key={commit.hash}
                  className="flex items-center justify-between py-2.5 transition-all hover:scale-[1.01]"
                  style={{ borderBottom: i < (commitsQuery.data?.length ?? 0) - 1 ? '1px solid var(--border-subtle)' : 'none' }}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Badge
                      variant="outline"
                      className="font-mono text-[10px] shrink-0"
                      style={{
                        color: 'var(--brand-500)',
                        borderColor: 'color-mix(in srgb, var(--brand-500) 30%, transparent)',
                        borderRadius: 'var(--radius-md)',
                        background: 'color-mix(in srgb, var(--brand-500) 5%, transparent)',
                      }}
                    >
                      {commit.shortHash}
                    </Badge>
                    <span className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>
                      {commit.message}
                    </span>
                  </div>
                  <span className="text-xs shrink-0 ml-2" style={{ color: 'var(--text-muted)' }}>
                    {formatRelativeTime(commit.date)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Theme Stats */}
      <Card className="card-premium" style={{ borderRadius: 'var(--radius-xl)' }}>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <div
              className="flex h-7 w-7 items-center justify-center"
              style={{ background: 'color-mix(in srgb, var(--brand-500) 12%, transparent)', borderRadius: 'var(--radius-md)' }}
            >
              <Palette className="h-3.5 w-3.5" style={{ color: 'var(--brand-500)' }} />
            </div>
            Theme Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {themeStats.map((stat) => (
              <div
                key={stat.label}
                className="text-center p-4 transition-all hover:scale-[1.05] cursor-default"
                style={{
                  background: `color-mix(in srgb, ${stat.color} 8%, transparent)`,
                  borderRadius: 'var(--radius-lg)',
                  border: `1px solid color-mix(in srgb, ${stat.color} 15%, transparent)`,
                }}
              >
                <div
                  className="flex h-8 w-8 items-center justify-center mx-auto mb-2"
                  style={{
                    background: `color-mix(in srgb, ${stat.color} 15%, transparent)`,
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <stat.icon className="h-4 w-4" style={{ color: stat.color }} />
                </div>
                <p className="text-2xl font-bold" style={gradientTextStyle}>{stat.value}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
