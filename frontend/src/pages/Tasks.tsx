import { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  Trash2,
  ChevronUp,
  ChevronDown,
  Pencil,
  ListTodo,
  Target,
  GripVertical,
  Sparkles,
} from 'lucide-react';
import { useTaskStore } from '@/stores/taskStore';
import type { TaskStatus } from '@/stores/taskStore';

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
// Status config
// ---------------------------------------------------------------------------

const statusConfig: Record<TaskStatus, { icon: typeof CheckCircle2; color: string; bg: string; label: string; borderColor: string }> = {
  completed: { icon: CheckCircle2, color: 'var(--success-600)', bg: 'color-mix(in srgb, var(--success-500) 12%, transparent)', label: 'completed', borderColor: 'var(--success-500)' },
  in_progress: { icon: Clock, color: 'var(--warning-600)', bg: 'color-mix(in srgb, var(--warning-500) 12%, transparent)', label: 'in progress', borderColor: 'var(--warning-500)' },
  pending: { icon: Circle, color: 'var(--text-muted)', bg: 'var(--shade-15)', label: 'pending', borderColor: 'var(--text-muted)' },
};

const FILTER_OPTIONS = [
  { value: 'all', label: 'All Tasks' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
] as const;

export default function Tasks() {
  const { tasks, addTask, updateTask, deleteTask, cycleStatus, moveUp, moveDown } = useTaskStore();
  const [filter, setFilter] = useState<string>('all');
  const [addOpen, setAddOpen] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSubject, setEditSubject] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const sortedTasks = [...tasks].sort((a, b) => a.order - b.order);
  const filteredTasks = filter === 'all' ? sortedTasks : sortedTasks.filter(t => t.status === filter);
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;
  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const handleAdd = () => {
    if (!newSubject.trim()) {
      toast.error('Subject is required');
      return;
    }
    addTask(newSubject.trim(), newDescription.trim());
    setNewSubject('');
    setNewDescription('');
    setAddOpen(false);
    toast.success('Task added');
  };

  const handleStartEdit = (task: { id: string; subject: string; description: string }) => {
    setEditingId(task.id);
    setEditSubject(task.subject);
    setEditDescription(task.description);
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    if (!editSubject.trim()) {
      toast.error('Subject is required');
      return;
    }
    updateTask(editingId, { subject: editSubject.trim(), description: editDescription.trim() });
    setEditingId(null);
    toast.success('Task updated');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleCycleStatus = (id: string) => {
    cycleStatus(id);
    const task = tasks.find(t => t.id === id);
    if (task) {
      const nextMap: Record<TaskStatus, TaskStatus> = { pending: 'in_progress', in_progress: 'completed', completed: 'pending' };
      toast.success(`Status changed to ${nextMap[task.status].replace('_', ' ')}`);
    }
  };

  const handleDelete = (id: string) => {
    deleteTask(id);
    setDeleteConfirmId(null);
    toast.success('Task deleted');
  };

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
            <ListTodo className="h-5 w-5" style={{ color: 'var(--brand-500)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={gradientTextStyle}>Tasks</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Track implementation progress &middot; {completedCount}/{tasks.length} completed
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FILTER_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="transition-all hover:scale-[1.05]" style={{ background: 'var(--brand-500)', borderRadius: 'var(--radius-md)' }}>
                <Plus className="h-4 w-4 mr-2" />New Task
              </Button>
            </DialogTrigger>
            <DialogContent style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
              <DialogHeader>
                <DialogTitle style={{ color: 'var(--text-primary)' }}>Add New Task</DialogTitle>
                <DialogDescription style={{ color: 'var(--text-muted)' }}>
                  Create a new task to track your progress.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label style={{ color: 'var(--text-secondary)' }}>Subject</Label>
                  <Input
                    placeholder="Task subject..."
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)', borderRadius: 'var(--radius-md)' }}
                  />
                </div>
                <div className="space-y-2">
                  <Label style={{ color: 'var(--text-secondary)' }}>Description</Label>
                  <Textarea
                    placeholder="Optional description..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)', borderRadius: 'var(--radius-md)' }}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddOpen(false)} style={{ borderRadius: 'var(--radius-md)' }}>Cancel</Button>
                <Button onClick={handleAdd} style={{ background: 'var(--brand-500)', borderRadius: 'var(--radius-md)' }}>Add Task</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Status summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="card-premium transition-all hover:scale-[1.02]" style={{ borderRadius: 'var(--radius-xl)', borderLeft: '3px solid var(--text-muted)' }}>
          <CardContent className="p-3 flex items-center gap-3">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center"
              style={{ background: 'color-mix(in srgb, var(--text-muted) 12%, transparent)', borderRadius: 'var(--radius-lg)' }}
            >
              <Circle className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Pending</p>
              <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{pendingCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-premium transition-all hover:scale-[1.02]" style={{ borderRadius: 'var(--radius-xl)', borderLeft: '3px solid var(--warning-500)' }}>
          <CardContent className="p-3 flex items-center gap-3">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center"
              style={{ background: 'color-mix(in srgb, var(--warning-500) 12%, transparent)', borderRadius: 'var(--radius-lg)' }}
            >
              <Clock className="h-4 w-4" style={{ color: 'var(--warning-600)' }} />
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>In Progress</p>
              <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{inProgressCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-premium transition-all hover:scale-[1.02]" style={{ borderRadius: 'var(--radius-xl)', borderLeft: '3px solid var(--success-500)' }}>
          <CardContent className="p-3 flex items-center gap-3">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center"
              style={{ background: 'color-mix(in srgb, var(--success-500) 12%, transparent)', borderRadius: 'var(--radius-lg)' }}
            >
              <CheckCircle2 className="h-4 w-4" style={{ color: 'var(--success-600)' }} />
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Completed</p>
              <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{completedCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress bar with gradient fill and glow */}
      <Card className="card-premium" style={{ borderRadius: 'var(--radius-xl)' }}>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4" style={{ color: 'var(--brand-500)' }} />
              <span style={{ color: 'var(--text-muted)' }}>Overall Progress</span>
            </div>
            <span className="font-bold text-lg" style={gradientTextStyle}>{progressPercent}%</span>
          </div>
          <div
            className="h-3 rounded-full overflow-hidden"
            style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-full)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${progressPercent}%`,
                background: 'linear-gradient(90deg, var(--brand-500), var(--accent-500))',
                borderRadius: 'var(--radius-full)',
                boxShadow: '0 0 12px color-mix(in srgb, var(--brand-500) 40%, transparent)',
              }}
            />
          </div>
          <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: 'var(--text-muted)' }} />
              {pendingCount} pending
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: 'var(--warning-500)' }} />
              {inProgressCount} active
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: 'var(--success-500)' }} />
              {completedCount} done
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Task List */}
      <div className="space-y-2">
        {filteredTasks.length === 0 && (
          <Card className="card-premium" style={{ borderRadius: 'var(--radius-xl)' }}>
            <CardContent className="p-8 text-center">
              <div
                className="flex h-14 w-14 items-center justify-center mx-auto mb-3 animate-float"
                style={{ background: 'color-mix(in srgb, var(--brand-500) 12%, transparent)', borderRadius: 'var(--radius-lg)' }}
              >
                <Sparkles className="h-7 w-7" style={{ color: 'var(--brand-500)' }} />
              </div>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {filter === 'all' ? 'No tasks yet. Add one above!' : `No ${filter.replace('_', ' ')} tasks`}
              </p>
            </CardContent>
          </Card>
        )}

        {filteredTasks.map((task) => {
          const config = statusConfig[task.status];
          const Icon = config.icon;
          const isEditing = editingId === task.id;
          const isDeleting = deleteConfirmId === task.id;

          return (
            <Card
              key={task.id}
              className="card-premium transition-all hover:scale-[1.01]"
              style={{
                borderRadius: 'var(--radius-xl)',
                borderLeft: `3px solid ${config.borderColor}`,
              }}
            >
              <CardContent className="p-3">
                {isEditing ? (
                  <div className="space-y-2">
                    <Input
                      value={editSubject}
                      onChange={(e) => setEditSubject(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEdit(); if (e.key === 'Escape') handleCancelEdit(); }}
                      style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)', borderRadius: 'var(--radius-md)' }}
                    />
                    <Textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Description..."
                      style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)', borderRadius: 'var(--radius-md)' }}
                    />
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="outline" onClick={handleCancelEdit} style={{ borderRadius: 'var(--radius-md)' }}>Cancel</Button>
                      <Button size="sm" onClick={handleSaveEdit} style={{ background: 'var(--brand-500)', borderRadius: 'var(--radius-md)' }}>Save</Button>
                    </div>
                  </div>
                ) : isDeleting ? (
                  <div className="flex items-center justify-between">
                    <p className="text-sm" style={{ color: 'var(--error-500, #ef4444)' }}>
                      Delete &quot;{task.subject}&quot;?
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setDeleteConfirmId(null)} style={{ borderRadius: 'var(--radius-md)' }}>Cancel</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(task.id)} style={{ borderRadius: 'var(--radius-md)' }}>Delete</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Drag handle visual cue */}
                      <GripVertical className="h-4 w-4 shrink-0 opacity-30" style={{ color: 'var(--text-muted)' }} />

                      {/* Status icon with pulse for in_progress */}
                      <button
                        onClick={() => handleCycleStatus(task.id)}
                        className="shrink-0 cursor-pointer hover:scale-125 transition-all"
                        title="Click to change status"
                      >
                        <div className="relative">
                          <Icon className="h-5 w-5" style={{ color: config.color }} />
                          {task.status === 'in_progress' && (
                            <span
                              className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full animate-glow"
                              style={{ background: 'var(--warning-500)' }}
                            />
                          )}
                        </div>
                      </button>

                      <div className="min-w-0 flex-1">
                        <span
                          className="text-sm block truncate font-medium"
                          style={{
                            color: task.status === 'completed' ? 'var(--text-muted)' : 'var(--text-primary)',
                            textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                          }}
                        >
                          {task.subject}
                        </span>
                        {task.description && (
                          <span className="text-xs block truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            {task.description}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <Badge style={{ background: config.bg, color: config.color, borderRadius: 'var(--radius-md)' }}>
                        <span
                          className="inline-block h-1.5 w-1.5 rounded-full mr-1"
                          style={{
                            background: config.color,
                            boxShadow: task.status === 'in_progress' ? `0 0 6px ${config.color}` : 'none',
                          }}
                        />
                        {config.label}
                      </Badge>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 transition-all hover:scale-110" onClick={() => moveUp(task.id)} title="Move up">
                        <ChevronUp className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 transition-all hover:scale-110" onClick={() => moveDown(task.id)} title="Move down">
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 transition-all hover:scale-110" onClick={() => handleStartEdit(task)} title="Edit">
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 transition-all hover:scale-110" onClick={() => setDeleteConfirmId(task.id)} title="Delete">
                        <Trash2 className="h-3 w-3" style={{ color: 'var(--error-500, #ef4444)' }} />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
