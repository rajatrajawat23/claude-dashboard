import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Plus, Edit } from 'lucide-react';

const memories = [
  { name: 'MEMORY.md', type: 'index', description: 'Memory index file', content: '# Memory Index\n\n## Projects\n- project_inforeels.md' },
  { name: 'project_inforeels.md', type: 'project', description: 'InfoReels AI content platform', content: 'Planning phase complete, implementation next' },
];

const typeColors: Record<string, { bg: string; text: string }> = {
  index: { bg: 'var(--info-100)', text: 'var(--info-800)' },
  user: { bg: 'var(--brand-100)', text: 'var(--brand-800)' },
  feedback: { bg: 'var(--warning-100)', text: 'var(--warning-800)' },
  project: { bg: 'var(--success-100)', text: 'var(--success-800)' },
  reference: { bg: 'var(--accent-100)', text: 'var(--accent-800)' },
};

export default function Memory() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Memory</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Manage Claude Code persistent memory</p>
        </div>
        <Button size="sm" style={{ background: 'var(--brand-500)', borderRadius: 'var(--radius-md)' }}>
          <Plus className="h-4 w-4 mr-2" />New Memory
        </Button>
      </div>

      <div className="space-y-3">
        {memories.map((memory) => (
          <Card key={memory.name} style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'var(--info-100)' }}>
                    <Brain className="h-5 w-5" style={{ color: 'var(--icon-memory)' }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium font-mono text-sm" style={{ color: 'var(--text-primary)' }}>{memory.name}</p>
                      <Badge style={{ background: typeColors[memory.type]?.bg || typeColors.project.bg, color: typeColors[memory.type]?.text || typeColors.project.text, borderRadius: 'var(--radius-sm)' }}>
                        {memory.type}
                      </Badge>
                    </div>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{memory.description}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Edit className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                </Button>
              </div>
              <div className="mt-3 p-3 rounded-lg font-mono text-xs" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', borderRadius: 'var(--radius-md)' }}>
                {memory.content}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
