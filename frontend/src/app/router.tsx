import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import Dashboard from '@/pages/Dashboard';
import Settings from '@/pages/Settings';
import Terminals from '@/pages/Terminals';
import Sessions from '@/pages/Sessions';
import Worktrees from '@/pages/Worktrees';
import Git from '@/pages/Git';
import Plugins from '@/pages/Plugins';
import Memory from '@/pages/Memory';
import Tasks from '@/pages/Tasks';
import ThemeStudio from '@/pages/ThemeStudio';
import About from '@/pages/About';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/terminals" element={<Terminals />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/worktrees" element={<Worktrees />} />
          <Route path="/git" element={<Git />} />
          <Route path="/plugins" element={<Plugins />} />
          <Route path="/memory" element={<Memory />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/theme" element={<ThemeStudio />} />
          <Route path="/about" element={<About />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
