import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GitBranch, GitCommit, FileCode } from 'lucide-react';

const branches = [
  { name: 'master', current: true, commit: 'ef0640f' },
];

const commits = [
  { hash: 'd8b310e', message: 'feat: complete theming engine', author: 'Claude', date: 'just now' },
  { hash: 'ef0640f', message: 'feat: scaffold frontend, backend, and infrastructure', author: 'Claude', date: '10 min ago' },
  { hash: 'cc6c009', message: 'docs: add SDLC documentation', author: 'Claude', date: '20 min ago' },
];

const changes = [
  { status: 'M', file: 'frontend/src/index.css', color: 'var(--warning-500)' },
  { status: 'A', file: 'frontend/src/theme/colors.ts', color: 'var(--success-500)' },
  { status: 'A', file: 'backend/internal/handlers/git.go', color: 'var(--success-500)' },
];

export default function Git() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Git</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Repository and version control</p>
      </div>

      <Tabs defaultValue="commits" className="space-y-4">
        <TabsList style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}>
          <TabsTrigger value="commits"><GitCommit className="h-4 w-4 mr-2" />Commits</TabsTrigger>
          <TabsTrigger value="branches"><GitBranch className="h-4 w-4 mr-2" />Branches</TabsTrigger>
          <TabsTrigger value="changes"><FileCode className="h-4 w-4 mr-2" />Changes</TabsTrigger>
        </TabsList>

        <TabsContent value="commits" className="space-y-2">
          {commits.map((commit) => (
            <Card key={commit.hash} style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GitCommit className="h-4 w-4" style={{ color: 'var(--brand-500)' }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{commit.message}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{commit.author} - {commit.date}</p>
                  </div>
                </div>
                <code className="text-xs font-mono px-2 py-1 rounded" style={{ background: 'var(--bg-elevated)', color: 'var(--brand-400)', borderRadius: 'var(--radius-sm)' }}>
                  {commit.hash}
                </code>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="branches" className="space-y-2">
          {branches.map((branch) => (
            <Card key={branch.name} style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GitBranch className="h-4 w-4" style={{ color: branch.current ? 'var(--success-500)' : 'var(--text-muted)' }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{branch.name}</span>
                  {branch.current && <Badge style={{ background: 'var(--success-100)', color: 'var(--success-800)', borderRadius: 'var(--radius-sm)' }}>current</Badge>}
                </div>
                <code className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{branch.commit}</code>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="changes" className="space-y-2">
          {changes.map((change) => (
            <Card key={change.file} style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
              <CardContent className="p-4 flex items-center gap-3">
                <Badge style={{ background: `color-mix(in srgb, ${change.color} 15%, transparent)`, color: change.color, borderRadius: 'var(--radius-xs)', width: '24px', justifyContent: 'center' }}>
                  {change.status}
                </Badge>
                <code className="text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>{change.file}</code>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
