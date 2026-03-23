import { Settings, Terminal, MessageSquare, GitBranch, Puzzle, Brain, ListTodo, GitFork } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

const stats = [
  { label: 'Settings Files', value: '2', icon: Settings, color: 'var(--icon-settings)', path: '/settings' },
  { label: 'Active Terminals', value: '0', icon: Terminal, color: 'var(--icon-terminal)', path: '/terminals' },
  { label: 'Sessions', value: '14', icon: MessageSquare, color: 'var(--info-500)', path: '/sessions' },
  { label: 'Git Branches', value: '1', icon: GitBranch, color: 'var(--icon-git)', path: '/git' },
  { label: 'Worktrees', value: '1', icon: GitFork, color: 'var(--accent-500)', path: '/worktrees' },
  { label: 'Plugins', value: '3', icon: Puzzle, color: 'var(--icon-plugin)', path: '/plugins' },
  { label: 'Memories', value: '2', icon: Brain, color: 'var(--icon-memory)', path: '/memory' },
  { label: 'Tasks', value: '7', icon: ListTodo, color: 'var(--icon-task)', path: '/tasks' },
];

const recentActivity = [
  { action: 'Settings updated', time: '2 min ago', type: 'settings' },
  { action: 'New session started', time: '15 min ago', type: 'session' },
  { action: 'Plugin installed: frontend-design', time: '1 hour ago', type: 'plugin' },
  { action: 'Memory created: project_inforeels.md', time: '3 hours ago', type: 'memory' },
  { action: 'Commit: feat: scaffold project', time: '5 hours ago', type: 'git' },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Claude Code Management Console</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="cursor-pointer transition-all hover:scale-[1.02]"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}
            onClick={() => navigate(stat.path)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
                  <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `color-mix(in srgb, ${stat.color} 15%, transparent)` }}>
                  <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
        <CardHeader>
          <CardTitle className="text-lg" style={{ color: 'var(--text-primary)' }}>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2" style={{ borderBottom: i < recentActivity.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" style={{ borderColor: 'var(--border-default)', color: 'var(--text-muted)', borderRadius: 'var(--radius-sm)' }}>
                    {item.type}
                  </Badge>
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.action}</span>
                </div>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
        <CardHeader>
          <CardTitle className="text-lg" style={{ color: 'var(--text-primary)' }}>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { label: 'New Terminal', icon: Terminal, path: '/terminals' },
              { label: 'View Settings', icon: Settings, path: '/settings' },
              { label: 'Browse Memory', icon: Brain, path: '/memory' },
              { label: 'Theme Studio', icon: Puzzle, path: '/theme' },
            ].map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className="flex items-center gap-2 rounded-lg p-3 text-sm font-medium transition-colors"
                style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', borderRadius: 'var(--radius-lg)' }}
              >
                <action.icon className="h-4 w-4" style={{ color: 'var(--brand-500)' }} />
                {action.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
