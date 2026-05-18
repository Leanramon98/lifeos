import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RecentCommandItem {
  id: string;
  type: 'task' | 'note' | 'project';
  title: string;
  context?: string;
  url: string;
  timestamp: number;
}

interface UIState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  recentCommandItems: RecentCommandItem[];
  addRecentCommandItem: (item: Omit<RecentCommandItem, 'timestamp'>) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      commandPaletteOpen: false,
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      recentCommandItems: [],
      addRecentCommandItem: (item) => set((state) => {
        const newItem = { ...item, timestamp: Date.now() };
        const filtered = state.recentCommandItems.filter(i => i.id !== item.id);
        return { recentCommandItems: [newItem, ...filtered].slice(0, 5) };
      }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({ 
        sidebarCollapsed: state.sidebarCollapsed,
        recentCommandItems: state.recentCommandItems
      }),
    }
  )
);
