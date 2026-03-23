import { create } from 'zustand';

interface TerminalInfo {
  id: string;
  name: string;
  parentId: string | null;
  shell: string;
  cwd: string;
  pid: number;
  cols: number;
  rows: number;
  status: 'running' | 'stopped' | 'error';
  createdAt: string;
  lastActive: string;
  exitCode: number | null;
  children?: TerminalInfo[];
}

interface TerminalState {
  terminals: TerminalInfo[];
  activeTerminalId: string | null;

  setTerminals: (terminals: TerminalInfo[]) => void;
  setActiveTerminal: (id: string | null) => void;
  addTerminal: (terminal: TerminalInfo) => void;
  removeTerminal: (id: string) => void;
  updateTerminal: (id: string, updates: Partial<TerminalInfo>) => void;
}

export const useTerminalStore = create<TerminalState>((set) => ({
  terminals: [],
  activeTerminalId: null,

  setTerminals: (terminals) => set({ terminals }),
  setActiveTerminal: (activeTerminalId) => set({ activeTerminalId }),
  addTerminal: (terminal) =>
    set((state) => ({ terminals: [...state.terminals, terminal] })),
  removeTerminal: (id) =>
    set((state) => ({
      terminals: state.terminals.filter((t) => t.id !== id),
      activeTerminalId:
        state.activeTerminalId === id ? null : state.activeTerminalId,
    })),
  updateTerminal: (id, updates) =>
    set((state) => ({
      terminals: state.terminals.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    })),
}));

export type { TerminalInfo };
