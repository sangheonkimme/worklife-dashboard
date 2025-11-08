import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppearanceSettings, ColorSchemeOption } from '@/types/userSettings';

type MantineColorScheme = 'light' | 'dark';

interface UiState {
  sidebarOpened: boolean;
  sidebarPinned: boolean;
  colorScheme: MantineColorScheme;
  colorSchemePreference: ColorSchemeOption;
  isLoading: boolean;
  toggleSidebar: () => void;
  setSidebarOpened: (opened: boolean) => void;
  toggleColorScheme: () => void;
  setColorScheme: (scheme: MantineColorScheme) => void;
  setColorSchemePreference: (preference: ColorSchemeOption) => void;
  setSidebarPinned: (pinned: boolean) => void;
  setLoading: (loading: boolean) => void;
  hydrateFromUserSettings: (appearance: AppearanceSettings) => void;
}

const resolveSystemScheme = (): MantineColorScheme => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

const mapColorScheme = (preference: ColorSchemeOption): MantineColorScheme =>
  preference === 'system' ? resolveSystemScheme() : preference;

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarOpened: false,
      sidebarPinned: false,
      colorScheme: 'light',
      colorSchemePreference: 'system',
      isLoading: false,
      toggleSidebar: () => set((state) => ({ sidebarOpened: !state.sidebarOpened })),
      setSidebarOpened: (opened) => set({ sidebarOpened: opened }),
      toggleColorScheme: () =>
        set((state) => ({
          colorScheme: state.colorScheme === 'dark' ? 'light' : 'dark',
          colorSchemePreference: state.colorScheme === 'dark' ? 'light' : 'dark',
        })),
      setColorScheme: (scheme) => set({ colorScheme: scheme }),
      setColorSchemePreference: (preference) =>
        set({
          colorSchemePreference: preference,
          colorScheme: mapColorScheme(preference),
        }),
      setSidebarPinned: (pinned) => set({ sidebarPinned: pinned }),
      setLoading: (loading) => set({ isLoading: loading }),
      hydrateFromUserSettings: (appearance) =>
        set(() => ({
          colorSchemePreference: appearance.colorScheme,
          colorScheme: mapColorScheme(appearance.colorScheme),
          sidebarPinned: appearance.sidebarPinned,
        })),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        colorScheme: state.colorScheme,
        colorSchemePreference: state.colorSchemePreference,
        sidebarOpened: state.sidebarOpened,
        sidebarPinned: state.sidebarPinned,
      }),
    }
  )
);
