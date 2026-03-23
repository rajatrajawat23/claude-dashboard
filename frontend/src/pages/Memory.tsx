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
  Pencil,
  Trash2,
  Search,
  ArrowUpDown,
  Save,
  XCircle,
  AlertCircle,
  RefreshCw,
  FileText,
  BookOpen,
  Tag,
  FolderTree,
  User,
  Hash,
  Eye,
  ChevronDown,
  Filter,
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

const typeConfig: Record<string, { bg: string; text: string; icon: typeof Brain; iconBg: string }> = {
  user:      { bg: 'var(--brand-100)',   text: 'var(--brand-800)',   icon: User,       iconBg: 'var(--brand-500)' },
  feedback:  { bg: 'var(--warning-100)', text: 'var(--warning-800)', icon: Tag,        iconBg: 'var(--warning-500)' },
  project:   { bg: 'var(--success-100)', text: 'var(--success-800)', icon: FolderTree, iconBg: 'var(--success-500)' },
  reference: { bg: 'var(--info-100)',    text: 'var(--info-800)',    icon: BookOpen,   iconBg: 'var(--info-500)' },
  index:     { bg: 'var(--accent-100)',  text: 'var(--accent-800)',  icon: Hash,       iconBg: 'var(--accent-500)' },
  other:     { bg: 'var(--bg-elevated)', text: 'var(--text-secondary)', icon: FileText, iconBg: 'var(--text-muted)' },
};

