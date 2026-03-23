import { useEffect, useMemo } from 'react';
import { useThemeStore } from '@/stores/themeStore';
import { createTokens } from '@/theme';
import type { ThemeTokens } from '@/theme';

export function useTheme(): ThemeTokens & { resolvedMode: 'light' | 'dark' } {
  const { mode, radiusMultiplier } = useThemeStore();

  const resolvedMode = useMemo(() => {
    if (mode === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    return mode;
  }, [mode]);

  useEffect(() => {
    const root = document.documentElement;

    if (resolvedMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Apply radius multiplier
    root.style.setProperty('--radius-multiplier', String(radiusMultiplier));

    // Listen for system theme changes
    if (mode === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e: MediaQueryListEvent) => {
        if (e.matches) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      };
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [mode, resolvedMode, radiusMultiplier]);

  const tokens = useMemo(
    () => createTokens(resolvedMode, radiusMultiplier),
    [resolvedMode, radiusMultiplier]
  );

  return { ...tokens, resolvedMode };
}
