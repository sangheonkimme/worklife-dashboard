import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WidgetStoreState {
  activeWidgetId: string | null;
  widgetHistory: string[];
  preferences: {
    dockPosition: 'right' | 'left';
    autoClose: boolean;
  };
  openWidget: (widgetId: string) => void;
  closeWidget: () => void;
  toggleWidget: (widgetId: string) => void;
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
