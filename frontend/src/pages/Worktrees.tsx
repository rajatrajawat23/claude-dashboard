import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  GitBranch,
  GitCommit,
  FolderOpen,
  RefreshCw,
  AlertCircle,
  TreePine,
  Crown,
  Link2,
  Copy,
  Hash,
} from 'lucide-react';

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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Worktree {
  path: string;
  head: string;
  branch: string;
  bare?: boolean;
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function WorktreeSkeleton() {
  return (
    <Card className="card-premium" style={{ borderRadius: 'var(--radius-xl)' }}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-xl animate-shimmer" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-40 animate-shimmer" />
              <Skeleton className="h-3 w-64 animate-shimmer" />
              <Skeleton className="h-3 w-24 animate-shimmer" />
            </div>
          </div>
          <Skeleton className="h-5 w-20 rounded-full animate-shimmer" />
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Error state
// ---------------------------------------------------------------------------

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card className="card-premium" style={{ borderRadius: 'var(--radius-xl)' }}>
      <CardContent className="p-6 flex flex-col items-center gap-3 text-center">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ background: 'color-mix(in srgb, var(--error-500) 12%, transparent)' }}
        >
          <AlertCircle className="h-7 w-7" style={{ color: 'var(--error-500)' }} />
        </div>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{message}</p>
        <Button size="sm" variant="outline" onClick={onRetry} style={{ borderRadius: 'var(--radius-md)' }}>
          <RefreshCw className="h-3 w-3 mr-2" />Retry
        </Button>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState() {
  return (
    <Card className="card-premium" style={{ borderRadius: 'var(--radius-xl)' }}>
      <CardContent className="p-10 flex flex-col items-center gap-3 text-center">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl animate-float"
          style={{ background: 'color-mix(in srgb, var(--brand-500) 12%, transparent)', borderRadius: 'var(--radius-lg)' }}
        >
          <TreePine className="h-7 w-7" style={{ color: 'var(--brand-500)' }} />
        </div>
        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>No worktrees found</p>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          This repository has no additional worktrees configured.
        </p>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function shortenHash(hash: string): string {
  return hash.slice(0, 7);
}

function branchDisplayName(branch: string): string {
  return branch.replace(/^refs\/heads\//, '');
}

function handleCopyPath(path: string) {
  navigator.clipboard.writeText(path).then(() => {
    toast.success('Path copied to clipboard');
  }).catch(() => {
    toast.error('Failed to copy path');
  });
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function Worktrees() {
  const queryClient = useQueryClient();

  const { data: worktrees, isLoading, isError, error, isFetching } = useQuery<Worktree[]>({
    queryKey: ['git-worktrees'],
    queryFn: async () => {
      const res = await api.get('/git/worktrees', { params: { dir: PROJECT_DIR } });
      return res.data.data;
    },
  });

  const handleRefresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['git-worktrees'] });
    toast.success('Refreshing worktrees...');
  };

  const handleRetry = () => {
    void queryClient.invalidateQueries({ queryKey: ['git-worktrees'] });
  };

  const mainCount = worktrees ? 1 : 0;
  const linkedCount = worktrees ? Math.max(0, worktrees.length - 1) : 0;

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
            <GitBranch className="h-5 w-5" style={{ color: 'var(--brand-500)' }} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold" style={gradientTextStyle}>Worktrees</h1>
              {worktrees && (
                <Badge
                  variant="secondary"
                  className="text-xs"
                  style={{
                    borderRadius: 'var(--radius-md)',
                    background: 'color-mix(in srgb, var(--brand-500) 12%, transparent)',
                    color: 'var(--brand-600)',
                  }}
                >
                  {worktrees.length}
                </Badge>
              )}
            </div>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Manage git worktrees for parallel development
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleRefresh}
          disabled={isFetching}
          className="transition-all hover:scale-[1.05]"
          style={{ borderRadius: 'var(--radius-md)' }}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats strip */}
      {worktrees && worktrees.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <Card className="card-premium transition-all hover:scale-[1.02]" style={{ borderRadius: 'var(--radius-xl)', borderLeft: '3px solid var(--brand-500)' }}>
            <CardContent className="p-3 flex items-center gap-3">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center"
                style={{ background: 'color-mix(in srgb, var(--brand-500) 12%, transparent)', borderRadius: 'var(--radius-lg)' }}
              >
                <Crown className="h-4 w-4" style={{ color: 'var(--brand-500)' }} />
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Main Worktree</p>
                <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{mainCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="card-premium transition-all hover:scale-[1.02]" style={{ borderRadius: 'var(--radius-xl)', borderLeft: '3px solid var(--accent-500)' }}>
            <CardContent className="p-3 flex items-center gap-3">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center"
                style={{ background: 'color-mix(in srgb, var(--accent-500) 12%, transparent)', borderRadius: 'var(--radius-lg)' }}
              >
                <Link2 className="h-4 w-4" style={{ color: 'var(--accent-500)' }} />
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Linked Worktrees</p>
                <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{linkedCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-3">
          <WorktreeSkeleton />
          <WorktreeSkeleton />
          <WorktreeSkeleton />
        </div>
      )}

      {/* Error state */}
      {isError && (
        <ErrorState
          message={error instanceof Error ? error.message : 'Failed to load worktrees'}
          onRetry={handleRetry}
        />
      )}

      {/* Empty state */}
      {!isLoading && !isError && worktrees && worktrees.length === 0 && (
        <EmptyState />
      )}

      {/* Worktree list */}
      {!isLoading && !isError && worktrees && worktrees.length > 0 && (
        <div className="space-y-3">
          {worktrees.map((wt, index) => {
            const isMain = index === 0;
            const displayBranch = branchDisplayName(wt.branch);

            return (
              <Card
                key={wt.path}
                className="card-premium transition-all hover:scale-[1.01]"
                style={{
                  borderRadius: 'var(--radius-xl)',
                  borderLeft: isMain
                    ? '3px solid var(--brand-500)'
                    : '3px solid var(--accent-500)',
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className="flex h-10 w-10 items-center justify-center"
                        style={{
                          background: isMain
                            ? 'color-mix(in srgb, var(--brand-500) 12%, transparent)'
                            : 'color-mix(in srgb, var(--accent-500) 12%, transparent)',
                          borderRadius: 'var(--radius-lg)',
                        }}
                      >
                        {isMain ? (
                          <Crown className="h-5 w-5" style={{ color: 'var(--brand-500)' }} />
                        ) : (
                          <FolderOpen className="h-5 w-5" style={{ color: 'var(--accent-500)' }} />
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <GitBranch className="h-3.5 w-3.5" style={{ color: isMain ? 'var(--brand-500)' : 'var(--accent-500)' }} />
                          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                            {displayBranch || '(detached)'}
                          </p>
                          {isMain && (
                            <Badge
                              style={{
                                background: 'color-mix(in srgb, var(--brand-500) 12%, transparent)',
                                color: 'var(--brand-600)',
                                borderRadius: 'var(--radius-md)',
                              }}
                            >
                              <Crown className="h-2.5 w-2.5 mr-1" />
                              main worktree
                            </Badge>
                          )}
                          {!isMain && (
                            <Badge
                              style={{
                                background: 'color-mix(in srgb, var(--accent-500) 12%, transparent)',
                                color: 'var(--accent-600)',
                                borderRadius: 'var(--radius-md)',
                              }}
                            >
                              <Link2 className="h-2.5 w-2.5 mr-1" />
                              linked
                            </Badge>
                          )}
                          {wt.bare && (
                            <Badge
                              variant="outline"
                              style={{ borderRadius: 'var(--radius-md)' }}
                            >
                              bare
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 group">
                          <FolderOpen className="h-3 w-3" style={{ color: 'var(--text-muted)' }} />
                          <span
                            className="text-xs font-mono px-2 py-0.5"
                            style={{
                              color: 'var(--text-muted)',
                              background: 'var(--bg-elevated)',
                              borderRadius: 'var(--radius-sm)',
                            }}
                          >
                            {wt.path}
                          </span>
                          <button
                            onClick={() => handleCopyPath(wt.path)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:scale-110"
                            title="Copy path"
                          >
                            <Copy className="h-3 w-3" style={{ color: 'var(--text-muted)' }} />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Hash className="h-3 w-3" style={{ color: 'var(--text-muted)' }} />
                          <span
                            className="text-xs font-mono px-2 py-0.5"
                            style={{
                              color: 'var(--text-muted)',
                              background: 'var(--bg-elevated)',
                              borderRadius: 'var(--radius-sm)',
                            }}
                          >
                            {shortenHash(wt.head)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div
                      className="flex h-8 w-8 items-center justify-center shrink-0"
                      style={{
                        background: isMain
                          ? 'color-mix(in srgb, var(--brand-500) 8%, transparent)'
                          : 'color-mix(in srgb, var(--accent-500) 8%, transparent)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      <GitCommit
                        className="h-4 w-4"
                        style={{ color: isMain ? 'var(--brand-500)' : 'var(--accent-500)' }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
