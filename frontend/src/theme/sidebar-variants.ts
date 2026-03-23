// 6 Sidebar Design Variants

export type SidebarVariant = 'minimal' | 'compact' | 'standard' | 'floating' | 'docked' | 'rail';

export interface SidebarConfig {
  variant: SidebarVariant;
  label: string;
  description: string;
  width: number;
  collapsedWidth: number;
  showLabels: boolean;
  showSections: boolean;
  iconSize: number;
  overlay: boolean;
  hasActivityBar: boolean;
  hasFlyout: boolean;
}

export const sidebarVariants: Record<SidebarVariant, SidebarConfig> = {
  minimal: {
    variant: 'minimal',
    label: 'Minimal',
    description: 'Icons only, expand on hover',
    width: 240,
    collapsedWidth: 60,
    showLabels: false,
    showSections: false,
    iconSize: 20,
    overlay: false,
    hasActivityBar: false,
    hasFlyout: false,
  },
  compact: {
    variant: 'compact',
    label: 'Compact',
    description: 'Small icons with truncated labels',
    width: 180,
    collapsedWidth: 180,
    showLabels: true,
    showSections: false,
    iconSize: 16,
    overlay: false,
    hasActivityBar: false,
    hasFlyout: false,
  },
  standard: {
    variant: 'standard',
    label: 'Standard',
    description: 'Full sidebar with sections',
    width: 260,
    collapsedWidth: 60,
    showLabels: true,
    showSections: true,
    iconSize: 20,
    overlay: false,
    hasActivityBar: false,
    hasFlyout: false,
  },
  floating: {
    variant: 'floating',
    label: 'Floating',
    description: 'Overlay with backdrop blur',
    width: 280,
    collapsedWidth: 0,
    showLabels: true,
    showSections: true,
    iconSize: 20,
    overlay: true,
    hasActivityBar: false,
    hasFlyout: false,
  },
  docked: {
    variant: 'docked',
    label: 'Docked',
    description: 'VS Code style activity bar + panel',
    width: 308, // 48 + 260
    collapsedWidth: 48,
    showLabels: true,
    showSections: true,
    iconSize: 24,
    overlay: false,
    hasActivityBar: true,
    hasFlyout: false,
  },
  rail: {
    variant: 'rail',
    label: 'Rail',
    description: 'Thin rail with flyout panels',
    width: 328, // 48 + 280
    collapsedWidth: 48,
    showLabels: true,
    showSections: true,
    iconSize: 20,
    overlay: false,
    hasActivityBar: false,
    hasFlyout: true,
  },
};
