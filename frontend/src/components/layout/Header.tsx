import { Sun, Moon, Monitor, PanelLeftClose, PanelLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useThemeStore } from '@/stores/themeStore';
import { useSidebar } from '@/components/ui/sidebar';
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { useLocation } from 'react-router-dom';

const routeNames: Record<string, string> = {
  '/': 'Dashboard', '/settings': 'Settings', '/terminals': 'Terminals',
  '/sessions': 'Sessions', '/git': 'Git', '/worktrees': 'Worktrees',
  '/plugins': 'Plugins', '/memory': 'Memory', '/tasks': 'Tasks',
  '/theme': 'Theme Studio', '/about': 'About',
};

export function Header() {
  const { mode, toggleMode } = useThemeStore();
  const { toggleSidebar, open } = useSidebar();
  const location = useLocation();
  const pageName = routeNames[location.pathname] || 'Page';

  return (
    <header
      className="flex h-14 items-center justify-between border-b px-4"
      style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-primary)' }}
    >
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8">
          {open ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
        </Button>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage style={{ color: 'var(--text-primary)' }}>{pageName}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Search className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleMode}>
          {mode === 'dark' ? (
            <Sun className="h-4 w-4" style={{ color: 'var(--warning-500)' }} />
          ) : mode === 'light' ? (
            <Moon className="h-4 w-4" style={{ color: 'var(--brand-500)' }} />
          ) : (
            <Monitor className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
          )}
        </Button>
      </div>
    </header>
  );
}
