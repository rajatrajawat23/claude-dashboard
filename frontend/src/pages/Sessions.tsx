import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Clock, Hash, ChevronRight, FolderOpen } from 'lucide-react';

const sessions = [
  { id: '1', project: 'claude-dashboard', status: 'active', messages: 45, tokens: 12500, startedAt: '10 min ago', path: '/Users/rajatrajawatpmac/claude-dashboard' },
  { id: '2', project: 'hims-v3-gmch', status: 'completed', messages: 120, tokens: 35000, startedAt: '2 hours ago', path: '/Users/rajatrajawatpmac/Desktop/hims-v3-all/hims-v3-gmch' },
  { id: '3', project: 'N-Accuri', status: 'completed', messages: 89, tokens: 28000, startedAt: '5 hours ago', path: '/Users/rajatrajawatpmac/Desktop/N-Accuri' },
  { id: '4', project: 'ai-content-platform', status: 'paused', messages: 30, tokens: 8500, startedAt: '1 day ago', path: '/Users/rajatrajawatpmac/ai-content-platform' },
  { id: '5', project: 'pdf-pipeline', status: 'archived', messages: 15, tokens: 4200, startedAt: '3 days ago', path: '/Users/rajatrajawatpmac/Desktop/Projects/pdf-pipeline' },
];

const statusColors: Record<string, { bg: string; text: string }> = {
  active: { bg: 'var(--success-100)', text: 'var(--success-800)' },
  completed: { bg: 'var(--info-100)', text: 'var(--info-800)' },
  paused: { bg: 'var(--warning-100)', text: 'var(--warning-800)' },
  archived: { bg: 'var(--shade-15)', text: 'var(--text-muted)' },
};

export default function Sessions() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Sessions</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Browse Claude Code sessions and chat history</p>
      </div>

      <div className="flex gap-3">
        {['all', 'active', 'completed', 'paused', 'archived'].map((filter) => (
          <button key={filter} className="px-3 py-1.5 text-sm capitalize rounded-md" style={{ background: filter === 'all' ? 'var(--brand-500)' : 'var(--bg-card)', color: filter === 'all' ? 'white' : 'var(--text-secondary)', borderRadius: 'var(--radius-md)' }}>
            {filter}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {sessions.map((session) => (
          <Card key={session.id} className="cursor-pointer transition-all hover:scale-[1.005]" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'var(--brand-100)' }}>
                    <MessageSquare className="h-5 w-5" style={{ color: 'var(--brand-600)' }} />
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{session.project}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <FolderOpen className="h-3 w-3" />{session.path.split('/').slice(-2).join('/')}
                      </span>
                      <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <Hash className="h-3 w-3" />{session.messages} messages
                      </span>
                      <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <Clock className="h-3 w-3" />{session.startedAt}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge style={{ background: statusColors[session.status].bg, color: statusColors[session.status].text, borderRadius: 'var(--radius-sm)' }}>
                    {session.status}
                  </Badge>
                  <ChevronRight className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
