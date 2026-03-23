import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Settings, Terminal, MessageSquare,
  GitBranch, GitFork, Puzzle, Brain, ListTodo,
  Palette, Info,
} from 'lucide-react';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter,
} from '@/components/ui/sidebar';

const navItems = [
  { title: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { title: 'Settings', icon: Settings, path: '/settings' },
  { title: 'Terminals', icon: Terminal, path: '/terminals' },
  { title: 'Sessions', icon: MessageSquare, path: '/sessions' },
  { title: 'Git', icon: GitBranch, path: '/git' },
  { title: 'Worktrees', icon: GitFork, path: '/worktrees' },
  { title: 'Plugins', icon: Puzzle, path: '/plugins' },
  { title: 'Memory', icon: Brain, path: '/memory' },
  { title: 'Tasks', icon: ListTodo, path: '/tasks' },
  { title: 'Theme Studio', icon: Palette, path: '/theme' },
  { title: 'About', icon: Info, path: '/about' },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Sidebar className="border-r" style={{ borderColor: 'var(--border-subtle)', background: 'var(--sidebar-bg)' }}>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: 'var(--brand-500)' }}>
            <Terminal className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Claude Dashboard</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Management Console</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel style={{ color: 'var(--text-muted)' }}>Navigation</SidebarGroupLabel>
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
                      className="gap-3"
                      style={{
                        color: isActive ? 'var(--sidebar-text-active)' : 'var(--sidebar-text)',
                        background: isActive ? 'var(--sidebar-bg-active)' : 'transparent',
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      <item.icon
                        className="h-4 w-4"
                        style={{ color: isActive ? 'var(--sidebar-icon-active)' : 'var(--sidebar-icon)' }}
                      />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>v1.0.0</p>
      </SidebarFooter>
    </Sidebar>
  );
}
