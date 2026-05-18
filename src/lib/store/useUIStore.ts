import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TaskStatus, TaskPriority, AreaSlug } from '../types';

interface TaskFilters {
  status: TaskStatus[];
  priority: TaskPriority[];
  areas: AreaSlug[];
  workspaces: string[];
  projects: string[];
  dateRange: 'all' | 'today' | 'week' | 'month' | 'overdue';
  search: string;
}

interface RecentCommandItem {
  id: string;
  type: 'task' | 'note' | 'project';
  title: string;
  context?: string;
  url: string;
  timestamp: number;
}

interface UIState {
  taskViewMode: 'list' | 'kanban' | 'calendar';
  taskGroupBy: 'status' | 'workspace' | 'project' | 'priority' | 'dueDate' | 'none';
  taskSortBy: 'order' | 'dueDate' | 'priority' | 'createdAt' | 'updatedAt';
  taskSortDir: 'asc' | 'desc';
  taskFilters: TaskFilters;
  
  setTaskViewMode: (mode: 'list' | 'kanban' | 'calendar') => void;
  setTaskGroupBy: (by: UIState['taskGroupBy']) => void;
  setTaskSortBy: (by: UIState['taskSortBy']) => void;
  setTaskSortDir: (dir: 'asc' | 'desc') => void;
  updateTaskFilters: (filters: Partial<TaskFilters>) => void;
  resetTaskFilters: () => void;

  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  recentCommandItems: RecentCommandItem[];
  addRecentCommandItem: (item: Omit<RecentCommandItem, 'timestamp'>) => void;
}

const initialFilters: TaskFilters = {
  status: ['todo', 'doing', 'waiting', 'backlog'],
  priority: [],
  areas: [],
  workspaces: [],
  projects: [],
  dateRange: 'all',
  search: ''
};

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      taskViewMode: 'list',
      taskGroupBy: 'status',
      taskSortBy: 'order',
      taskSortDir: 'asc',
      taskFilters: initialFilters,

      setTaskViewMode: (mode) => set({ taskViewMode: mode }),
      setTaskGroupBy: (by) => set({ taskGroupBy: by }),
      setTaskSortBy: (by) => set({ taskSortBy: by }),
      setTaskSortDir: (dir) => set({ taskSortDir: dir }),
      updateTaskFilters: (filters) => set((state) => ({ 
        taskFilters: { ...state.taskFilters, ...filters } 
      })),
      resetTaskFilters: () => set({ taskFilters: initialFilters }),

      isCommandPaletteOpen: false,
      setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),
      recentCommandItems: [],
      addRecentCommandItem: (item) => set((state) => {
        const newItem = { ...item, timestamp: Date.now() };
        const filtered = state.recentCommandItems.filter(i => i.id !== item.id);
        return { recentCommandItems: [newItem, ...filtered].slice(0, 5) };
      }),
    }),
    {
      name: 'leso-ui-storage',
      partialize: (state) => ({ 
        taskViewMode: state.taskViewMode, 
        taskGroupBy: state.taskGroupBy,
        taskSortBy: state.taskSortBy,
        taskSortDir: state.taskSortDir,
        taskFilters: state.taskFilters,
        recentCommandItems: state.recentCommandItems 
      }), // No persistir isCommandPaletteOpen
    }
  )
);
