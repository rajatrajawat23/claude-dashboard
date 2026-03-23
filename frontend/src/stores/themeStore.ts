import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SidebarVariant } from '@/theme';

interface ThemeState {
  mode: 'light' | 'dark' | 'system';
  sidebarVariant: SidebarVariant;
  radiusMultiplier: number;
  sidebarCollapsed: boolean;
  themePresetId: string | null;

  setMode: (mode: 'light' | 'dark' | 'system') => void;
  toggleMode: () => void;
  setSidebarVariant: (variant: SidebarVariant) => void;
  setRadiusMultiplier: (multiplier: number) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setThemePreset: (id: string | null) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'system',
      sidebarVariant: 'standard',
      radiusMultiplier: 1.0,
      sidebarCollapsed: false,
      themePresetId: null,

      setMode: (mode) => set({ mode }),
      toggleMode: () => {
        const current = get().mode;
        const resolved =
          current === 'system'
            ? window.matchMedia('(prefers-color-scheme: dark)').matches
              ? 'dark'
              : 'light'
            : current;
        set({ mode: resolved === 'dark' ? 'light' : 'dark' });
      },
      setSidebarVariant: (sidebarVariant) => set({ sidebarVariant }),
      setRadiusMultiplier: (radiusMultiplier) => set({ radiusMultiplier }),
      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      setThemePreset: (themePresetId) => set({ themePresetId }),
    }),
    {
      name: 'claude-dashboard-theme',
    }
  )
);
