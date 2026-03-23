import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Settings, Terminal, MessageSquare,
  GitBranch, GitFork, Puzzle, Brain, ListTodo,
  Palette, Info, Sparkles, User,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter,
} from '@/components/ui/sidebar';

const navItems = [
  { title: 'Dashboard', icon: LayoutDashboard, path: '/', color: 'var(--brand-500)', shortcut: '⌘1' },
  { title: 'Settings', icon: Settings, path: '/settings', color: 'var(--info-500)', shortcut: '⌘2' },
  { title: 'Terminals', icon: Terminal, path: '/terminals', color: '#40c057', shortcut: '⌘3' },
  { title: 'Sessions', icon: MessageSquare, path: '/sessions', color: 'var(--accent-500)' },
  { title: 'Git', icon: GitBranch, path: '/git', color: '#f06595' },
  { title: 'Worktrees', icon: GitFork, path: '/worktrees', color: '#7950f2' },
  { title: 'Plugins', icon: Puzzle, path: '/plugins', color: '#be4bdb' },
  { title: 'Memory', icon: Brain, path: '/memory', color: '#15aabf' },
  { title: 'Tasks', icon: ListTodo, path: '/tasks', color: '#fd7e14' },
  { title: 'Theme Studio', icon: Palette, path: '/theme', color: '#e64980' },
  { title: 'About', icon: Info, path: '/about', color: 'var(--text-muted)' },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Sidebar className="border-r" style={{ borderColor: 'var(--border-subtle)', background: 'var(--sidebar-bg)' }}>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, var(--brand-500), var(--accent-500))',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 4px 12px color-mix(in srgb, var(--brand-500) 30%, transparent)',
            }}
          >
            <Sparkles className="h-4.5 w-4.5 text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>Claude Dashboard</h2>
            <div className="flex items-center gap-1.5">
              <Badge
                className="text-[9px] px-1.5 py-0 font-mono"
                style={{
                  background: 'color-mix(in srgb, var(--brand-500) 12%, transparent)',
                  color: 'var(--brand-500)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                v1.0.0
              </Badge>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <Separator style={{ background: 'var(--border-subtle)' }} />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: 'var(--text-muted)' }}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.path);
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      onClick={() => navigate(item.path)}
                      isActive={isActive}
                      className="gap-3 group relative transition-all"
                      style={{
                        color: isActive ? 'var(--text-primary)' : 'var(--sidebar-text)',
                        background: isActive
                          ? `color-mix(in srgb, ${item.color} 12%, transparent)`
                          : 'transparent',
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      {/* Active indicator line */}
                      {isActive && (
                        <div
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4"
                          style={{
                            background: item.color,
                            borderRadius: '0 var(--radius-full) var(--radius-full) 0',
                            boxShadow: `0 0 8px ${item.color}`,
                          }}
                        />
                      )}
                      <div
                        className="flex h-6 w-6 items-center justify-center shrink-0 transition-all"
                        style={{
                          background: isActive
                            ? `color-mix(in srgb, ${item.color} 20%, transparent)`
                            : 'transparent',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        <item.icon
                          className="h-3.5 w-3.5"
                          style={{ color: isActive ? item.color : 'var(--sidebar-icon)' }}
                        />
                      </div>
                      <span className="flex-1 text-sm">{item.title}</span>
                      {item.shortcut && (
                        <span
                          className="text-[10px] font-mono opacity-0 group-hover:opacity-60 transition-opacity"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {item.shortcut}
                        </span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <Separator style={{ background: 'var(--border-subtle)' }} />

      <SidebarFooter className="p-3">
        <div
          className="flex items-center gap-2.5 p-2 transition-all cursor-pointer"
          style={{
            background: 'color-mix(in srgb, var(--bg-elevated) 50%, transparent)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <div
            className="flex h-7 w-7 items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, var(--brand-400), var(--accent-400))',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <User className="h-3.5 w-3.5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>Developer</p>
            <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>claude-dashboard</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
