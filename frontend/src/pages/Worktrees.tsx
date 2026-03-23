import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GitFork, Plus, FolderOpen } from 'lucide-react';

const worktrees = [
  { path: '/Users/rajatrajawatpmac/claude-dashboard', branch: 'master', isMain: true, status: 'active' },
];

export default function Worktrees() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Worktrees</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Manage git worktrees for parallel development</p>
        </div>
        <Button size="sm" style={{ background: 'var(--brand-500)', borderRadius: 'var(--radius-md)' }}>
          <Plus className="h-4 w-4 mr-2" />New Worktree
        </Button>
      </div>

      <div className="space-y-3">
        {worktrees.map((wt) => (
          <Card key={wt.path} style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'var(--accent-100)' }}>
                    <GitFork className="h-5 w-5" style={{ color: 'var(--accent-600)' }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{wt.branch}</p>
                      {wt.isMain && <Badge style={{ background: 'var(--brand-100)', color: 'var(--brand-700)', borderRadius: 'var(--radius-sm)' }}>main</Badge>}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <FolderOpen className="h-3 w-3" style={{ color: 'var(--text-muted)' }} />
                      <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{wt.path}</span>
                    </div>
                  </div>
                </div>
                <Badge style={{ background: wt.status === 'active' ? 'var(--success-100)' : 'var(--shade-15)', color: wt.status === 'active' ? 'var(--success-800)' : 'var(--text-muted)', borderRadius: 'var(--radius-sm)' }}>
                  {wt.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
