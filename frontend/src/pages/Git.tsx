import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  GitBranch,
  GitCommit,
  FileCode,
  RefreshCw,
  Search,
  AlertCircle,
  FileText,
  Plus,
  Minus,
  User,
  Clock,
} from 'lucide-react';

const PROJECT_DIR = '/Users/rajatrajawatpmac/claude-dashboard';

interface Commit {
  hash: string;
  shortHash: string;
  message: string;
  author: string;
  date: string;
}

interface Branch {
  name: string;
  commit: string;
  current: boolean;
}

interface StatusEntry {
  status: string;
  file: string;
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

function statusColor(status: string): string {
  switch (status) {
    case 'M': return 'var(--warning-500)';
    case 'A': case '?': return 'var(--success-500)';
    case 'D': return 'var(--error-500, #ef4444)';
    case 'R': return 'var(--info-500)';
    default: return 'var(--text-muted)';
  }
}

function statusLabel(status: string): string {
  switch (status) {
    case 'M': return 'Modified';
    case 'A': return 'Added';
    case 'D': return 'Deleted';
    case 'R': return 'Renamed';
    case '?': return 'Untracked';
    default: return status;
  }
}

// Commit message type prefix parsing
function parseCommitType(message: string): { type: string; rest: string; color: string; bg: string } {
  const match = message.match(/^(feat|fix|docs|refactor|chore|style|test|perf|ci|build|revert)(\(.*?\))?:\s*/i);
  if (!match) return { type: '', rest: message, color: 'var(--text-primary)', bg: 'transparent' };
  const typeStr = match[1].toLowerCase();
  const typeMap: Record<string, { color: string; bg: string }> = {
    feat:     { color: 'var(--success-700)', bg: 'color-mix(in srgb, var(--success-500) 12%, transparent)' },
    fix:      { color: 'var(--error-700)',   bg: 'color-mix(in srgb, var(--error-500) 12%, transparent)' },
    docs:     { color: 'var(--info-700)',    bg: 'color-mix(in srgb, var(--info-500) 12%, transparent)' },
    refactor: { color: 'var(--accent-700)',  bg: 'color-mix(in srgb, var(--accent-500) 12%, transparent)' },
    chore:    { color: 'var(--text-muted)',  bg: 'color-mix(in srgb, var(--text-muted) 12%, transparent)' },
    style:    { color: 'var(--accent-600)',  bg: 'color-mix(in srgb, var(--accent-500) 12%, transparent)' },
    test:     { color: 'var(--warning-700)', bg: 'color-mix(in srgb, var(--warning-500) 12%, transparent)' },
    perf:     { color: 'var(--brand-700)',   bg: 'color-mix(in srgb, var(--brand-500) 12%, transparent)' },
    ci:       { color: 'var(--info-600)',    bg: 'color-mix(in srgb, var(--info-500) 12%, transparent)' },
    build:    { color: 'var(--warning-600)', bg: 'color-mix(in srgb, var(--warning-500) 12%, transparent)' },
    revert:   { color: 'var(--error-600)',   bg: 'color-mix(in srgb, var(--error-500) 12%, transparent)' },
  };
  const cfg = typeMap[typeStr] ?? { color: 'var(--text-muted)', bg: 'transparent' };
  const prefix = match[0];
  return { type: prefix.replace(/:\s*$/, ''), rest: message.slice(prefix.length), color: cfg.color, bg: cfg.bg };
}

// File extension to color/icon
function getFileTypeStyle(file: string): { color: string; label: string } {
  const ext = file.split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, { color: string; label: string }> = {
    tsx:  { color: 'var(--info-500)',    label: 'TSX' },
    ts:   { color: 'var(--info-600)',    label: 'TS' },
    jsx:  { color: 'var(--info-400)',    label: 'JSX' },
    js:   { color: 'var(--warning-500)', label: 'JS' },
    go:   { color: 'var(--info-300)',    label: 'GO' },
    css:  { color: 'var(--accent-500)',  label: 'CSS' },
    scss: { color: 'var(--accent-400)',  label: 'SCSS' },
    md:   { color: 'var(--text-muted)',  label: 'MD' },
    json: { color: 'var(--warning-400)', label: 'JSON' },
    yaml: { color: 'var(--success-500)', label: 'YAML' },
    yml:  { color: 'var(--success-500)', label: 'YML' },
    html: { color: 'var(--error-400)',   label: 'HTML' },
    svg:  { color: 'var(--accent-300)',  label: 'SVG' },
    sql:  { color: 'var(--brand-500)',   label: 'SQL' },
    sh:   { color: 'var(--success-600)', label: 'SH' },
    mod:  { color: 'var(--info-300)',    label: 'MOD' },
    sum:  { color: 'var(--info-200)',    label: 'SUM' },
  };
  return map[ext] ?? { color: 'var(--text-muted)', label: ext.toUpperCase() || 'FILE' };
}

function CommitSkeleton() {
  return (
    <Card style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <Skeleton className="h-8 w-8" style={{ borderRadius: 'var(--radius-lg)' }} />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
        <Skeleton className="h-6 w-16" style={{ borderRadius: 'var(--radius-md)' }} />
      </CardContent>
    </Card>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
      <CardContent className="p-10 flex flex-col items-center gap-5 text-center">
        <div
          className="flex h-16 w-16 items-center justify-center"
          style={{
            background: 'color-mix(in srgb, var(--error-500) 12%, transparent)',
            borderRadius: 'var(--radius-xl)',
          }}
        >
          <AlertCircle className="h-8 w-8" style={{ color: 'var(--error-500)' }} />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Something went wrong</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{message}</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={onRetry}
          className="transition-all hover:scale-[1.02]"
          style={{ borderRadius: 'var(--radius-lg)' }}
        >
          <RefreshCw className="h-3 w-3 mr-2" />Retry
        </Button>
      </CardContent>
    </Card>
  );
}

// Empty states per tab
function EmptyCommits({ hasSearch }: { hasSearch: boolean }) {
  return (
    <Card style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
      <CardContent className="p-12 flex flex-col items-center gap-4">
        <div
          className="flex h-16 w-16 items-center justify-center"
          style={{
            background: 'color-mix(in srgb, var(--brand-500) 10%, transparent)',
            borderRadius: 'var(--radius-xl)',
          }}
        >
          <GitCommit className="h-8 w-8" style={{ color: 'var(--brand-400)' }} />
        </div>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {hasSearch ? 'No commits match your search' : 'No commits found'}
        </p>
      </CardContent>
    </Card>
  );
}

function EmptyBranches() {
  return (
    <Card style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
      <CardContent className="p-12 flex flex-col items-center gap-4">
        <div
          className="flex h-16 w-16 items-center justify-center"
          style={{
            background: 'color-mix(in srgb, var(--success-500) 10%, transparent)',
            borderRadius: 'var(--radius-xl)',
          }}
        >
          <GitBranch className="h-8 w-8" style={{ color: 'var(--success-400)' }} />
        </div>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No branches found</p>
      </CardContent>
    </Card>
  );
}

function EmptyChanges() {
  return (
    <Card style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
      <CardContent className="p-12 flex flex-col items-center gap-4">
        <div
          className="flex h-16 w-16 items-center justify-center"
          style={{
            background: 'color-mix(in srgb, var(--success-500) 10%, transparent)',
            borderRadius: 'var(--radius-xl)',
          }}
        >
          <FileCode className="h-8 w-8" style={{ color: 'var(--success-400)' }} />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Working tree clean</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No uncommitted changes</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Git() {
  const queryClient = useQueryClient();
  const [commitSearch, setCommitSearch] = useState('');

  const commitsQuery = useQuery<Commit[]>({
    queryKey: ['git-commits'],
    queryFn: async () => {
      const res = await api.get('/git/commits', { params: { dir: PROJECT_DIR, limit: 50 } });
      return res.data.data;
    },
  });

  const branchesQuery = useQuery<Branch[]>({
    queryKey: ['git-branches'],
    queryFn: async () => {
      const res = await api.get('/git/branches', { params: { dir: PROJECT_DIR } });
      return res.data.data;
    },
  });

  const statusQuery = useQuery<StatusEntry[]>({
    queryKey: ['git-status'],
    queryFn: async () => {
      const res = await api.get('/git/status', { params: { dir: PROJECT_DIR } });
      return res.data.data;
    },
  });

  const handleRefresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['git-commits'] });
    void queryClient.invalidateQueries({ queryKey: ['git-branches'] });
    void queryClient.invalidateQueries({ queryKey: ['git-status'] });
    toast.success('Refreshing git data...');
  };

