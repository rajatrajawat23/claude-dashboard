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
  FolderTree,
  Calendar,
  Eye,
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

// Status-based gradient borders
function getStatusGradient(session: ProjectSession): string {
  const now = new Date();
  const modified = new Date(session.modifiedAt);
  const hoursAgo = (now.getTime() - modified.getTime()) / 3600000;
  if (hoursAgo < 1) return 'linear-gradient(to bottom, var(--success-400), var(--success-600))';
  if (hoursAgo < 24) return 'linear-gradient(to bottom, var(--brand-400), var(--brand-600))';
  if (hoursAgo < 168) return 'linear-gradient(to bottom, var(--info-400), var(--info-600))';
  return 'linear-gradient(to bottom, var(--text-muted), var(--border-default))';
}

function isRecentlyActive(session: ProjectSession): boolean {
  if (!session.modifiedAt) return false;
  const now = new Date();
  const modified = new Date(session.modifiedAt);
  return (now.getTime() - modified.getTime()) < 3600000; // less than 1 hour
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
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton
                  className="h-11 w-11"
                  style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)' }}
                />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton
                      className="h-4 w-40"
                      style={{ background: 'var(--bg-elevated)' }}
                    />
                    <Skeleton
                      className="h-5 w-16"
                      style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}
                    />
                  </div>
                  <Skeleton
                    className="h-3 w-56"
                    style={{ background: 'var(--bg-elevated)' }}
                  />
                </div>
              </div>
              <Skeleton
                className="h-6 w-6"
                style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}
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
      <CardContent className="p-10 flex flex-col items-center gap-5">
        <div
          className="flex h-16 w-16 items-center justify-center"
          style={{
            background: 'color-mix(in srgb, var(--error-500) 12%, transparent)',
            borderRadius: 'var(--radius-xl)',
          }}
        >
          <AlertCircle className="h-8 w-8" style={{ color: 'var(--error-500)' }} />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            Something went wrong
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {message}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="transition-all hover:scale-[1.02]"
          style={{ borderRadius: 'var(--radius-lg)' }}
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
      <CardContent className="p-16 flex flex-col items-center gap-5">
        <div
          className="flex h-20 w-20 items-center justify-center"
          style={{
            background: 'color-mix(in srgb, var(--brand-500) 10%, transparent)',
            borderRadius: 'var(--radius-2xl)',
          }}
        >
          <MessageSquare className="h-10 w-10" style={{ color: 'var(--brand-400)' }} />
        </div>
        <div className="text-center space-y-1">
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
        </div>
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
  const gradient = getStatusGradient(session);
  const active = isRecentlyActive(session);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card
        className="transition-all hover:scale-[1.005] overflow-hidden"
        style={{
          background: 'var(--bg-card)',
          borderColor: isOpen ? 'var(--brand-300)' : 'var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
        }}
      >
        {/* Gradient left border */}
        <div className="flex">
          <div
            className="w-1 shrink-0"
            style={{
              background: gradient,
              borderRadius: 'var(--radius-xl) 0 0 var(--radius-xl)',
            }}
          />
          <div className="flex-1 min-w-0">
            <CollapsibleTrigger asChild>
              <CardContent className="p-5 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="flex h-11 w-11 items-center justify-center shrink-0 relative"
                      style={{
                        background: 'color-mix(in srgb, var(--brand-500) 12%, transparent)',
                        borderRadius: 'var(--radius-lg)',
                      }}
                    >
                      <MessageSquare
                        className="h-5 w-5"
                        style={{ color: 'var(--brand-500)' }}
                      />
                      {/* Active pulse dot */}
                      {active && (
                        <div
                          className="absolute -top-0.5 -right-0.5 h-3 w-3"
                          style={{
                            background: 'var(--success-500)',
                            borderRadius: 'var(--radius-full)',
                            boxShadow: '0 0 0 2px var(--bg-card)',
                          }}
                        >
                          <div
                            className="absolute inset-0 animate-ping"
                            style={{
                              background: 'var(--success-400)',
                              borderRadius: 'var(--radius-full)',
                              opacity: 0.6,
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p
                          className="font-medium text-sm truncate"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {session.projectName}
                        </p>
                        {/* Session count badge */}
                        <Badge
                          className="text-[11px] font-medium"
                          style={{
                            background: 'color-mix(in srgb, var(--info-500) 12%, transparent)',
                            color: 'var(--info-700)',
                            borderRadius: 'var(--radius-md)',
                            padding: '1px 8px',
                          }}
                        >
                          <Hash className="h-3 w-3 mr-1" />
                          {session.sessionCount} {session.sessionCount === 1 ? 'session' : 'sessions'}
                        </Badge>
                        {/* Memory indicator */}
                        {session.hasMemory && (
                          <Badge
                            className="text-[11px] font-medium"
                            style={{
                              background: 'color-mix(in srgb, var(--success-500) 12%, transparent)',
                              color: 'var(--success-700)',
                              borderRadius: 'var(--radius-md)',
                              padding: '1px 8px',
                            }}
                          >
                            <Brain className="h-3 w-3 mr-1" />
                            memory
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <span
                          className="flex items-center gap-1 text-xs"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          <FolderOpen className="h-3 w-3" />
                          {shortPath}
                        </span>
                        <span
                          className="flex items-center gap-1 text-xs"
                          style={{ color: active ? 'var(--success-600)' : 'var(--text-muted)' }}
                        >
                          <Clock className="h-3 w-3" />
                          {relTime}
                          {active && (
                            <span
                              className="ml-0.5 text-[10px] font-medium px-1.5 py-0.5"
                              style={{
                                background: 'color-mix(in srgb, var(--success-500) 12%, transparent)',
                                color: 'var(--success-600)',
                                borderRadius: 'var(--radius-sm)',
                              }}
                            >
                              active
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div
                      className="flex h-7 w-7 items-center justify-center transition-all"
                      style={{
                        background: isOpen
                          ? 'color-mix(in srgb, var(--brand-500) 10%, transparent)'
                          : 'transparent',
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      {isOpen ? (
                        <ChevronDown
                          className="h-4 w-4"
                          style={{ color: isOpen ? 'var(--brand-500)' : 'var(--text-muted)' }}
                        />
                      ) : (
                        <ChevronRight
                          className="h-4 w-4"
                          style={{ color: 'var(--text-muted)' }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <div
                className="px-5 pb-5 pt-0"
                style={{
                  borderTop: '1px solid var(--border-subtle)',
                }}
              >
                <div
                  className="mt-4 p-4 space-y-3"
                  style={{
                    background: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-lg)',
                  }}
                >
                  {/* Section header */}
                  <div className="flex items-center gap-2">
                    <div
                      className="flex h-6 w-6 items-center justify-center"
                      style={{
                        background: 'color-mix(in srgb, var(--info-500) 12%, transparent)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      <Eye
                        className="h-3.5 w-3.5"
                        style={{ color: 'var(--info-500)' }}
                      />
                    </div>
                    <span
                      className="text-xs font-semibold"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Project Details
                    </span>
                  </div>

                  {/* Detail rows */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div
                      className="flex items-start gap-2 p-2.5"
                      style={{
                        background: 'color-mix(in srgb, var(--bg-primary) 50%, transparent)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      <FolderTree
                        className="h-3.5 w-3.5 mt-0.5 shrink-0"
                        style={{ color: 'var(--text-muted)' }}
                      />
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Full Path</span>
                        <p
                          className="font-mono mt-0.5"
                          style={{ color: 'var(--text-primary)', wordBreak: 'break-all' }}
                        >
                          {session.projectPath}
                        </p>
                      </div>
                    </div>
                    <div
                      className="flex items-start gap-2 p-2.5"
                      style={{
                        background: 'color-mix(in srgb, var(--bg-primary) 50%, transparent)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      <FolderOpen
                        className="h-3.5 w-3.5 mt-0.5 shrink-0"
                        style={{ color: 'var(--text-muted)' }}
                      />
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Directory</span>
                        <p
                          className="font-mono mt-0.5"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {session.dirName}
                        </p>
                      </div>
                    </div>
                    <div
                      className="flex items-start gap-2 p-2.5"
                      style={{
                        background: 'color-mix(in srgb, var(--bg-primary) 50%, transparent)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      <FileText
                        className="h-3.5 w-3.5 mt-0.5 shrink-0"
                        style={{ color: 'var(--text-muted)' }}
                      />
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Session Files</span>
                        <p style={{ color: 'var(--text-primary)' }}>
                          {session.sessionCount} .jsonl{' '}
                          {session.sessionCount === 1 ? 'file' : 'files'}
                        </p>
                      </div>
                    </div>
                    <div
                      className="flex items-start gap-2 p-2.5"
                      style={{
                        background: 'color-mix(in srgb, var(--bg-primary) 50%, transparent)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      <Calendar
                        className="h-3.5 w-3.5 mt-0.5 shrink-0"
                        style={{ color: 'var(--text-muted)' }}
                      />
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Last Activity</span>
                        <p style={{ color: 'var(--text-primary)' }}>
                          {session.modifiedAt
                            ? new Date(session.modifiedAt).toLocaleString()
                            : 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <div
                      className="flex items-start gap-2 p-2.5"
                      style={{
                        background: 'color-mix(in srgb, var(--bg-primary) 50%, transparent)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      <Brain
                        className="h-3.5 w-3.5 mt-0.5 shrink-0"
                        style={{
                          color: session.hasMemory ? 'var(--success-500)' : 'var(--text-muted)',
                        }}
                      />
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Has Memory</span>
                        <p style={{ color: 'var(--text-primary)' }}>
                          {session.hasMemory ? (
                            <span style={{ color: 'var(--success-600)' }}>Yes</span>
                          ) : (
                            'No'
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </div>
        </div>
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

  // Stats
  const totalSessions = rawSessions
    ? rawSessions.reduce((sum, s) => sum + s.sessionCount, 0)
    : 0;
  const withMemory = rawSessions
    ? rawSessions.filter((s) => s.hasMemory).length
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{
              background: 'linear-gradient(135deg, var(--brand-500), var(--info-500))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Sessions
          </h1>
          <p className="text-sm mt-1 flex items-center gap-2 flex-wrap" style={{ color: 'var(--text-muted)' }}>
            Browse Claude Code project sessions
            {rawSessions && rawSessions.length > 0 && (
              <>
                <Badge
                  className="text-[11px] font-medium"
                  style={{
                    background: 'color-mix(in srgb, var(--brand-500) 12%, transparent)',
                    color: 'var(--brand-600)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1px 8px',
                  }}
                >
                  {rawSessions.length} project{rawSessions.length !== 1 ? 's' : ''}
                </Badge>
                <Badge
                  className="text-[11px] font-medium"
                  style={{
                    background: 'color-mix(in srgb, var(--info-500) 12%, transparent)',
                    color: 'var(--info-600)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1px 8px',
                  }}
                >
                  {totalSessions} total session{totalSessions !== 1 ? 's' : ''}
                </Badge>
                {withMemory > 0 && (
                  <Badge
                    className="text-[11px] font-medium"
                    style={{
                      background: 'color-mix(in srgb, var(--success-500) 12%, transparent)',
                      color: 'var(--success-600)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1px 8px',
                    }}
                  >
                    <Brain className="h-3 w-3 mr-1" />
                    {withMemory} with memory
                  </Badge>
                )}
              </>
            )}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="transition-all hover:scale-[1.02]"
          style={{
            borderRadius: 'var(--radius-lg)',
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
        <Card
          className="p-3"
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            backdropFilter: 'blur(8px)',
          }}
        >
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
                  borderRadius: 'var(--radius-lg)',
                }}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={cycleSort}
              className="transition-all hover:scale-[1.02]"
              style={{
                borderRadius: 'var(--radius-lg)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-secondary)',
              }}
            >
              <ArrowUpDown className="h-4 w-4 mr-1" />
              Sort by {sortBy}
            </Button>
          </div>
        </Card>
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
          <CardContent className="p-10 flex flex-col items-center gap-4">
            <div
              className="flex h-14 w-14 items-center justify-center"
              style={{
                background: 'color-mix(in srgb, var(--text-muted) 10%, transparent)',
                borderRadius: 'var(--radius-xl)',
              }}
            >
              <Search className="h-7 w-7" style={{ color: 'var(--text-muted)' }} />
            </div>
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
