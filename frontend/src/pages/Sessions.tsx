import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  MessageSquare,
  Search,
  ArrowUpDown,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  RefreshCw,
  Brain,
  FileText,
  Hash,
  Clock,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProjectSession {
  dirName: string;
  projectPath: string;
  projectName: string;
  sessionCount: number;
  modifiedAt: string;
  hasMemory: boolean;
}

interface SessionsResponse {
  data: ProjectSession[];
}

type SortKey = 'name' | 'sessions' | 'recent';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatRelativeTime(isoDate: string): string {
  if (!isoDate) return 'Unknown';
  const now = new Date();
  const then = new Date(isoDate);
  const diffMs = now.getTime() - then.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return `${Math.floor(diffMonths / 12)}y ago`;
}



function getShortPath(projectPath: string): string {
  const parts = projectPath.split('/').filter(Boolean);
  if (parts.length <= 2) return projectPath;
  return '~/' + parts.slice(2).join('/');
}

// ---------------------------------------------------------------------------
// Fetcher
// ---------------------------------------------------------------------------

async function fetchSessions(): Promise<ProjectSession[]> {
  const res = await api.get<SessionsResponse>('/claude/sessions');
  return res.data.data ?? [];
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function SessionsSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <Card
          key={i}
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
          }}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton
                  className="h-10 w-10 rounded-xl"
                  style={{ background: 'var(--bg-elevated)' }}
                />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton
                      className="h-4 w-40"
                      style={{ background: 'var(--bg-elevated)' }}
                    />
                    <Skeleton
                      className="h-5 w-16 rounded"
                      style={{ background: 'var(--bg-elevated)' }}
                    />
                  </div>
                  <Skeleton
                    className="h-3 w-56"
                    style={{ background: 'var(--bg-elevated)' }}
                  />
                </div>
              </div>
              <Skeleton
                className="h-6 w-6 rounded"
                style={{ background: 'var(--bg-elevated)' }}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Error state
// ---------------------------------------------------------------------------

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <Card
      style={{
        background: 'var(--bg-card)',
        borderColor: 'var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
      }}
    >
      <CardContent className="p-8 flex flex-col items-center gap-4">
        <AlertCircle className="h-10 w-10" style={{ color: 'var(--error-500)' }} />
        <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>
          {message}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          style={{ borderRadius: 'var(--radius-md)' }}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
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
    <Card
      style={{
        background: 'var(--bg-card)',
        borderColor: 'var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
      }}
    >
      <CardContent className="p-12 flex flex-col items-center gap-4">
        <MessageSquare
          className="h-12 w-12"
          style={{ color: 'var(--text-muted)' }}
        />
        <p
          className="text-sm font-medium"
          style={{ color: 'var(--text-secondary)' }}
        >
          No sessions found
        </p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Claude Code sessions will appear here once you start using Claude in
          your projects.
        </p>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Session card
// ---------------------------------------------------------------------------

