import {
  Sun, Moon, Monitor, PanelLeftClose, PanelLeft, Search,
  LayoutDashboard, Settings as SettingsIcon, Terminal, MessageSquare,
  GitBranch, GitFork, Puzzle, Brain, ListTodo, Palette, Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useThemeStore } from '@/stores/themeStore';
import { themePresets } from '@/theme';
import { useSidebar } from '@/components/ui/sidebar';
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { useLocation } from 'react-router-dom';

const routeConfig: Record<string, { name: string; icon: typeof LayoutDashboard; color: string }> = {
  '/': { name: 'Dashboard', icon: LayoutDashboard, color: 'var(--brand-500)' },
  '/settings': { name: 'Settings', icon: SettingsIcon, color: 'var(--info-500)' },
  '/terminals': { name: 'Terminals', icon: Terminal, color: '#40c057' },
  '/sessions': { name: 'Sessions', icon: MessageSquare, color: 'var(--accent-500)' },
  '/git': { name: 'Git', icon: GitBranch, color: '#f06595' },
  '/worktrees': { name: 'Worktrees', icon: GitFork, color: '#7950f2' },
  '/plugins': { name: 'Plugins', icon: Puzzle, color: '#be4bdb' },
  '/memory': { name: 'Memory', icon: Brain, color: '#15aabf' },
  '/tasks': { name: 'Tasks', icon: ListTodo, color: '#fd7e14' },
  '/theme': { name: 'Theme Studio', icon: Palette, color: '#e64980' },
  '/about': { name: 'About', icon: Info, color: 'var(--text-muted)' },
};

export function Header() {
  const { mode, toggleMode, themePresetId } = useThemeStore();
  const { toggleSidebar, open } = useSidebar();
  const location = useLocation();
  const route = routeConfig[location.pathname] || { name: 'Page', icon: LayoutDashboard, color: 'var(--text-muted)' };
  const PageIcon = route.icon;
  const activePreset = themePresetId ? themePresets.find(t => t.id === themePresetId) : null;

  return (
    <header
      className="flex h-12 items-center justify-between border-b px-4"
      style={{
        borderColor: 'var(--border-subtle)',
        background: 'color-mix(in srgb, var(--bg-primary) 85%, transparent)',
        backdropFilter: 'blur(12px) saturate(1.5)',
      }}
    >
      <div className="flex items-center gap-3">
        <Button
          variant="ghost" size="icon" onClick={toggleSidebar}
          className="h-7 w-7 transition-all hover:scale-105"
          style={{ borderRadius: 'var(--radius-md)' }}
        >
          {open
            ? <PanelLeftClose className="h-3.5 w-3.5" style={{ color: 'var(--text-muted)' }} />
            : <PanelLeft className="h-3.5 w-3.5" style={{ color: 'var(--text-muted)' }} />
          }
        </Button>
        <Separator orientation="vertical" className="h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage className="flex items-center gap-2">
                <div
                  className="flex h-5 w-5 items-center justify-center"
                  style={{
                    background: `color-mix(in srgb, ${route.color} 15%, transparent)`,
                    borderRadius: 'var(--radius-xs)',
                  }}
                >
                  <PageIcon className="h-3 w-3" style={{ color: route.color }} />
                </div>
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{route.name}</span>
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-1.5">
        {activePreset && (
          <Badge
            className="text-[10px] px-2 py-0 font-medium mr-1"
            style={{
              background: `color-mix(in srgb, ${activePreset.accent} 12%, transparent)`,
              color: activePreset.accent,
              borderRadius: 'var(--radius-md)',
            }}
          >
            {activePreset.name}
          </Badge>
        )}
        <Button
          variant="ghost" size="icon"
          className="h-7 w-7 transition-all hover:scale-105"
          style={{ borderRadius: 'var(--radius-md)' }}
        >
          <Search className="h-3.5 w-3.5" style={{ color: 'var(--text-muted)' }} />
        </Button>
        <Button
          variant="ghost" size="icon"
          className="h-7 w-7 transition-all hover:scale-105"
          style={{ borderRadius: 'var(--radius-md)' }}
          onClick={toggleMode}
        >
          {mode === 'dark' ? (
            <Sun className="h-3.5 w-3.5" style={{ color: 'var(--warning-500)' }} />
          ) : mode === 'light' ? (
            <Moon className="h-3.5 w-3.5" style={{ color: 'var(--brand-500)' }} />
          ) : (
            <Monitor className="h-3.5 w-3.5" style={{ color: 'var(--text-muted)' }} />
          )}
        </Button>
      </div>
    </header>
  );
}
