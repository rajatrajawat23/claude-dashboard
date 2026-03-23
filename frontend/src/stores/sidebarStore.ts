import { create } from 'zustand';

interface SidebarState {
  activeSection: string;
  flyoutOpen: boolean;
  hovering: boolean;

  setActiveSection: (section: string) => void;
  setFlyoutOpen: (open: boolean) => void;
  setHovering: (hovering: boolean) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  activeSection: 'dashboard',
  flyoutOpen: false,
  hovering: false,

  setActiveSection: (activeSection) => set({ activeSection }),
  setFlyoutOpen: (flyoutOpen) => set({ flyoutOpen }),
  setHovering: (hovering) => set({ hovering }),
}));