function SessionCard({ session }: { session: ProjectSession }) {
  const [isOpen, setIsOpen] = useState(false);
  const shortPath = getShortPath(session.projectPath);
  const relTime = formatRelativeTime(session.modifiedAt);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card
        className="transition-all"
        style={{
          background: 'var(--bg-card)',
          borderColor: isOpen ? 'var(--brand-300)' : 'var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
        }}
      >
        <CollapsibleTrigger asChild>
          <CardContent className="p-4 cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0"
                  style={{ background: 'var(--brand-100)' }}
                >
                  <MessageSquare
                    className="h-5 w-5"
                    style={{ color: 'var(--brand-600)' }}
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p
                      className="font-medium text-sm truncate"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {session.projectName}
                    </p>
                    <Badge
                      style={{
                        background: 'var(--info-100)',
                        color: 'var(--info-800)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      recorded
                    </Badge>
                    {session.hasMemory && (
                      <Badge
                        style={{
                          background: 'var(--success-100)',
                          color: 'var(--success-800)',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        <Brain className="h-3 w-3 mr-1" />
                        memory
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span
                      className="flex items-center gap-1 text-xs"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <FolderOpen className="h-3 w-3" />
                      {shortPath}
                    </span>
                    <span
                      className="flex items-center gap-1 text-xs"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <Hash className="h-3 w-3" />
                      {session.sessionCount}{' '}
                      {session.sessionCount === 1 ? 'session' : 'sessions'}
                    </span>
                    <span
                      className="flex items-center gap-1 text-xs"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <Clock className="h-3 w-3" />
                      {relTime}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {isOpen ? (
                  <ChevronDown
                    className="h-4 w-4"
                    style={{ color: 'var(--text-muted)' }}
                  />
                ) : (
                  <ChevronRight
                    className="h-4 w-4"
                    style={{ color: 'var(--text-muted)' }}
                  />
                )}
              </div>
            </div>
          </CardContent>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div
            className="px-4 pb-4 pt-0 space-y-3"
            style={{ borderTop: '1px solid var(--border-subtle)' }}
          >
            <div
              className="p-3 rounded-lg space-y-2"
              style={{
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div className="flex items-center gap-2">
                <FileText
                  className="h-4 w-4 shrink-0"
                  style={{ color: 'var(--text-muted)' }}
                />
                <span
                  className="text-xs font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Project Details
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>
                    Full Path:{' '}
                  </span>
                  <span
                    className="font-mono"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {session.projectPath}
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>
                    Directory:{' '}
                  </span>
                  <span
                    className="font-mono"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {session.dirName}
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>
                    Session Files:{' '}
                  </span>
                  <span style={{ color: 'var(--text-primary)' }}>
                    {session.sessionCount} .jsonl{' '}
                    {session.sessionCount === 1 ? 'file' : 'files'}
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>
                    Last Activity:{' '}
                  </span>
                  <span style={{ color: 'var(--text-primary)' }}>
                    {session.modifiedAt
                      ? new Date(session.modifiedAt).toLocaleString()
                      : 'Unknown'}
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>
                    Has Memory:{' '}
                  </span>
                  <span style={{ color: 'var(--text-primary)' }}>
                    {session.hasMemory ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// ---------------------------------------------------------------------------
// Main Sessions page
// ---------------------------------------------------------------------------

export default function Sessions() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('recent');

  const {
    data: rawSessions,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['claude-sessions'],
    queryFn: fetchSessions,
  });

  const sessions = useMemo(() => {
    if (!rawSessions) return [];
    let result = [...rawSessions];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.projectName.toLowerCase().includes(q) ||
          s.projectPath.toLowerCase().includes(q) ||
          s.dirName.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.projectName.localeCompare(b.projectName);
        case 'sessions':
          return b.sessionCount - a.sessionCount || a.projectName.localeCompare(b.projectName);
        case 'recent':
        default:
          return (b.modifiedAt || '').localeCompare(a.modifiedAt || '');
      }
    });

    return result;
  }, [rawSessions, searchQuery, sortBy]);

  function handleRetry() {
    toast.info('Retrying...');
    refetch();
  }

  const cycleSortLabel: Record<SortKey, string> = {
    recent: 'name',
    name: 'sessions',
    sessions: 'recent',
  };

  function cycleSort() {
    setSortBy((prev) => cycleSortLabel[prev] as SortKey);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            Sessions
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Browse Claude Code project sessions from ~/.claude/projects/
            {rawSessions && rawSessions.length > 0 && (
              <Badge
                className="ml-2 align-middle"
                style={{
                  background: 'var(--brand-100)',
                  color: 'var(--brand-800)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                {rawSessions.length} project
                {rawSessions.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          style={{
            borderRadius: 'var(--radius-md)',
            borderColor: 'var(--border-subtle)',
            color: 'var(--text-secondary)',
          }}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Toolbar: search + sort */}
      {!isLoading && !isError && rawSessions && rawSessions.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
              style={{ color: 'var(--text-muted)' }}
            />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-sm"
              style={{
                background: 'var(--bg-elevated)',
                color: 'var(--text-primary)',
                borderColor: 'var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
              }}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={cycleSort}
            style={{
              borderRadius: 'var(--radius-md)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-secondary)',
            }}
          >
            <ArrowUpDown className="h-4 w-4 mr-1" />
            Sort by {sortBy}
          </Button>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <SessionsSkeleton />
      ) : isError ? (
        <ErrorState
          message={
            (error as Error)?.message ||
            'Failed to load sessions. Make sure the backend is running.'
          }
          onRetry={handleRetry}
        />
      ) : sessions.length === 0 && rawSessions && rawSessions.length > 0 ? (
        <Card
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
          }}
        >
          <CardContent className="p-8 text-center">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              No projects match your search.
            </p>
          </CardContent>
        </Card>
      ) : sessions.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <SessionCard key={session.dirName} session={session} />
          ))}
        </div>
      )}
    </div>
  );
}
