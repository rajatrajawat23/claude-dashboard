import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { GitBranch, GitCommit, FolderOpen, RefreshCw, AlertCircle, TreePine } from 'lucide-react';

const PROJECT_DIR = '/Users/rajatrajawatpmac/claude-dashboard';

interface Worktree {
  path: string;
  head: string;
  branch: string;
  bare?: boolean;
}

function WorktreeSkeleton() {
  return (
    <Card style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-64" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card style={{ background: 'var(--bg-card)', borderColor: 'var(--error-500, #ef4444)', borderRadius: 'var(--radius-lg)' }}>
      <CardContent className="p-6 flex flex-col items-center gap-3 text-center">
        <AlertCircle className="h-8 w-8" style={{ color: 'var(--error-500, #ef4444)' }} />
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{message}</p>
        <Button size="sm" variant="outline" onClick={onRetry}>
          <RefreshCw className="h-3 w-3 mr-2" />Retry
        </Button>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <Card style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
      <CardContent className="p-10 flex flex-col items-center gap-3 text-center">
        <TreePine className="h-10 w-10" style={{ color: 'var(--text-muted)' }} />
        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>No worktrees found</p>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          This repository has no additional worktrees configured.
        </p>
      </CardContent>
    </Card>
  );
}

function shortenHash(hash: string): string {
  return hash.slice(0, 7);
}

function branchDisplayName(branch: string): string {
  // Strip refs/heads/ prefix if present
  return branch.replace(/^refs\/heads\//, '');
}

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Worktrees</h1>
            {worktrees && (
              <Badge variant="secondary" className="text-xs">
                {worktrees.length}
              </Badge>
            )}
          </div>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Manage git worktrees for parallel development
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={handleRefresh} disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

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
                style={{
                  background: 'var(--bg-card)',
                  borderColor: isMain ? 'var(--brand-300)' : 'var(--border-subtle)',
                  borderRadius: 'var(--radius-xl)',
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl"
                        style={{
                          background: isMain ? 'var(--brand-100)' : 'var(--accent-100)',
                        }}
                      >
                        <FolderOpen
                          className="h-5 w-5"
                          style={{ color: isMain ? 'var(--brand-600)' : 'var(--accent-600)' }}
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <GitBranch className="h-3.5 w-3.5" style={{ color: 'var(--text-muted)' }} />
                          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                            {displayBranch || '(detached)'}
                          </p>
                          {isMain && (
                            <Badge
                              style={{
                                background: 'var(--brand-100)',
                                color: 'var(--brand-700)',
                                borderRadius: 'var(--radius-sm)',
                              }}
                            >
                              main worktree
                            </Badge>
                          )}
                          {!isMain && (
                            <Badge
                              style={{
                                background: 'var(--shade-15)',
                                color: 'var(--text-muted)',
                                borderRadius: 'var(--radius-sm)',
                              }}
                            >
                              linked
                            </Badge>
                          )}
                          {wt.bare && (
                            <Badge
                              variant="outline"
                              style={{ borderRadius: 'var(--radius-sm)' }}
                            >
                              bare
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <FolderOpen className="h-3 w-3" style={{ color: 'var(--text-muted)' }} />
                          <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                            {wt.path}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <GitCommit className="h-3 w-3" style={{ color: 'var(--text-muted)' }} />
                          <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                            {shortenHash(wt.head)}
                          </span>
                        </div>
                      </div>
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
