import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type WidgetDockPosition = 'right' | 'left';

interface WidgetPreferences {
  dockPosition: WidgetDockPosition;
  autoClose: boolean;
}

interface WidgetStoreState {
  activeWidgetId: string | null;
  widgetHistory: string[];
  preferences: WidgetPreferences;
  openWidget: (widgetId: string) => void;
  closeWidget: () => void;
  toggleWidget: (widgetId: string) => void;
  setPreferences: (preferences: Partial<WidgetPreferences>) => void;
  hydrateFromUserSettings: (preferences: WidgetPreferences) => void;
}

export const useWidgetStore = create<WidgetStoreState>()(
  persist(
    (set, get) => ({
      activeWidgetId: null,
      widgetHistory: [],
      preferences: {
        dockPosition: 'right',
        autoClose: false,
      },
      openWidget: (widgetId) => {
        set({ activeWidgetId: widgetId });
        // 히스토리에 추가 (중복 제거)
        const { widgetHistory } = get();
        const newHistory = [widgetId, ...widgetHistory.filter((id) => id !== widgetId)].slice(0, 10);
        set({ widgetHistory: newHistory });
      },
      closeWidget: () => set({ activeWidgetId: null }),
      toggleWidget: (widgetId) => {
        const { activeWidgetId } = get();
        if (activeWidgetId === widgetId) {
          set({ activeWidgetId: null });
        } else {
          get().openWidget(widgetId);
        }
      },
      setPreferences: (preferences) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            ...preferences,
          },
        })),
      hydrateFromUserSettings: (preferences) =>
        set(() => ({
          preferences,
        })),
    }),
    {
      name: 'widget-store',
      partialize: (state) => ({
        preferences: state.preferences,
        widgetHistory: state.widgetHistory,
      }),
    }
  )
);