function getTypeConfig(type: string | undefined) {
  if (!type) return typeConfig.other;
  return typeConfig[type.toLowerCase()] ?? typeConfig.other;
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
                    <Skeleton className="h-4 w-36" style={{ background: 'var(--bg-elevated)' }} />
                    <Skeleton
                      className="h-5 w-16"
                      style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}
                    />
                  </div>
                  <Skeleton className="h-3 w-48" style={{ background: 'var(--bg-elevated)' }} />
                </div>
              </div>
              <div className="flex gap-1">
                <Skeleton
                  className="h-8 w-8"
                  style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}
                />
                <Skeleton
                  className="h-8 w-8"
                  style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}
                />
              </div>
            </div>
            <Skeleton
              className="mt-4 h-20 w-full"
              style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)' }}
            />
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
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{message}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="transition-all hover:scale-[1.02]"
          style={{ borderRadius: 'var(--radius-md)', borderColor: 'var(--border-subtle)' }}
        >
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
          <Brain className="h-10 w-10" style={{ color: 'var(--brand-400)' }} />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            No memories yet
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Create your first memory using the button above to get started.
          </p>
        </div>
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
        <Button
          size="sm"
          className="transition-all hover:scale-[1.02]"
          style={{
            background: 'var(--brand-500)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <Plus className="h-4 w-4 mr-2" />New Memory
        </Button>
      </DialogTrigger>
      <DialogContent
        style={{
          background: 'var(--bg-card)',
          borderColor: 'var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <div
              className="flex h-7 w-7 items-center justify-center"
              style={{
                background: 'color-mix(in srgb, var(--brand-500) 15%, transparent)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <Plus className="h-4 w-4" style={{ color: 'var(--brand-500)' }} />
            </div>
            Create New Memory
          </DialogTitle>
          <DialogDescription style={{ color: 'var(--text-muted)' }}>
            Add a new persistent memory file for Claude Code.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
              <FileText className="h-3.5 w-3.5" style={{ color: 'var(--text-muted)' }} />
              Name
            </Label>
            <Input
              placeholder="my_memory.md"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                background: 'var(--bg-elevated)',
                color: 'var(--text-primary)',
                borderColor: 'var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
              }}
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
              <Tag className="h-3.5 w-3.5" style={{ color: 'var(--text-muted)' }} />
              Type
            </Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger
                className="w-full"
                style={{
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-primary)',
                  borderColor: 'var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                style={{
                  background: 'var(--bg-card)',
                  borderColor: 'var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                }}
              >
                {MEMORY_TYPES.map((t) => (
                  <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
              <BookOpen className="h-3.5 w-3.5" style={{ color: 'var(--text-muted)' }} />
              Description
            </Label>
            <Input
              placeholder="Short description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                background: 'var(--bg-elevated)',
                color: 'var(--text-primary)',
                borderColor: 'var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
              }}
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
              <Eye className="h-3.5 w-3.5" style={{ color: 'var(--text-muted)' }} />
              Content
            </Label>
            <Textarea
              placeholder="Memory content (supports markdown)..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="font-mono text-sm"
              style={{
                background: 'var(--bg-elevated)',
                color: 'var(--text-primary)',
                borderColor: 'var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="transition-all hover:scale-[1.01]"
            style={{
              borderRadius: 'var(--radius-lg)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-secondary)',
            }}
          >
            Cancel
          </Button>
          <Button
            disabled={!name.trim() || createMutation.isPending}
            onClick={() => createMutation.mutate()}
            className="transition-all hover:scale-[1.01]"
            style={{ background: 'var(--brand-500)', borderRadius: 'var(--radius-lg)' }}
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
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 transition-all"
          style={{ borderRadius: 'var(--radius-md)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'color-mix(in srgb, var(--error-500) 12%, transparent)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <Trash2 className="h-4 w-4" style={{ color: 'var(--error-500)' }} />
        </Button>
      </DialogTrigger>
      <DialogContent
        style={{
          background: 'var(--bg-card)',
          borderColor: 'var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <div
              className="flex h-7 w-7 items-center justify-center"
              style={{
                background: 'color-mix(in srgb, var(--error-500) 15%, transparent)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <Trash2 className="h-4 w-4" style={{ color: 'var(--error-500)' }} />
            </div>
            Delete Memory
          </DialogTitle>
          <DialogDescription style={{ color: 'var(--text-muted)' }}>
            Are you sure you want to delete <span className="font-mono font-medium">{name}</span>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="transition-all hover:scale-[1.01]"
            style={{
              borderRadius: 'var(--radius-lg)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-secondary)',
            }}
          >
            Cancel
          </Button>
          <Button
            disabled={deleteMutation.isPending}
            onClick={() => deleteMutation.mutate()}
            className="transition-all hover:scale-[1.01]"
            style={{ background: 'var(--error-500)', borderRadius: 'var(--radius-lg)', color: 'white' }}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Memory card (with inline editing + expandable content)
// ---------------------------------------------------------------------------

function MemoryCard({ memory }: { memory: ParsedMemory }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [expanded, setExpanded] = useState(false);
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
  const config = getTypeConfig(memType);
  const TypeIcon = config.icon;
  const contentText = memory.body || memory.content;
  const isLong = contentText.split('\n').length > 6 || contentText.length > 400;

  return (
    <Card
      className="transition-all hover:scale-[1.005] group"
      style={{
        background: 'var(--bg-card)',
        borderColor: 'var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
      }}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="flex h-11 w-11 items-center justify-center shrink-0"
              style={{
                background: `color-mix(in srgb, ${config.iconBg} 15%, transparent)`,
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <TypeIcon className="h-5 w-5" style={{ color: config.iconBg }} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p
                  className="font-medium font-mono text-sm truncate"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {memory.name}
                </p>
                <Badge
                  className="text-[11px] font-medium"
                  style={{
                    background: config.bg,
                    color: config.text,
                    borderRadius: 'var(--radius-md)',
                    padding: '1px 8px',
                  }}
                >
                  {memType}
                </Badge>
              </div>
              {memDesc && (
                <p className="text-xs mt-1 truncate" style={{ color: 'var(--text-muted)' }}>
                  {memDesc}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {!editing && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 transition-all"
                onClick={startEdit}
                style={{ borderRadius: 'var(--radius-md)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'color-mix(in srgb, var(--brand-500) 12%, transparent)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <Pencil className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
              </Button>
            )}
            <DeleteDialog name={memory.name} onDeleted={() => setEditing(false)} />
          </div>
        </div>

        {editing ? (
          <div className="mt-4 space-y-3">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={10}
              className="font-mono text-xs"
              style={{
                background: 'var(--bg-elevated)',
                color: 'var(--text-primary)',
                borderColor: 'var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
              }}
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={cancelEdit}
                className="transition-all hover:scale-[1.01]"
                style={{
                  borderRadius: 'var(--radius-lg)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-secondary)',
                }}
              >
                <XCircle className="h-4 w-4 mr-1" />Cancel
              </Button>
              <Button
                size="sm"
                disabled={updateMutation.isPending}
                onClick={() => updateMutation.mutate()}
                className="transition-all hover:scale-[1.01]"
                style={{ background: 'var(--brand-500)', borderRadius: 'var(--radius-lg)' }}
              >
                <Save className="h-4 w-4 mr-1" />
                {updateMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            {/* Markdown-feel content preview */}
            <div
              className="relative overflow-hidden"
              style={{
                maxHeight: expanded || !isLong ? 'none' : '120px',
                transition: 'max-height 0.3s ease',
              }}
            >
              <div
                className="p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap"
                style={{
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-secondary)',
                  borderRadius: 'var(--radius-lg)',
                  borderLeft: `3px solid ${config.iconBg}`,
                }}
              >
                {contentText}
              </div>
              {/* Fade overlay when collapsed */}
              {isLong && !expanded && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none"
                  style={{
                    background: 'linear-gradient(transparent, var(--bg-card))',
                  }}
                />
              )}
            </div>
            {isLong && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="mt-2 flex items-center gap-1 text-xs font-medium transition-colors"
                style={{ color: 'var(--brand-500)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <ChevronDown
                  className="h-3.5 w-3.5 transition-transform"
                  style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
                {expanded ? 'Show less' : 'Show more'}
              </button>
            )}
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
          <h1
            className="text-2xl font-bold"
            style={{
              background: 'linear-gradient(135deg, var(--brand-500), var(--accent-500))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Memory
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Manage Claude Code persistent memory
            {rawMemories && rawMemories.length > 0 && (
              <Badge
                className="ml-2 align-middle text-[11px]"
                style={{
                  background: 'color-mix(in srgb, var(--brand-500) 12%, transparent)',
                  color: 'var(--brand-600)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                {rawMemories.length} file{rawMemories.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </p>
        </div>
        <NewMemoryDialog />
      </div>

      {/* Toolbar: search, filter, sort */}
      {!isLoading && !isError && rawMemories && rawMemories.length > 0 && (
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
                placeholder="Search memories..."
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
            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5" style={{ color: 'var(--text-muted)' }} />
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger
                  style={{
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-primary)',
                    borderColor: 'var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)',
                  }}
                >
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent
                  style={{
                    background: 'var(--bg-card)',
                    borderColor: 'var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)',
                  }}
                >
                  <SelectItem value="all">All types</SelectItem>
                  {allTypes.map((t) => (
                    <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortBy((prev) => (prev === 'name' ? 'type' : 'name'))}
              className="transition-all hover:scale-[1.02]"
              style={{
                borderRadius: 'var(--radius-lg)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-secondary)',
              }}
            >
              <ArrowUpDown className="h-4 w-4 mr-1" />
              Sort by {sortBy === 'name' ? 'type' : 'name'}
            </Button>
          </div>
        </Card>
      )}

      {/* Content */}
      {isLoading ? (
        <MemorySkeleton />
      ) : isError ? (
        <ErrorState message="Failed to load memories." onRetry={() => refetch()} />
      ) : memories.length === 0 && rawMemories && rawMemories.length > 0 ? (
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
              No memories match your search or filter.
            </p>
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
