import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UiState {
  sidebarOpened: boolean;
  colorScheme: 'light' | 'dark';
  isLoading: boolean;
  toggleSidebar: () => void;
  setSidebarOpened: (opened: boolean) => void;
  toggleColorScheme: () => void;
  setColorScheme: (scheme: 'light' | 'dark') => void;
  setLoading: (loading: boolean) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarOpened: false,
      colorScheme: 'dark',
      isLoading: false,
      toggleSidebar: () => set((state) => ({ sidebarOpened: !state.sidebarOpened })),
      setSidebarOpened: (opened) => set({ sidebarOpened: opened }),
      toggleColorScheme: () =>
        set((state) => ({
          colorScheme: state.colorScheme === 'dark' ? 'light' : 'dark',
        })),
      setColorScheme: (scheme) => set({ colorScheme: scheme }),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        colorScheme: state.colorScheme,
        sidebarOpened: state.sidebarOpened,
      }),
    }
  )
);
