// Master Design Token System
import { colors } from './colors';
import { darkShades, lightShades } from './shades';
import { radiusScale } from './radius';

export interface ThemeTokens {
  mode: 'light' | 'dark';
  shades: Record<number, string>;
  colors: typeof colors;
  radius: typeof radiusScale;
  radiusMultiplier: number;
  typography: {
    fontFamily: string;
    fontFamilyMono: string;
    sizes: Record<string, string>;
    weights: Record<string, number>;
    lineHeights: Record<string, string>;
  };
  spacing: Record<string, string>;
  shadows: Record<string, string>;
  transitions: Record<string, string>;
  semantic: {
    bg: { primary: string; secondary: string; card: string; elevated: string; active: string };
    border: { default: string; subtle: string; strong: string };
    text: { primary: string; secondary: string; muted: string; inverted: string };
    sidebar: {
      bg: string; bgHover: string; bgActive: string; border: string;
      text: string; textActive: string; icon: string; iconActive: string;
    };
  };
}

export function createTokens(mode: 'light' | 'dark', radiusMultiplier: number = 1.0): ThemeTokens {
  const shades = mode === 'dark' ? darkShades : lightShades;

  return {
    mode,
    shades,
    colors,
    radius: radiusScale,
    radiusMultiplier,
    typography: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
      fontFamilyMono: '"SF Mono", "Fira Code", "JetBrains Mono", Menlo, monospace',
      sizes: {
        xs: '0.75rem', sm: '0.8125rem', base: '0.875rem', md: '1rem',
        lg: '1.125rem', xl: '1.25rem', '2xl': '1.5rem', '3xl': '1.875rem',
        '4xl': '2.25rem', '5xl': '3rem',
      },
      weights: { light: 300, normal: 400, medium: 500, semibold: 600, bold: 700 },
      lineHeights: { tight: '1.25', snug: '1.375', normal: '1.5', relaxed: '1.625', loose: '2' },
    },
    spacing: {
      px: '1px', 0.5: '0.125rem', 1: '0.25rem', 1.5: '0.375rem',
      2: '0.5rem', 2.5: '0.625rem', 3: '0.75rem', 3.5: '0.875rem',
      4: '1rem', 5: '1.25rem', 6: '1.5rem', 7: '1.75rem',
      8: '2rem', 9: '2.25rem', 10: '2.5rem', 12: '3rem',
      14: '3.5rem', 16: '4rem', 20: '5rem', 24: '6rem',
    },
    shadows: {
      xs: `0 1px 2px ${colors.overlay.shadowXs}`,
      sm: `0 1px 3px ${colors.overlay.shadowSm}`,
      md: `0 4px 6px -1px ${colors.overlay.shadowMd}`,
      lg: `0 10px 15px -3px ${colors.overlay.shadowLg}`,
      xl: `0 20px 25px -5px ${colors.overlay.shadowXl}`,
      '2xl': `0 25px 50px -12px ${colors.overlay.shadow2xl}`,
      inner: `inset 0 2px 4px ${colors.overlay.shadowSm}`,
      none: 'none',
    },
    transitions: {
      fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
      normal: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
      smooth: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
      slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
      spring: '500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
    semantic: {
      bg: {
        primary: shades[1], secondary: shades[5], card: shades[10],
        elevated: shades[15], active: shades[20],
      },
      border: {
        default: shades[25], subtle: shades[15], strong: shades[30],
      },
      text: {
        primary: shades[40], secondary: shades[35], muted: shades[30],
        inverted: mode === 'dark' ? lightShades[40] : darkShades[40],
      },
      sidebar: {
        bg: shades[5], bgHover: shades[10], bgActive: shades[15],
        border: shades[25], text: shades[35], textActive: shades[40],
        icon: shades[30], iconActive: colors.brand[500],
      },
    },
  };
}
