import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface Task {
  id: string;
  subject: string;
  description: string;
  status: TaskStatus;
  order: number;
  createdAt: string;
}

const DEFAULT_TASKS: Task[] = [
  { id: '1', subject: 'Phase 1: SDLC Documentation', description: 'Create comprehensive SDLC docs for the project', status: 'completed', order: 0, createdAt: new Date().toISOString() },
  { id: '2', subject: 'Phase 2: Project Scaffolding', description: 'Scaffold frontend, backend, and infrastructure', status: 'completed', order: 1, createdAt: new Date().toISOString() },
  { id: '3', subject: 'Phase 3: Theming Engine', description: 'Build complete theming system with 200 colors and 80 shades', status: 'completed', order: 2, createdAt: new Date().toISOString() },
  { id: '4', subject: 'Phase 4: Backend API + Database', description: 'Implement Go backend with Fiber, GORM, and PostgreSQL', status: 'in_progress', order: 3, createdAt: new Date().toISOString() },
  { id: '5', subject: 'Phase 5: Frontend Core', description: 'Build core frontend pages and components', status: 'in_progress', order: 4, createdAt: new Date().toISOString() },
  { id: '6', subject: 'Phase 6: Feature Pages', description: 'Implement all feature pages with real data', status: 'pending', order: 5, createdAt: new Date().toISOString() },
  { id: '7', subject: 'Phase 7: Continuation Script', description: 'Build continuation and automation scripts', status: 'pending', order: 6, createdAt: new Date().toISOString() },
];

interface TaskState {
  tasks: Task[];
  addTask: (subject: string, description: string) => void;
  updateTask: (id: string, updates: Partial<Pick<Task, 'subject' | 'description' | 'status'>>) => void;
  deleteTask: (id: string) => void;
  cycleStatus: (id: string) => void;
  moveUp: (id: string) => void;
  moveDown: (id: string) => void;
}

const nextStatus: Record<TaskStatus, TaskStatus> = {
  pending: 'in_progress',
  in_progress: 'completed',
  completed: 'pending',
};

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: DEFAULT_TASKS,

      addTask: (subject, description) => {
        const tasks = get().tasks;
        const maxOrder = tasks.length > 0 ? Math.max(...tasks.map(t => t.order)) : -1;
        const newTask: Task = {
          id: crypto.randomUUID(),
          subject,
          description,
          status: 'pending',
          order: maxOrder + 1,
          createdAt: new Date().toISOString(),
        };
        set({ tasks: [...tasks, newTask] });
      },

      updateTask: (id, updates) => {
        set({
          tasks: get().tasks.map(t => (t.id === id ? { ...t, ...updates } : t)),
        });
      },

      deleteTask: (id) => {
        set({ tasks: get().tasks.filter(t => t.id !== id) });
      },

      cycleStatus: (id) => {
        set({
          tasks: get().tasks.map(t =>
            t.id === id ? { ...t, status: nextStatus[t.status] } : t
          ),
        });
      },

      moveUp: (id) => {
        const tasks = [...get().tasks].sort((a, b) => a.order - b.order);
        const idx = tasks.findIndex(t => t.id === id);
        if (idx <= 0) return;
        const prevOrder = tasks[idx - 1].order;
        tasks[idx - 1] = { ...tasks[idx - 1], order: tasks[idx].order };
        tasks[idx] = { ...tasks[idx], order: prevOrder };
        set({ tasks });
      },

      moveDown: (id) => {
        const tasks = [...get().tasks].sort((a, b) => a.order - b.order);
        const idx = tasks.findIndex(t => t.id === id);
        if (idx < 0 || idx >= tasks.length - 1) return;
        const nextOrder = tasks[idx + 1].order;
        tasks[idx + 1] = { ...tasks[idx + 1], order: tasks[idx].order };
        tasks[idx] = { ...tasks[idx], order: nextOrder };
        set({ tasks });
      },
    }),
    {
      name: 'claude-dashboard-tasks',
    }
  )
);