  const filteredCommits = (commitsQuery.data ?? []).filter(c =>
    commitSearch === '' || c.message.toLowerCase().includes(commitSearch.toLowerCase())
  );

  const isRefreshing = commitsQuery.isFetching || branchesQuery.isFetching || statusQuery.isFetching;

  // Compute changes summary
  const changesAdded = (statusQuery.data ?? []).filter(c => c.status === 'A' || c.status === '?').length;
  const changesModified = (statusQuery.data ?? []).filter(c => c.status === 'M').length;
  const changesDeleted = (statusQuery.data ?? []).filter(c => c.status === 'D').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{
              background: 'linear-gradient(135deg, var(--brand-500), var(--success-500))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Git
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Repository and version control
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="transition-all hover:scale-[1.02]"
          style={{
            borderRadius: 'var(--radius-lg)',
            borderColor: 'var(--border-subtle)',
            color: 'var(--text-secondary)',
          }}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="commits" className="space-y-4">
        <TabsList
          style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-xl)',
            padding: '4px',
          }}
        >
          <TabsTrigger value="commits" style={{ borderRadius: 'var(--radius-lg)' }}>
            <GitCommit className="h-4 w-4 mr-2" />
            Commits
            {commitsQuery.data && (
              <Badge
                className="ml-2 text-[11px]"
                style={{
                  background: 'color-mix(in srgb, var(--brand-500) 12%, transparent)',
                  color: 'var(--brand-600)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                {commitsQuery.data.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="branches" style={{ borderRadius: 'var(--radius-lg)' }}>
            <GitBranch className="h-4 w-4 mr-2" />
            Branches
            {branchesQuery.data && (
              <Badge
                className="ml-2 text-[11px]"
                style={{
                  background: 'color-mix(in srgb, var(--success-500) 12%, transparent)',
                  color: 'var(--success-600)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                {branchesQuery.data.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="changes" style={{ borderRadius: 'var(--radius-lg)' }}>
            <FileCode className="h-4 w-4 mr-2" />
            Changes
            {statusQuery.data && (
              <Badge
                className="ml-2 text-[11px]"
                style={{
                  background: statusQuery.data.length > 0
                    ? 'color-mix(in srgb, var(--warning-500) 12%, transparent)'
                    : 'color-mix(in srgb, var(--success-500) 12%, transparent)',
                  color: statusQuery.data.length > 0 ? 'var(--warning-600)' : 'var(--success-600)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                {statusQuery.data.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Commits Tab */}
        <TabsContent value="commits" className="space-y-3">
          {/* Search bar */}
          <Card
            className="p-3"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border-subtle)',
              borderRadius: 'var(--radius-xl)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                style={{ color: 'var(--text-muted)' }}
              />
              <Input
                placeholder="Search commits..."
                value={commitSearch}
                onChange={(e) => setCommitSearch(e.target.value)}
                className="pl-9"
                style={{
                  background: 'var(--bg-elevated)',
                  borderColor: 'var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </Card>

          {commitsQuery.isLoading && (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <CommitSkeleton key={i} />)}
            </div>
          )}

          {commitsQuery.isError && (
            <ErrorState
              message="Failed to load commits. Is the backend running?"
              onRetry={() => void commitsQuery.refetch()}
            />
          )}

          {commitsQuery.isSuccess && filteredCommits.length === 0 && (
            <EmptyCommits hasSearch={commitSearch !== ''} />
          )}

          {/* Commit list with branch-graph-style timeline */}
          {filteredCommits.length > 0 && (
            <div className="relative">
              {/* Vertical timeline line */}
              <div
                className="absolute left-[27px] top-4 bottom-4"
                style={{
                  width: '2px',
                  background: 'linear-gradient(to bottom, var(--brand-300), var(--border-subtle))',
                  borderRadius: '1px',
                }}
              />
              <div className="space-y-2">
                {filteredCommits.map((commit) => {
                  const parsed = parseCommitType(commit.message);
                  return (
                    <Card
                      key={commit.hash}
                      className="transition-all hover:scale-[1.005] relative"
                      style={{
                        background: 'var(--bg-card)',
                        borderColor: 'var(--border-subtle)',
                        borderRadius: 'var(--radius-xl)',
                      }}
                    >
                      <CardContent className="p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {/* Graph dot */}
                          <div
                            className="relative z-10 flex h-[14px] w-[14px] items-center justify-center shrink-0"
                            style={{
                              background: 'var(--brand-500)',
                              borderRadius: 'var(--radius-full)',
                              boxShadow: '0 0 0 3px var(--bg-card)',
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              {parsed.type && (
                                <span
                                  className="text-[11px] font-semibold px-2 py-0.5 shrink-0"
                                  style={{
                                    color: parsed.color,
                                    background: parsed.bg,
                                    borderRadius: 'var(--radius-md)',
                                  }}
                                >
                                  {parsed.type}
                                </span>
                              )}
                              <p
                                className="text-sm font-medium truncate"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                {parsed.rest || commit.message}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                              <span
                                className="flex items-center gap-1 text-xs"
                                style={{ color: 'var(--text-muted)' }}
                              >
                                <User className="h-3 w-3" />
                                {commit.author}
                              </span>
                              <span
                                className="flex items-center gap-1 text-xs"
                                style={{ color: 'var(--text-muted)' }}
                              >
                                <Clock className="h-3 w-3" />
                                {formatRelativeTime(commit.date)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <code
                          className="text-[11px] font-mono px-2.5 py-1 shrink-0 font-medium"
                          style={{
                            background: 'color-mix(in srgb, var(--brand-500) 10%, transparent)',
                            color: 'var(--brand-500)',
                            borderRadius: 'var(--radius-md)',
                          }}
                        >
                          {commit.shortHash || commit.hash.slice(0, 7)}
                        </code>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Branches Tab */}
        <TabsContent value="branches" className="space-y-2">
          {branchesQuery.isLoading && (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => <CommitSkeleton key={i} />)}
            </div>
          )}

          {branchesQuery.isError && (
            <ErrorState
              message="Failed to load branches."
              onRetry={() => void branchesQuery.refetch()}
            />
          )}

          {branchesQuery.isSuccess && branchesQuery.data.length === 0 && <EmptyBranches />}

          {(branchesQuery.data ?? []).map((branch) => (
            <Card
              key={branch.name}
              className="transition-all hover:scale-[1.005]"
              style={{
                background: 'var(--bg-card)',
                borderColor: branch.current ? 'var(--success-300)' : 'var(--border-subtle)',
                borderRadius: 'var(--radius-xl)',
                borderLeftWidth: branch.current ? '3px' : '1px',
                borderLeftColor: branch.current ? 'var(--success-500)' : undefined,
              }}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 items-center justify-center shrink-0"
                    style={{
                      background: branch.current
                        ? 'color-mix(in srgb, var(--success-500) 15%, transparent)'
                        : 'color-mix(in srgb, var(--text-muted) 10%, transparent)',
                      borderRadius: 'var(--radius-lg)',
                    }}
                  >
                    <GitBranch
                      className="h-4 w-4"
                      style={{ color: branch.current ? 'var(--success-500)' : 'var(--text-muted)' }}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {branch.name}
                      </span>
                      {branch.current && (
                        <Badge
                          className="text-[11px]"
                          style={{
                            background: 'color-mix(in srgb, var(--success-500) 12%, transparent)',
                            color: 'var(--success-700)',
                            borderRadius: 'var(--radius-md)',
                          }}
                        >
                          <div
                            className="h-1.5 w-1.5 mr-1.5 animate-pulse"
                            style={{
                              background: 'var(--success-500)',
                              borderRadius: 'var(--radius-full)',
                            }}
                          />
                          current
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <code
                  className="text-[11px] font-mono px-2 py-1 font-medium"
                  style={{
                    background: 'color-mix(in srgb, var(--text-muted) 8%, transparent)',
                    color: 'var(--text-muted)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  {branch.commit}
                </code>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Changes Tab */}
        <TabsContent value="changes" className="space-y-3">
          {statusQuery.isLoading && (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => <CommitSkeleton key={i} />)}
            </div>
          )}

          {statusQuery.isError && (
            <ErrorState
              message="Failed to load git status."
              onRetry={() => void statusQuery.refetch()}
            />
          )}

          {statusQuery.isSuccess && statusQuery.data.length === 0 && <EmptyChanges />}

          {/* Changes summary bar */}
          {statusQuery.isSuccess && statusQuery.data.length > 0 && (
            <Card
              className="p-3"
              style={{
                background: 'var(--bg-card)',
                borderColor: 'var(--border-subtle)',
                borderRadius: 'var(--radius-xl)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <div className="flex items-center gap-4 text-xs">
                <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Summary:
                </span>
                {changesAdded > 0 && (
                  <span className="flex items-center gap-1" style={{ color: 'var(--success-600)' }}>
                    <Plus className="h-3 w-3" />{changesAdded} added
                  </span>
                )}
                {changesModified > 0 && (
                  <span className="flex items-center gap-1" style={{ color: 'var(--warning-600)' }}>
                    <FileText className="h-3 w-3" />{changesModified} modified
                  </span>
                )}
                {changesDeleted > 0 && (
                  <span className="flex items-center gap-1" style={{ color: 'var(--error-600)' }}>
                    <Minus className="h-3 w-3" />{changesDeleted} deleted
                  </span>
                )}
              </div>
            </Card>
          )}

          {(statusQuery.data ?? []).map((change) => {
            const color = statusColor(change.status);
            const fileStyle = getFileTypeStyle(change.file);
            return (
              <Card
                key={change.file}
                className="transition-all hover:scale-[1.005]"
                style={{
                  background: 'var(--bg-card)',
                  borderColor: 'var(--border-subtle)',
                  borderRadius: 'var(--radius-xl)',
                }}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  {/* Status badge */}
                  <Badge
                    className="text-[11px] font-bold shrink-0"
                    style={{
                      background: `color-mix(in srgb, ${color} 15%, transparent)`,
                      color,
                      borderRadius: 'var(--radius-md)',
                      width: '28px',
                      justifyContent: 'center',
                    }}
                  >
                    {change.status}
                  </Badge>
                  {/* File type badge */}
                  <Badge
                    className="text-[10px] font-mono font-medium shrink-0"
                    style={{
                      background: `color-mix(in srgb, ${fileStyle.color} 12%, transparent)`,
                      color: fileStyle.color,
                      borderRadius: 'var(--radius-md)',
                      padding: '1px 6px',
                    }}
                  >
                    {fileStyle.label}
                  </Badge>
                  {/* File path */}
                  <code
                    className="text-sm font-mono flex-1 truncate"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {change.file}
                  </code>
                  {/* Status label */}
                  <span
                    className="text-xs font-medium shrink-0"
                    style={{ color }}
                  >
                    {statusLabel(change.status)}
                  </span>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}
