// Dynamic Border Radius System

export const radiusScale = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 6,
  default: 8,
  lg: 10,
  xl: 12,
  '2xl': 16,
  '3xl': 20,
  '4xl': 24,
  full: 9999,
} as const;

export type RadiusKey = keyof typeof radiusScale;

export function getRadius(key: RadiusKey, multiplier: number = 1.0): string {
  const base = radiusScale[key];
  if (base === 9999) return '9999px';
  return `${Math.round(base * multiplier)}px`;
}

export function generateRadiusVars(multiplier: number = 1.0): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [key, value] of Object.entries(radiusScale)) {
    if (value === 9999) {
      vars[`--radius-${key}`] = '9999px';
    } else {
      vars[`--radius-${key}`] = `${Math.round((value as number) * multiplier)}px`;
    }
  }
  vars['--radius-multiplier'] = String(multiplier);
  return vars;
}
