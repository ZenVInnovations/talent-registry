import { create } from 'zustand';

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: 'default' | 'success' | 'error' | 'warning';
}

interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark' | 'system';
  toasts: Toast[];
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapsed: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  sidebarCollapsed: false,
  theme: 'system',
  toasts: [],

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebarCollapsed: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme);
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      if (theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.add(prefersDark ? 'dark' : 'light');
      } else {
        root.classList.add(theme);
      }
    }
    set({ theme });
  },

  addToast: (toast) =>
    set((s) => {
      const id = Math.random().toString(36).slice(2);
      setTimeout(() => {
        useUIStore.getState().removeToast(id);
      }, 5000);
      return { toasts: [...s.toasts, { ...toast, id }] };
    }),

  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
