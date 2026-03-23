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
} from 'lucide-react';
import { useTaskStore } from '@/stores/taskStore';
import type { TaskStatus } from '@/stores/taskStore';

const statusConfig: Record<TaskStatus, { icon: typeof CheckCircle2; color: string; bg: string; label: string }> = {
  completed: { icon: CheckCircle2, color: 'var(--success-600)', bg: 'var(--success-100)', label: 'completed' },
  in_progress: { icon: Clock, color: 'var(--warning-600)', bg: 'var(--warning-100)', label: 'in progress' },
  pending: { icon: Circle, color: 'var(--text-muted)', bg: 'var(--shade-15)', label: 'pending' },
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Tasks</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Track implementation progress &middot; {completedCount}/{tasks.length} completed
          </p>
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
              <Button size="sm" style={{ background: 'var(--brand-500)', borderRadius: 'var(--radius-md)' }}>
                <Plus className="h-4 w-4 mr-2" />New Task
              </Button>
            </DialogTrigger>
            <DialogContent style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}>
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
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div className="space-y-2">
                  <Label style={{ color: 'var(--text-secondary)' }}>Description</Label>
                  <Textarea
                    placeholder="Optional description..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                <Button onClick={handleAdd} style={{ background: 'var(--brand-500)' }}>Add Task</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span style={{ color: 'var(--text-muted)' }}>Progress</span>
          <span style={{ color: 'var(--text-primary)' }}>{progressPercent}%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-full)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%`, background: 'var(--brand-500)', borderRadius: 'var(--radius-full)' }}
          />
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {filteredTasks.length === 0 && (
          <Card style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
            <CardContent className="p-6 text-center">
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
            <Card key={task.id} style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
              <CardContent className="p-3">
                {isEditing ? (
                  <div className="space-y-2">
                    <Input
                      value={editSubject}
                      onChange={(e) => setEditSubject(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEdit(); if (e.key === 'Escape') handleCancelEdit(); }}
                      style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                    />
                    <Textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Description..."
                      style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                    />
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="outline" onClick={handleCancelEdit}>Cancel</Button>
                      <Button size="sm" onClick={handleSaveEdit} style={{ background: 'var(--brand-500)' }}>Save</Button>
                    </div>
                  </div>
                ) : isDeleting ? (
                  <div className="flex items-center justify-between">
                    <p className="text-sm" style={{ color: 'var(--error-500, #ef4444)' }}>
                      Delete &quot;{task.subject}&quot;?
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(task.id)}>Delete</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <button onClick={() => handleCycleStatus(task.id)} className="shrink-0 cursor-pointer hover:scale-110 transition-transform" title="Click to change status">
                        <Icon className="h-5 w-5" style={{ color: config.color }} />
                      </button>
                      <div className="min-w-0 flex-1">
                        <span
                          className="text-sm block truncate"
                          style={{
                            color: task.status === 'completed' ? 'var(--text-muted)' : 'var(--text-primary)',
                            textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                          }}
                        >
                          {task.subject}
                        </span>
                        {task.description && (
                          <span className="text-xs block truncate" style={{ color: 'var(--text-muted)' }}>
                            {task.description}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <Badge style={{ background: config.bg, color: config.color, borderRadius: 'var(--radius-sm)' }}>
                        {config.label}
                      </Badge>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => moveUp(task.id)} title="Move up">
                        <ChevronUp className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => moveDown(task.id)} title="Move down">
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleStartEdit(task)} title="Edit">
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setDeleteConfirmId(task.id)} title="Delete">
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
