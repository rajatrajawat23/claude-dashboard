import { useEffect, useMemo } from 'react';
import { useThemeStore } from '@/stores/themeStore';
import { createTokens, themePresets } from '@/theme';
import type { ThemeTokens } from '@/theme';

export function useTheme(): ThemeTokens & { resolvedMode: 'light' | 'dark' } {
  const { mode, radiusMultiplier, themePresetId } = useThemeStore();

  const resolvedMode = useMemo(() => {
    if (mode === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    return mode;
  }, [mode]);

  const activePreset = useMemo(() => {
    if (!themePresetId) return null;
    return themePresets.find((p) => p.id === themePresetId) ?? null;
  }, [themePresetId]);

  useEffect(() => {
    const root = document.documentElement;

    if (resolvedMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Apply radius multiplier
    root.style.setProperty('--radius-multiplier', String(radiusMultiplier));

    // Apply theme preset shades and accent scale
    if (activePreset) {
      // Apply shade CSS variables (--shade-1 through --shade-40)
      for (let i = 1; i <= 40; i++) {
        const value = activePreset.shades[i];
        if (value) {
          root.style.setProperty(`--shade-${i}`, value);
        }
      }

      // Apply accent scale as brand CSS variables (--brand-50 through --brand-900)
      const scaleKeys = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
      for (const key of scaleKeys) {
        const value = activePreset.accentScale[key];
        if (value) {
          root.style.setProperty(`--brand-${key}`, value);
        }
      }
    } else {
      // Remove preset overrides so CSS defaults take effect
      for (let i = 1; i <= 40; i++) {
        root.style.removeProperty(`--shade-${i}`);
      }
      const scaleKeys = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
      for (const key of scaleKeys) {
        root.style.removeProperty(`--brand-${key}`);
      }
    }

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
  }, [mode, resolvedMode, radiusMultiplier, activePreset]);

  const tokens = useMemo(
    () => createTokens(resolvedMode, radiusMultiplier),
    [resolvedMode, radiusMultiplier]
  );

  return { ...tokens, resolvedMode };
}
