import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useThemeStore } from '@/stores/themeStore';
import { sidebarVariants, themePresets } from '@/theme';
import type { SidebarVariant } from '@/theme';
import { Sun, Moon, Monitor, RotateCcw, Check } from 'lucide-react';

export default function ThemeStudio() {
  const {
    mode, setMode,
    sidebarVariant, setSidebarVariant,
    radiusMultiplier, setRadiusMultiplier,
    themePresetId, setThemePreset,
  } = useThemeStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Theme Studio</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Customize the dashboard appearance</p>
      </div>

      {/* Theme Presets */}
      <Card style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base" style={{ color: 'var(--text-primary)' }}>Theme Presets</CardTitle>
          {themePresetId && (
            <button
              onClick={() => setThemePreset(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all"
              style={{
                background: 'var(--bg-elevated)',
                color: 'var(--text-secondary)',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <RotateCcw className="h-3 w-3" />
              Reset to default
            </button>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {themePresets.map((preset) => {
              const isActive = themePresetId === preset.id;
              const previewColors = [
                preset.accentScale[300],
                preset.accentScale[400],
                preset.accentScale[500],
                preset.accentScale[600],
                preset.accentScale[700],
              ];

              return (
                <button
                  key={preset.id}
                  onClick={() => setThemePreset(isActive ? null : preset.id)}
                  className="relative p-4 text-left transition-all border-2"
                  style={{
                    background: isActive ? 'var(--bg-active)' : 'var(--bg-elevated)',
                    borderColor: isActive ? preset.accent : 'transparent',
                    borderRadius: 'var(--radius-xl)',
                  }}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div
                      className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 rounded-full"
                      style={{ background: preset.accent }}
                    >
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}

                  {/* Theme name */}
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                    {preset.name}
                  </p>

                  {/* Description */}
                  <p className="text-xs mt-0.5 leading-snug" style={{ color: 'var(--text-muted)' }}>
                    {preset.description}
                  </p>

                  {/* Mode badge */}
                  <span
                    className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide rounded-full"
                    style={{
                      background: preset.mode === 'dark'
                        ? 'rgba(0,0,0,0.3)'
                        : 'rgba(255,255,255,0.6)',
                      color: preset.mode === 'dark'
                        ? 'rgba(255,255,255,0.7)'
                        : 'rgba(0,0,0,0.6)',
                    }}
                  >
                    {preset.mode === 'dark' ? (
                      <Moon className="h-2.5 w-2.5" />
                    ) : (
                      <Sun className="h-2.5 w-2.5" />
                    )}
                    {preset.mode}
                  </span>

                  {/* Color preview strip */}
                  <div className="flex gap-1 mt-3">
                    {previewColors.map((color, i) => (
                      <div
                        key={i}
                        className="h-3 flex-1 rounded-sm"
                        style={{ background: color, borderRadius: 'var(--radius-xs)' }}
                      />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Theme Mode */}
      <Card style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
        <CardHeader>
          <CardTitle className="text-base" style={{ color: 'var(--text-primary)' }}>Theme Mode</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {([
              { value: 'light' as const, icon: Sun, label: 'Light' },
              { value: 'dark' as const, icon: Moon, label: 'Dark' },
              { value: 'system' as const, icon: Monitor, label: 'System' },
            ]).map((item) => (
              <button
                key={item.value}
                onClick={() => setMode(item.value)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl flex-1 transition-all"
                style={{
                  background: mode === item.value ? 'var(--brand-500)' : 'var(--bg-elevated)',
                  color: mode === item.value ? 'white' : 'var(--text-secondary)',
                  borderRadius: 'var(--radius-xl)',
                }}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Border Radius */}
      <Card style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
        <CardHeader>
          <CardTitle className="text-base" style={{ color: 'var(--text-primary)' }}>Border Radius</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={radiusMultiplier}
              onChange={(e) => setRadiusMultiplier(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex items-center justify-between text-sm" style={{ color: 'var(--text-muted)' }}>
              <span>Sharp (0x)</span>
              <span className="font-mono">{radiusMultiplier.toFixed(1)}x</span>
              <span>Round (2x)</span>
            </div>
            <div className="flex gap-3 mt-4">
              {[0, 0.5, 1.0, 1.5, 2.0].map((val) => (
                <div
                  key={val}
                  onClick={() => setRadiusMultiplier(val)}
                  className="w-12 h-12 cursor-pointer border-2 transition-all"
                  style={{
                    borderRadius: `${Math.round(8 * val)}px`,
                    borderColor: radiusMultiplier === val ? 'var(--brand-500)' : 'var(--border-default)',
                    background: 'var(--bg-elevated)',
                  }}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sidebar Variant */}
      <Card style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
        <CardHeader>
          <CardTitle className="text-base" style={{ color: 'var(--text-primary)' }}>Sidebar Design</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {(Object.keys(sidebarVariants) as SidebarVariant[]).map((variant) => {
              const config = sidebarVariants[variant];
              return (
                <button
                  key={variant}
                  onClick={() => setSidebarVariant(variant)}
                  className="p-4 rounded-xl text-left transition-all border-2"
                  style={{
                    background: sidebarVariant === variant ? 'var(--brand-50)' : 'var(--bg-elevated)',
                    borderColor: sidebarVariant === variant ? 'var(--brand-500)' : 'transparent',
                    borderRadius: 'var(--radius-xl)',
                  }}
                >
                  <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{config.label}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{config.description}</p>
                  <p className="text-[10px] mt-2 font-mono" style={{ color: 'var(--text-muted)' }}>{config.width}px</p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Color Preview */}
      <Card style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
        <CardHeader>
          <CardTitle className="text-base" style={{ color: 'var(--text-primary)' }}>Color Palette Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {['shade', 'brand', 'success', 'warning', 'error', 'info'].map((name) => (
              <div key={name}>
                <p className="text-xs font-medium mb-2 capitalize" style={{ color: 'var(--text-muted)' }}>{name}</p>
                <div className="flex gap-1">
                  {Array.from({ length: 10 }, (_, i) => {
                    const level = name === 'shade' ? (i + 1) * 4 : i * 100 + (i === 0 ? 50 : 0);
                    return (
                      <div
                        key={i}
                        className="h-8 flex-1 rounded-md"
                        style={{ background: `var(--${name}-${level})`, borderRadius: 'var(--radius-sm)' }}
                        title={`--${name}-${level}`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
