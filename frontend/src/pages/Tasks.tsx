import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, CheckCircle2, Circle, Clock } from 'lucide-react';

const tasks = [
  { id: '1', subject: 'Phase 1: SDLC Documentation', status: 'completed', priority: 1 },
  { id: '2', subject: 'Phase 2: Project Scaffolding', status: 'completed', priority: 1 },
  { id: '3', subject: 'Phase 3: Theming Engine', status: 'completed', priority: 1 },
  { id: '4', subject: 'Phase 4: Backend API + Database', status: 'in_progress', priority: 1 },
  { id: '5', subject: 'Phase 5: Frontend Core', status: 'in_progress', priority: 1 },
  { id: '6', subject: 'Phase 6: Feature Pages', status: 'pending', priority: 2 },
  { id: '7', subject: 'Phase 7: Continuation Script', status: 'pending', priority: 2 },
];

const statusConfig: Record<string, { icon: typeof CheckCircle2; color: string; bg: string }> = {
  completed: { icon: CheckCircle2, color: 'var(--success-600)', bg: 'var(--success-100)' },
  in_progress: { icon: Clock, color: 'var(--warning-600)', bg: 'var(--warning-100)' },
  pending: { icon: Circle, color: 'var(--text-muted)', bg: 'var(--shade-15)' },
};

export default function Tasks() {
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Tasks</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Track implementation progress</p>
        </div>
        <Button size="sm" style={{ background: 'var(--brand-500)', borderRadius: 'var(--radius-md)' }}>
          <Plus className="h-4 w-4 mr-2" />New Task
        </Button>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span style={{ color: 'var(--text-muted)' }}>Progress</span>
          <span style={{ color: 'var(--text-primary)' }}>{progressPercent}%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-full)' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${progressPercent}%`, background: 'var(--brand-500)', borderRadius: 'var(--radius-full)' }} />
        </div>
      </div>

      <div className="space-y-2">
        {tasks.map((task) => {
          const config = statusConfig[task.status];
          const Icon = config.icon;
          return (
            <Card key={task.id} style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5" style={{ color: config.color }} />
                  <span className="text-sm" style={{ color: task.status === 'completed' ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>
                    {task.subject}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge style={{ background: config.bg, color: config.color, borderRadius: 'var(--radius-sm)' }}>
                    {task.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
