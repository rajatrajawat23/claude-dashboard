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
import { GitBranch, GitCommit, FileCode, RefreshCw, Search, AlertCircle } from 'lucide-react';

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

function CommitSkeleton() {
  return (
    <Card style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <Skeleton className="h-4 w-4 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
        <Skeleton className="h-6 w-16" />
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Git</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Repository and version control</p>
        </div>
        <Button size="sm" variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="commits" className="space-y-4">
        <TabsList style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}>
          <TabsTrigger value="commits">
            <GitCommit className="h-4 w-4 mr-2" />
            Commits
            {commitsQuery.data && (
              <Badge variant="secondary" className="ml-2 text-xs">{commitsQuery.data.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="branches">
            <GitBranch className="h-4 w-4 mr-2" />
            Branches
            {branchesQuery.data && (
              <Badge variant="secondary" className="ml-2 text-xs">{branchesQuery.data.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="changes">
            <FileCode className="h-4 w-4 mr-2" />
            Changes
            {statusQuery.data && (
              <Badge variant="secondary" className="ml-2 text-xs">{statusQuery.data.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Commits Tab */}
        <TabsContent value="commits" className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--text-muted)' }} />
            <Input
              placeholder="Search commits..."
              value={commitSearch}
              onChange={(e) => setCommitSearch(e.target.value)}
              className="pl-9"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
            />
          </div>

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
            <Card style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
              <CardContent className="p-6 text-center">
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {commitSearch ? 'No commits match your search' : 'No commits found'}
                </p>
              </CardContent>
            </Card>
          )}

          {filteredCommits.map((commit) => (
            <Card key={commit.hash} style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <GitCommit className="h-4 w-4 shrink-0" style={{ color: 'var(--brand-500)' }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{commit.message}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {commit.author} &middot; {formatRelativeTime(commit.date)}
                    </p>
                  </div>
                </div>
                <code className="text-xs font-mono px-2 py-1 rounded shrink-0" style={{ background: 'var(--bg-elevated)', color: 'var(--brand-400)', borderRadius: 'var(--radius-sm)' }}>
                  {commit.shortHash || commit.hash.slice(0, 7)}
                </code>
              </CardContent>
            </Card>
          ))}
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

          {branchesQuery.isSuccess && branchesQuery.data.length === 0 && (
            <Card style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
              <CardContent className="p-6 text-center">
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No branches found</p>
              </CardContent>
            </Card>
          )}

          {(branchesQuery.data ?? []).map((branch) => (
            <Card key={branch.name} style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GitBranch className="h-4 w-4" style={{ color: branch.current ? 'var(--success-500)' : 'var(--text-muted)' }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{branch.name}</span>
                  {branch.current && (
                    <Badge style={{ background: 'var(--success-100)', color: 'var(--success-800)', borderRadius: 'var(--radius-sm)' }}>
                      current
                    </Badge>
                  )}
                </div>
                <code className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{branch.commit}</code>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Changes Tab */}
        <TabsContent value="changes" className="space-y-2">
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

          {statusQuery.isSuccess && statusQuery.data.length === 0 && (
            <Card style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
              <CardContent className="p-6 text-center">
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Working tree clean - no changes</p>
              </CardContent>
            </Card>
          )}

          {(statusQuery.data ?? []).map((change) => {
            const color = statusColor(change.status);
            return (
              <Card key={change.file} style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
                <CardContent className="p-4 flex items-center gap-3">
                  <Badge style={{ background: `color-mix(in srgb, ${color} 15%, transparent)`, color, borderRadius: 'var(--radius-xs)', width: '24px', justifyContent: 'center' }}>
                    {change.status}
                  </Badge>
                  <code className="text-sm font-mono flex-1 truncate" style={{ color: 'var(--text-secondary)' }}>{change.file}</code>
                  <span className="text-xs shrink-0" style={{ color }}>{statusLabel(change.status)}</span>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}
