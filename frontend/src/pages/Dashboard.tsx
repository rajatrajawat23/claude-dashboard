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
} from 'lucide-react';
import { Button } from '@/components/ui/button';

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

function StatSkeleton() {
  return (
    <Card style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-8" />
          </div>
          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>
      </CardContent>
    </Card>
  );
}

function ActivitySkeleton() {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3 flex-1">
        <Skeleton className="h-5 w-12" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();

  const healthQuery = useQuery<HealthData>({
    queryKey: ['health'],
    queryFn: async () => {
      const res = await api.get('/health');
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
      color: 'var(--icon-git, var(--brand-500))',
      path: '/git',
      loading: branchesQuery.isLoading,
    },
    {
      label: 'Worktrees',
      value: worktreesQuery.data?.length ?? '-',
      icon: GitFork,
      color: 'var(--accent-500, var(--brand-500))',
      path: '/git',
      loading: worktreesQuery.isLoading,
    },
    {
      label: 'Plugins',
      value: pluginsQuery.data?.length ?? '-',
      icon: Puzzle,
      color: 'var(--icon-plugin, var(--brand-500))',
      path: '/plugins',
      loading: pluginsQuery.isLoading,
    },
    {
      label: 'Memories',
      value: memoryQuery.data?.length ?? '-',
      icon: Brain,
      color: 'var(--icon-memory, var(--brand-500))',
      path: '/memory',
      loading: memoryQuery.isLoading,
    },
    {
      label: 'Recent Commits',
      value: commitsQuery.data?.length ?? '-',
      icon: GitCommit,
      color: 'var(--icon-git, var(--brand-500))',
      path: '/git',
      loading: commitsQuery.isLoading,
    },
    {
      label: 'Tasks',
      value: '7',
      icon: ListTodo,
      color: 'var(--icon-task, var(--brand-500))',
      path: '/tasks',
      loading: false,
    },
  ];

  const recentCommits = (commitsQuery.data ?? []).slice(0, 5);
  const isHealthy = healthQuery.data?.status === 'ok' || healthQuery.data?.status === 'healthy';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Claude Code Management Console</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Health indicator */}
          <div className="flex items-center gap-2">
            <div
              className="h-2 w-2 rounded-full"
              style={{
                background: healthQuery.isLoading
                  ? 'var(--text-muted)'
                  : isHealthy
                    ? 'var(--success-500)'
                    : 'var(--error-500, #ef4444)',
              }}
            />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {healthQuery.isLoading ? 'Checking...' : isHealthy ? 'API Online' : 'API Error'}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {stats.map((stat) =>
          stat.loading ? (
            <StatSkeleton key={stat.label} />
          ) : (
            <Card
              key={stat.label}
              className="cursor-pointer transition-all hover:scale-[1.02]"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}
              onClick={() => navigate(stat.path)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
                    <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                      {String(stat.value)}
                    </p>
                  </div>
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ background: `color-mix(in srgb, ${stat.color} 15%, transparent)` }}
                  >
                    <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <Card style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg" style={{ color: 'var(--text-primary)' }}>Recent Commits</CardTitle>
            <Button size="sm" variant="ghost" onClick={() => navigate('/git')} className="text-xs" style={{ color: 'var(--brand-500)' }}>
              View all
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {commitsQuery.isLoading && Array.from({ length: 5 }).map((_, i) => <ActivitySkeleton key={i} />)}

              {commitsQuery.isError && (
                <div className="py-4 text-center">
                  <p className="text-sm" style={{ color: 'var(--error-500, #ef4444)' }}>Failed to load commits</p>
                  <Button size="sm" variant="ghost" onClick={() => void commitsQuery.refetch()} className="mt-2">
                    <RefreshCw className="h-3 w-3 mr-1" />Retry
                  </Button>
                </div>
              )}

              {commitsQuery.isSuccess && recentCommits.length === 0 && (
                <p className="py-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No commits found</p>
              )}

              {recentCommits.map((commit, i) => (
                <div
                  key={commit.hash}
                  className="flex items-center justify-between py-2"
                  style={{ borderBottom: i < recentCommits.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <GitCommit className="h-4 w-4 shrink-0" style={{ color: 'var(--brand-500)' }} />
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
          </CardContent>
        </Card>

        {/* System Health */}
        <Card style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Activity className="h-5 w-5" style={{ color: 'var(--brand-500)' }} />
              System Health
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
              <div className="py-4 text-center">
                <p className="text-sm" style={{ color: 'var(--error-500, #ef4444)' }}>Cannot reach API server</p>
                <Button size="sm" variant="ghost" onClick={() => void healthQuery.refetch()} className="mt-2">
                  <RefreshCw className="h-3 w-3 mr-1" />Retry
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center py-1" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>API Status</span>
                  <Badge style={{
                    background: isHealthy ? 'var(--success-100)' : 'var(--error-100, #fef2f2)',
                    color: isHealthy ? 'var(--success-800)' : 'var(--error-800, #991b1b)',
                    borderRadius: 'var(--radius-sm)',
                  }}>
                    {healthQuery.data?.status ?? 'unknown'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-1" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Database</span>
                  <Badge style={{
                    background: healthQuery.data?.database === 'connected' ? 'var(--success-100)' : 'var(--warning-100)',
                    color: healthQuery.data?.database === 'connected' ? 'var(--success-800)' : 'var(--warning-800)',
                    borderRadius: 'var(--radius-sm)',
                  }}>
                    {healthQuery.data?.database ?? 'unknown'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-1" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Service</span>
                  <span className="text-sm font-mono" style={{ color: 'var(--text-primary)' }}>
                    {healthQuery.data?.service ?? 'unknown'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Version</span>
                  <span className="text-sm font-mono" style={{ color: 'var(--text-primary)' }}>
                    {healthQuery.data?.version ?? 'unknown'}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
        <CardHeader>
          <CardTitle className="text-lg" style={{ color: 'var(--text-primary)' }}>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { label: 'New Terminal', icon: Terminal, path: '/terminals' },
              { label: 'View Settings', icon: Settings, path: '/settings' },
              { label: 'Browse Memory', icon: Brain, path: '/memory' },
              { label: 'Manage Tasks', icon: ListTodo, path: '/tasks' },
            ].map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className="flex items-center gap-2 rounded-lg p-3 text-sm font-medium transition-colors"
                style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', borderRadius: 'var(--radius-lg)' }}
              >
                <action.icon className="h-4 w-4" style={{ color: 'var(--brand-500)' }} />
                {action.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
