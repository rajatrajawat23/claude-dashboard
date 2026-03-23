import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { Header } from './Header';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useThemeStore } from '@/stores/themeStore';

export function AppShell() {
  const { sidebarCollapsed } = useThemeStore();

  return (
    <SidebarProvider defaultOpen={!sidebarCollapsed}>
      <div className="flex h-screen w-full overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
        <AppSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6" style={{ background: 'var(--bg-secondary)' }}>
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
