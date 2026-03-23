import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Brain,
  Plus,
  Edit,
  Trash2,
  Search,
  ArrowUpDown,
  Save,
  XCircle,
  AlertCircle,
  RefreshCw,
  FileText,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MemoryFile {
  name: string;
  content: string;
  path: string;
}

interface MemoryListResponse {
  data: MemoryFile[];
}

interface ParsedMemory extends MemoryFile {
  frontmatter: {
    name?: string;
    type?: string;
    description?: string;
    [key: string]: unknown;
  };
  body: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseFrontmatter(content: string): { frontmatter: Record<string, unknown>; body: string } {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!match) {
    return { frontmatter: {}, body: content };
  }
  const yamlBlock = match[1];
  const body = match[2];
  const frontmatter: Record<string, unknown> = {};
  for (const line of yamlBlock.split('\n')) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;
    const key = line.slice(0, colonIndex).trim();
    const val = line.slice(colonIndex + 1).trim();
    if (key) frontmatter[key] = val;
  }
  return { frontmatter, body };
}

function parseMemory(file: MemoryFile): ParsedMemory {
  const { frontmatter, body } = parseFrontmatter(file.content);
  return { ...file, frontmatter, body };
}

const typeColors: Record<string, { bg: string; text: string }> = {
  index: { bg: 'var(--info-100)', text: 'var(--info-800)' },
  user: { bg: 'var(--brand-100)', text: 'var(--brand-800)' },
  feedback: { bg: 'var(--warning-100)', text: 'var(--warning-800)' },
  project: { bg: 'var(--success-100)', text: 'var(--success-800)' },
  reference: { bg: 'var(--accent-100)', text: 'var(--accent-800)' },
  other: { bg: 'var(--bg-elevated)', text: 'var(--text-secondary)' },
};

function getTypeColor(type: string | undefined) {
  if (!type) return typeColors.other;
  return typeColors[type.toLowerCase()] ?? typeColors.other;
}

const MEMORY_TYPES = ['index', 'user', 'feedback', 'project', 'reference', 'other'] as const;

type SortKey = 'name' | 'type';

// ---------------------------------------------------------------------------
// Fetcher
// ---------------------------------------------------------------------------

