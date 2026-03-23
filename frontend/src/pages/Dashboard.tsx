import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Settings,
  Terminal,
  GitBranch,
  Puzzle,
  Brain,
  ListTodo,
  GitFork,
  GitCommit,
  Activity,
  RefreshCw,
  Zap,
  Server,
  Cpu,
  TrendingUp,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Database,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

const PROJECT_DIR = '/Users/rajatrajawatpmac/claude-dashboard';

interface HealthData {
  status: string;
  database: string;
  service: string;
  version: string;
}

interface MemoryEntry {
  name: string;
  content: string;
  path: string;
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

interface BranchEntry {
  name: string;
  commit: string;
  current: boolean;
}

interface WorktreeEntry {
  path: string;
  head: string;
  branch: string;
}

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

/** Classify a commit message into a type for visual indicator */
function getCommitType(message: string): { label: string; color: string; bgColor: string } {
  const msg = message.toLowerCase();
  if (msg.startsWith('feat') || msg.startsWith('add'))
    return { label: 'feat', color: 'var(--success-700)', bgColor: 'var(--success-100)' };
  if (msg.startsWith('fix') || msg.startsWith('bug'))
    return { label: 'fix', color: 'var(--error-700)', bgColor: 'var(--error-100)' };
  if (msg.startsWith('refactor') || msg.startsWith('clean'))
    return { label: 'refac', color: 'var(--info-700)', bgColor: 'var(--info-100)' };
  if (msg.startsWith('style') || msg.startsWith('ui') || msg.startsWith('improve'))
    return { label: 'style', color: 'var(--accent-700)', bgColor: 'var(--accent-100)' };
  if (msg.startsWith('docs') || msg.startsWith('doc'))
    return { label: 'docs', color: 'var(--warning-700)', bgColor: 'var(--warning-100)' };
  if (msg.startsWith('test'))
    return { label: 'test', color: '#5f3dc4', bgColor: '#e5dbff' };
  if (msg.startsWith('chore') || msg.startsWith('update'))
    return { label: 'chore', color: 'var(--text-muted)', bgColor: 'var(--bg-elevated)' };
  return { label: 'commit', color: 'var(--brand-700)', bgColor: 'var(--brand-100)' };
}

/* ---- Pulse keyframe injected once via style tag ---- */
const PULSE_STYLE_ID = 'dashboard-pulse-style';
function ensurePulseStyle() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(PULSE_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = PULSE_STYLE_ID;
  style.textContent = `
    @keyframes dashboard-pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.55; transform: scale(1.35); }
    }
    @keyframes dashboard-gradient-shift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    @keyframes dashboard-spin-slow {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

function StatSkeleton() {
  return (
    <Card
      style={{
        background: 'var(--bg-card)',
        borderColor: 'var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
      }}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-8" />
          </div>
          <Skeleton className="h-11 w-11 rounded-xl" />
        </div>
      </CardContent>
    </Card>
  );
}

function ActivitySkeleton() {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div className="flex items-center gap-3 flex-1">
        <Skeleton className="h-5 w-14" style={{ borderRadius: 'var(--radius-md)' }} />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    ensurePulseStyle();
  }, []);

  const healthQuery = useQuery<HealthData>({
    queryKey: ['health'],
    queryFn: async () => {
      const res = await api.get('/health');
      setLastUpdated(new Date());
      return res.data;
    },
    refetchInterval: 30000,
  });

  const memoryQuery = useQuery<MemoryEntry[]>({
    queryKey: ['memory'],
    queryFn: async () => {
      const res = await api.get('/memory');
      return res.data.data;
    },
    refetchInterval: 30000,
  });

  const pluginsQuery = useQuery<PluginEntry[]>({
    queryKey: ['plugins'],
    queryFn: async () => {
      const res = await api.get('/plugins');
      return res.data.data;
    },
    refetchInterval: 30000,
  });

  const commitsQuery = useQuery<CommitEntry[]>({
    queryKey: ['dashboard-commits'],
    queryFn: async () => {
      const res = await api.get('/git/commits', { params: { dir: PROJECT_DIR, limit: 10 } });
      return res.data.data;
    },
    refetchInterval: 30000,
  });

  const branchesQuery = useQuery<BranchEntry[]>({
    queryKey: ['dashboard-branches'],
    queryFn: async () => {
      const res = await api.get('/git/branches', { params: { dir: PROJECT_DIR } });
      return res.data.data;
    },
    refetchInterval: 30000,
  });

  const worktreesQuery = useQuery<WorktreeEntry[]>({
    queryKey: ['dashboard-worktrees'],
    queryFn: async () => {
      const res = await api.get('/git/worktrees', { params: { dir: PROJECT_DIR } });
      return res.data.data;
    },
    refetchInterval: 30000,
  });

  const stats = [
    {
      label: 'Git Branches',
      value: branchesQuery.data?.length ?? '-',
      icon: GitBranch,
      color: '#f06595',
      gradient: 'linear-gradient(135deg, rgba(240,101,149,0.12) 0%, rgba(240,101,149,0.04) 100%)',
      path: '/git',
      loading: branchesQuery.isLoading,
    },
    {
      label: 'Worktrees',
      value: worktreesQuery.data?.length ?? '-',
      icon: GitFork,
      color: '#7950f2',
      gradient: 'linear-gradient(135deg, rgba(121,80,242,0.12) 0%, rgba(121,80,242,0.04) 100%)',
      path: '/git',
      loading: worktreesQuery.isLoading,
    },
    {
      label: 'Plugins',
      value: pluginsQuery.data?.length ?? '-',
      icon: Puzzle,
      color: '#be4bdb',
      gradient: 'linear-gradient(135deg, rgba(190,75,219,0.12) 0%, rgba(190,75,219,0.04) 100%)',
      path: '/plugins',
      loading: pluginsQuery.isLoading,
    },
    {
      label: 'Memories',
      value: memoryQuery.data?.length ?? '-',
      icon: Brain,
      color: '#15aabf',
      gradient: 'linear-gradient(135deg, rgba(21,170,191,0.12) 0%, rgba(21,170,191,0.04) 100%)',
      path: '/memory',
      loading: memoryQuery.isLoading,
    },
    {
      label: 'Recent Commits',
      value: commitsQuery.data?.length ?? '-',
      icon: GitCommit,
      color: '#4263eb',
      gradient: 'linear-gradient(135deg, rgba(66,99,235,0.12) 0%, rgba(66,99,235,0.04) 100%)',
      path: '/git',
      loading: commitsQuery.isLoading,
    },
    {
      label: 'Tasks',
      value: '7',
      icon: ListTodo,
      color: '#fd7e14',
      gradient: 'linear-gradient(135deg, rgba(253,126,20,0.12) 0%, rgba(253,126,20,0.04) 100%)',
      path: '/tasks',
      loading: false,
    },
  ];

  const recentCommits = (commitsQuery.data ?? []).slice(0, 5);
  const isHealthy = healthQuery.data?.status === 'ok' || healthQuery.data?.status === 'healthy';

  const quickActions = [
    { label: 'New Terminal', icon: Terminal, path: '/terminals', color: '#a6e3a1', desc: 'Open shell session' },
    { label: 'View Settings', icon: Settings, path: '/settings', color: '#868e96', desc: 'Configuration' },
    { label: 'Browse Memory', icon: Brain, path: '/memory', color: '#15aabf', desc: 'CLAUDE.md files' },
    { label: 'Manage Tasks', icon: ListTodo, path: '/tasks', color: '#7950f2', desc: 'Track work items' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            Dashboard
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Claude Code Management Console
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Last updated */}
          <div className="flex items-center gap-1.5">
            <RefreshCw
              className="h-3 w-3"
              style={{ color: 'var(--text-muted)' }}
            />
            <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
              {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          {/* Health indicator */}
          <div
            className="flex items-center gap-2 px-3 py-1.5"
            style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: healthQuery.isLoading
                  ? 'var(--text-muted)'
                  : isHealthy
                    ? 'var(--success-500)'
                    : 'var(--error-500)',
                animation: healthQuery.isLoading
                  ? 'none'
                  : 'dashboard-pulse 2s ease-in-out infinite',
                boxShadow: healthQuery.isLoading
                  ? 'none'
                  : isHealthy
                    ? '0 0 8px var(--success-400)'
                    : '0 0 8px var(--error-400)',
              }}
            />
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              {healthQuery.isLoading ? 'Checking...' : isHealthy ? 'Online' : 'Error'}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid - with animated gradient border */}
      <div
        className="p-[1px]"
        style={{
          borderRadius: 'var(--radius-2xl)',
          background: 'linear-gradient(135deg, var(--brand-400), var(--accent-400), var(--info-400), var(--brand-400))',
          backgroundSize: '300% 300%',
          animation: 'dashboard-gradient-shift 6s ease infinite',
        }}
      >
        <div
          className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6 p-4"
          style={{
            background: 'var(--bg-secondary)',
            borderRadius: 'calc(var(--radius-2xl) - 1px)',
          }}
        >
          {stats.map((stat) =>
            stat.loading ? (
              <StatSkeleton key={stat.label} />
            ) : (
              <Card
                key={stat.label}
                className="cursor-pointer group"
                style={{
                  background: stat.gradient,
                  borderColor: 'var(--border-subtle)',
                  borderRadius: 'var(--radius-xl)',
                  transition: 'var(--transition-smooth)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                }}
                onClick={() => navigate(stat.path)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.04) translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 8px 24px color-mix(in srgb, ${stat.color} 20%, transparent)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1) translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)';
                }}
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p
                        className="text-[11px] font-semibold uppercase tracking-wider"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {stat.label}
                      </p>
                      <p
                        className="text-2xl font-bold mt-1.5"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {String(stat.value)}
                      </p>
                    </div>
                    <div
                      className="flex h-11 w-11 items-center justify-center"
                      style={{
                        background: `color-mix(in srgb, ${stat.color} 15%, transparent)`,
                        borderRadius: 'var(--radius-lg)',
                        transition: 'var(--transition-smooth)',
                      }}
                    >
                      <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Commits */}
        <Card
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center"
                style={{
                  background: 'color-mix(in srgb, var(--brand-500) 12%, transparent)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <TrendingUp className="h-4 w-4" style={{ color: 'var(--brand-500)' }} />
              </div>
              <CardTitle className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                Recent Commits
              </CardTitle>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate('/git')}
              className="text-xs gap-1 group/btn"
              style={{
                color: 'var(--brand-500)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              View all
              <ArrowRight
                className="h-3 w-3 transition-transform group-hover/btn:translate-x-0.5"
              />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-0.5">
              {commitsQuery.isLoading &&
                Array.from({ length: 5 }).map((_, i) => <ActivitySkeleton key={i} />)}

              {commitsQuery.isError && (
                <div className="py-6 text-center">
                  <XCircle className="h-8 w-8 mx-auto mb-2" style={{ color: 'var(--error-400)' }} />
                  <p className="text-sm" style={{ color: 'var(--error-500)' }}>
                    Failed to load commits
                  </p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => void commitsQuery.refetch()}
                    className="mt-2"
                    style={{ borderRadius: 'var(--radius-md)' }}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Retry
                  </Button>
                </div>
              )}

              {commitsQuery.isSuccess && recentCommits.length === 0 && (
                <p className="py-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                  No commits found
                </p>
              )}

              {recentCommits.map((commit, i) => {
                const commitType = getCommitType(commit.message);
                return (
                  <div
                    key={commit.hash}
                    className="flex items-center justify-between py-2.5 px-2 group/commit"
                    style={{
                      borderBottom:
                        i < recentCommits.length - 1
                          ? '1px solid var(--border-subtle)'
                          : 'none',
                      borderRadius: 'var(--radius-md)',
                      transition: 'var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--bg-elevated)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Commit type indicator badge */}
                      <Badge
                        className="text-[10px] font-semibold uppercase shrink-0 px-1.5 py-0.5"
                        style={{
                          background: commitType.bgColor,
                          color: commitType.color,
                          borderRadius: 'var(--radius-sm)',
                          border: 'none',
                          letterSpacing: '0.03em',
                        }}
                      >
                        {commitType.label}
                      </Badge>
                      <span
                        className="text-sm truncate"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {commit.message}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <Clock className="h-3 w-3" style={{ color: 'var(--text-muted)' }} />
                      <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        {formatRelativeTime(commit.date)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          <CardHeader className="pb-3">
            <CardTitle
              className="text-base font-semibold flex items-center gap-2"
              style={{ color: 'var(--text-primary)' }}
            >
              <div
                className="flex h-8 w-8 items-center justify-center"
                style={{
                  background: 'color-mix(in srgb, var(--success-500) 12%, transparent)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <Activity className="h-4 w-4" style={{ color: 'var(--success-500)' }} />
              </div>
              System Health
              {/* Pulsing green/red dot */}
              {!healthQuery.isLoading && (
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: isHealthy ? 'var(--success-500)' : 'var(--error-500)',
                    animation: 'dashboard-pulse 2s ease-in-out infinite',
                    boxShadow: isHealthy
                      ? '0 0 8px var(--success-400)'
                      : '0 0 8px var(--error-400)',
                    marginLeft: 4,
                  }}
                />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {healthQuery.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                ))}
              </div>
            ) : healthQuery.isError ? (
              <div className="py-6 text-center">
                <AlertTriangle
                  className="h-8 w-8 mx-auto mb-2"
                  style={{ color: 'var(--error-400)' }}
                />
                <p className="text-sm" style={{ color: 'var(--error-500)' }}>
                  Cannot reach API server
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => void healthQuery.refetch()}
                  className="mt-2"
                  style={{ borderRadius: 'var(--radius-md)' }}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {/* API Status */}
                <div
                  className="flex justify-between items-center py-2.5 px-3"
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="flex h-7 w-7 items-center justify-center"
                      style={{
                        background: isHealthy
                          ? 'color-mix(in srgb, var(--success-500) 12%, transparent)'
                          : 'color-mix(in srgb, var(--error-500) 12%, transparent)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      <Zap
                        className="h-3.5 w-3.5"
                        style={{
                          color: isHealthy ? 'var(--success-600)' : 'var(--error-600)',
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                      API Status
                    </span>
                  </div>
                  <Badge
                    style={{
                      background: isHealthy ? 'var(--success-100)' : 'var(--error-100)',
                      color: isHealthy ? 'var(--success-800)' : 'var(--error-800)',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: 600,
                      fontSize: '11px',
                    }}
                  >
                    {isHealthy ? (
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                    ) : (
                      <XCircle className="h-3 w-3 mr-1" />
                    )}
                    {healthQuery.data?.status ?? 'unknown'}
                  </Badge>
                </div>

                {/* Database */}
                <div
                  className="flex justify-between items-center py-2.5 px-3"
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="flex h-7 w-7 items-center justify-center"
                      style={{
                        background:
                          healthQuery.data?.database === 'connected'
                            ? 'color-mix(in srgb, var(--success-500) 12%, transparent)'
                            : 'color-mix(in srgb, var(--warning-500) 12%, transparent)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      <Database
                        className="h-3.5 w-3.5"
                        style={{
                          color:
                            healthQuery.data?.database === 'connected'
                              ? 'var(--success-600)'
                              : 'var(--warning-600)',
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                      Database
                    </span>
                  </div>
                  <Badge
                    style={{
                      background:
                        healthQuery.data?.database === 'connected'
                          ? 'var(--success-100)'
                          : 'var(--warning-100)',
                      color:
                        healthQuery.data?.database === 'connected'
                          ? 'var(--success-800)'
                          : 'var(--warning-800)',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: 600,
                      fontSize: '11px',
                    }}
                  >
                    {healthQuery.data?.database === 'connected' ? (
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                    ) : (
                      <AlertTriangle className="h-3 w-3 mr-1" />
                    )}
                    {healthQuery.data?.database ?? 'unknown'}
                  </Badge>
                </div>

                {/* Service */}
                <div
                  className="flex justify-between items-center py-2.5 px-3"
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="flex h-7 w-7 items-center justify-center"
                      style={{
                        background: 'color-mix(in srgb, var(--info-500) 12%, transparent)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      <Server
                        className="h-3.5 w-3.5"
                        style={{ color: 'var(--info-600)' }}
                      />
                    </div>
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                      Service
                    </span>
                  </div>
                  <span
                    className="text-sm font-mono font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {healthQuery.data?.service ?? 'unknown'}
                  </span>
                </div>

                {/* Version */}
                <div
                  className="flex justify-between items-center py-2.5 px-3"
                  style={{ borderRadius: 'var(--radius-md)' }}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="flex h-7 w-7 items-center justify-center"
                      style={{
                        background: 'color-mix(in srgb, var(--brand-500) 12%, transparent)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      <Cpu
                        className="h-3.5 w-3.5"
                        style={{ color: 'var(--brand-600)' }}
                      />
                    </div>
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                      Version
                    </span>
                  </div>
                  <Badge
                    style={{
                      background: 'var(--brand-100)',
                      color: 'var(--brand-800)',
                      borderRadius: 'var(--radius-full)',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 600,
                      fontSize: '11px',
                    }}
                  >
                    {healthQuery.data?.version ?? 'unknown'}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card
        style={{
          background: 'var(--bg-card)',
          borderColor: 'var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center"
              style={{
                background: 'color-mix(in srgb, var(--accent-500) 12%, transparent)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <Sparkles className="h-4 w-4" style={{ color: 'var(--accent-500)' }} />
            </div>
            <CardTitle className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
              Quick Actions
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className="flex items-center gap-3 p-4 text-left group/action"
                style={{
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-subtle)',
                  transition: 'var(--transition-smooth)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `linear-gradient(135deg, color-mix(in srgb, ${action.color} 10%, var(--bg-elevated)), var(--bg-elevated))`;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 6px 16px color-mix(in srgb, ${action.color} 15%, transparent)`;
                  e.currentTarget.style.borderColor = `color-mix(in srgb, ${action.color} 30%, var(--border-subtle))`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--bg-elevated)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                }}
              >
                <div
                  className="flex h-9 w-9 items-center justify-center shrink-0"
                  style={{
                    background: `color-mix(in srgb, ${action.color} 15%, transparent)`,
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <action.icon className="h-4.5 w-4.5" style={{ color: action.color }} />
                </div>
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {action.label}
                  </p>
                  <p
                    className="text-[11px]"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {action.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
