import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Terminal, Server, Database, Palette, Cpu, HardDrive } from 'lucide-react';

const systemInfo = [
  { label: 'Frontend', value: 'React 18 + Vite + TypeScript', icon: Terminal },
  { label: 'UI Framework', value: 'shadcn/ui + Tailwind CSS 4', icon: Palette },
  { label: 'Backend', value: 'Go 1.22 + Fiber v2', icon: Server },
  { label: 'Database', value: 'PostgreSQL 16', icon: Database },
  { label: 'Platform', value: 'Darwin (macOS)', icon: Cpu },
  { label: 'Claude Home', value: '~/.claude/', icon: HardDrive },
];

export default function About() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>About</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>System information and status</p>
      </div>

      <Card style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: 'var(--brand-500)' }}>
              <Terminal className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle style={{ color: 'var(--text-primary)' }}>Claude Dashboard</CardTitle>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>v1.0.0</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Comprehensive management dashboard for Claude Code CLI. Manage settings, terminals,
            sessions, worktrees, plugins, memory, and more from a single interface.
          </p>
        </CardContent>
      </Card>

      <Card style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
        <CardHeader>
          <CardTitle className="text-base" style={{ color: 'var(--text-primary)' }}>System Stack</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {systemInfo.map((info) => (
              <div key={info.label} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <div className="flex items-center gap-3">
                  <info.icon className="h-4 w-4" style={{ color: 'var(--brand-500)' }} />
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{info.label}</span>
                </div>
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{info.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
        <CardHeader>
          <CardTitle className="text-base" style={{ color: 'var(--text-primary)' }}>Theme Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: 'Colors', value: '200' },
              { label: 'Dark Shades', value: '40' },
              { label: 'Light Shades', value: '40' },
              { label: 'Sidebar Variants', value: '6' },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-3 rounded-xl" style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)' }}>
                <p className="text-2xl font-bold" style={{ color: 'var(--brand-500)' }}>{stat.value}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