async function fetchMemories(): Promise<MemoryFile[]> {
  const res = await api.get<MemoryListResponse>('/memory');
  return res.data.data ?? [];
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function MemorySkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-xl" style={{ background: 'var(--bg-elevated)' }} />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-36" style={{ background: 'var(--bg-elevated)' }} />
                    <Skeleton className="h-5 w-16 rounded" style={{ background: 'var(--bg-elevated)' }} />
                  </div>
                  <Skeleton className="h-3 w-48" style={{ background: 'var(--bg-elevated)' }} />
                </div>
              </div>
              <Skeleton className="h-8 w-8 rounded" style={{ background: 'var(--bg-elevated)' }} />
            </div>
            <Skeleton className="mt-3 h-16 w-full rounded-lg" style={{ background: 'var(--bg-elevated)' }} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Error state
// ---------------------------------------------------------------------------

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
      <CardContent className="p-8 flex flex-col items-center gap-4">
        <AlertCircle className="h-10 w-10" style={{ color: 'var(--error-500)' }} />
        <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>{message}</p>
        <Button variant="outline" size="sm" onClick={onRetry} style={{ borderRadius: 'var(--radius-md)' }}>
          <RefreshCw className="h-4 w-4 mr-2" />Retry
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
    <Card style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
      <CardContent className="p-12 flex flex-col items-center gap-4">
        <FileText className="h-12 w-12" style={{ color: 'var(--text-muted)' }} />
        <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>No memories found</p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Create your first memory using the button above.</p>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// New Memory dialog
// ---------------------------------------------------------------------------

function NewMemoryDialog() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('project');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');

  const createMutation = useMutation({
    mutationFn: async () => {
      const frontmatter = `---\nname: ${name}\ntype: ${type}\ndescription: ${description}\n---\n`;
      const fullContent = frontmatter + content;
      await api.post('/memory', { name, content: fullContent });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories'] });
      toast.success(`Memory "${name}" created`);
      resetForm();
      setOpen(false);
    },
    onError: () => {
      toast.error('Failed to create memory');
    },
  });

  function resetForm() {
    setName('');
    setType('project');
    setDescription('');
    setContent('');
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger asChild>
        <Button size="sm" style={{ background: 'var(--brand-500)', borderRadius: 'var(--radius-md)' }}>
          <Plus className="h-4 w-4 mr-2" />New Memory
        </Button>
      </DialogTrigger>
      <DialogContent style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
        <DialogHeader>
          <DialogTitle style={{ color: 'var(--text-primary)' }}>Create New Memory</DialogTitle>
          <DialogDescription style={{ color: 'var(--text-muted)' }}>
            Add a new persistent memory file for Claude Code.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label style={{ color: 'var(--text-secondary)' }}>Name</Label>
            <Input
              placeholder="my_memory.md"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-md)' }}
            />
          </div>
          <div className="space-y-2">
            <Label style={{ color: 'var(--text-secondary)' }}>Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-full" style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
                {MEMORY_TYPES.map((t) => (
                  <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label style={{ color: 'var(--text-secondary)' }}>Description</Label>
            <Input
              placeholder="Short description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-md)' }}
            />
          </div>
          <div className="space-y-2">
            <Label style={{ color: 'var(--text-secondary)' }}>Content</Label>
            <Textarea
              placeholder="Memory content..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-md)' }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            style={{ borderRadius: 'var(--radius-md)', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
          >
            Cancel
          </Button>
          <Button
            disabled={!name.trim() || createMutation.isPending}
            onClick={() => createMutation.mutate()}
            style={{ background: 'var(--brand-500)', borderRadius: 'var(--radius-md)' }}
          >
            {createMutation.isPending ? 'Creating...' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Delete confirmation dialog
// ---------------------------------------------------------------------------

function DeleteDialog({ name, onDeleted }: { name: string; onDeleted: () => void }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/memory/${encodeURIComponent(name)}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories'] });
      toast.success(`Memory "${name}" deleted`);
      setOpen(false);
      onDeleted();
    },
    onError: () => {
      toast.error('Failed to delete memory');
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Trash2 className="h-4 w-4" style={{ color: 'var(--error-500)' }} />
        </Button>
      </DialogTrigger>
      <DialogContent style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
        <DialogHeader>
          <DialogTitle style={{ color: 'var(--text-primary)' }}>Delete Memory</DialogTitle>
          <DialogDescription style={{ color: 'var(--text-muted)' }}>
            Are you sure you want to delete <span className="font-mono font-medium">{name}</span>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            style={{ borderRadius: 'var(--radius-md)', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
          >
            Cancel
          </Button>
          <Button
            disabled={deleteMutation.isPending}
            onClick={() => deleteMutation.mutate()}
            style={{ background: 'var(--error-500)', borderRadius: 'var(--radius-md)', color: 'white' }}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Memory card (with inline editing)
// ---------------------------------------------------------------------------

function MemoryCard({ memory }: { memory: ParsedMemory }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(memory.content);

  const updateMutation = useMutation({
    mutationFn: async () => {
      await api.put(`/memory/${encodeURIComponent(memory.name)}`, { content: editContent });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories'] });
      toast.success(`Memory "${memory.name}" updated`);
      setEditing(false);
    },
    onError: () => {
      toast.error('Failed to update memory');
    },
  });

  function startEdit() {
    setEditContent(memory.content);
    setEditing(true);
  }

  function cancelEdit() {
    setEditContent(memory.content);
    setEditing(false);
  }

  const memType = (memory.frontmatter.type as string) || 'other';
  const memDesc = (memory.frontmatter.description as string) || '';
  const colors = getTypeColor(memType);

  return (
    <Card style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0"
              style={{ background: 'var(--info-100)' }}
            >
              <Brain className="h-5 w-5" style={{ color: 'var(--icon-memory, var(--info-800))' }} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium font-mono text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                  {memory.name}
                </p>
                <Badge style={{ background: colors.bg, color: colors.text, borderRadius: 'var(--radius-sm)' }}>
                  {memType}
                </Badge>
              </div>
              {memDesc && (
                <p className="text-xs mt-1 truncate" style={{ color: 'var(--text-muted)' }}>{memDesc}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {!editing && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={startEdit}>
                <Edit className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
              </Button>
            )}
            <DeleteDialog name={memory.name} onDeleted={() => setEditing(false)} />
          </div>
        </div>

        {editing ? (
          <div className="mt-3 space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={10}
              className="font-mono text-xs"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-md)' }}
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={cancelEdit}
                style={{ borderRadius: 'var(--radius-md)', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
              >
                <XCircle className="h-4 w-4 mr-1" />Cancel
              </Button>
              <Button
                size="sm"
                disabled={updateMutation.isPending}
                onClick={() => updateMutation.mutate()}
                style={{ background: 'var(--brand-500)', borderRadius: 'var(--radius-md)' }}
              >
                <Save className="h-4 w-4 mr-1" />{updateMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        ) : (
          <div
            className="mt-3 p-3 rounded-lg font-mono text-xs whitespace-pre-wrap overflow-auto max-h-48"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', borderRadius: 'var(--radius-md)' }}
          >
            {memory.body || memory.content}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main Memory page
// ---------------------------------------------------------------------------

export default function Memory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('name');
  const [filterType, setFilterType] = useState<string>('all');

  const { data: rawMemories, isLoading, isError, refetch } = useQuery({
    queryKey: ['memories'],
    queryFn: fetchMemories,
  });

  const memories = useMemo(() => {
    if (!rawMemories) return [];
    let result = rawMemories.map(parseMemory);

    // Filter by type
    if (filterType !== 'all') {
      result = result.filter((m) => {
        const t = (m.frontmatter.type as string) || 'other';
        return t.toLowerCase() === filterType.toLowerCase();
      });
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          ((m.frontmatter.description as string) || '').toLowerCase().includes(q) ||
          m.body.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'type') {
        const ta = ((a.frontmatter.type as string) || 'other').toLowerCase();
        const tb = ((b.frontmatter.type as string) || 'other').toLowerCase();
        return ta.localeCompare(tb) || a.name.localeCompare(b.name);
      }
      return a.name.localeCompare(b.name);
    });

    return result;
  }, [rawMemories, searchQuery, sortBy, filterType]);

  // Collect all unique types for the filter dropdown
  const allTypes = useMemo(() => {
    if (!rawMemories) return [];
    const types = new Set<string>();
    for (const file of rawMemories) {
      const parsed = parseFrontmatter(file.content);
      const t = (parsed.frontmatter.type as string) || 'other';
      types.add(t.toLowerCase());
    }
    return Array.from(types).sort();
  }, [rawMemories]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Memory</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Manage Claude Code persistent memory
            {rawMemories && rawMemories.length > 0 && (
              <span className="ml-1">({rawMemories.length} file{rawMemories.length !== 1 ? 's' : ''})</span>
            )}
          </p>
        </div>
        <NewMemoryDialog />
      </div>

      {/* Toolbar: search, filter, sort */}
      {!isLoading && !isError && rawMemories && rawMemories.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--text-muted)' }} />
            <Input
              placeholder="Search memories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-sm"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-md)' }}
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
              <SelectItem value="all">All types</SelectItem>
              {allTypes.map((t) => (
                <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortBy((prev) => (prev === 'name' ? 'type' : 'name'))}
            style={{ borderRadius: 'var(--radius-md)', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
          >
            <ArrowUpDown className="h-4 w-4 mr-1" />
            Sort by {sortBy === 'name' ? 'type' : 'name'}
          </Button>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <MemorySkeleton />
      ) : isError ? (
        <ErrorState message="Failed to load memories." onRetry={() => refetch()} />
      ) : memories.length === 0 && rawMemories && rawMemories.length > 0 ? (
        <Card style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
          <CardContent className="p-8 text-center">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No memories match your search or filter.</p>
          </CardContent>
        </Card>
      ) : memories.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {memories.map((memory) => (
            <MemoryCard key={memory.name} memory={memory} />
          ))}
        </div>
      )}
    </div>
  );
}
