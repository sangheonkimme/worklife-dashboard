import { create } from 'zustand';
import { applyLanguagePreference } from '@/lib/i18n';
import type { UserSettings } from '@/types/userSettings';
import { useFinanceSettingsStore } from './useFinanceSettingsStore';
import { useTimerStore } from './useTimerStore';
import { usePomodoroStore } from './usePomodoroStore';
import { useStopwatchStore } from './useStopwatchStore';
import { useWidgetStore } from './useWidgetStore';
import { useUiStore } from './useUiStore';

interface UserSettingsState {
  settings: UserSettings | null;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
  initialized: boolean;
  hydrate: (settings: UserSettings) => void;
  setLoading: () => void;
  setError: (message: string) => void;
  reset: () => void;
}

const applySettingsToStores = (settings: UserSettings) => {
  applyLanguagePreference(settings.language);
  useFinanceSettingsStore.getState().hydrateFromUserSettings(settings.finance);

  useUiStore.getState().hydrateFromUserSettings(settings.appearance);

  useWidgetStore.getState().hydrateFromUserSettings({
    dockPosition: settings.appearance.widgetDockPosition,
    autoClose: settings.appearance.widgetAutoClose,
  });

  useTimerStore.getState().hydrateFromUserSettings(settings.timers);

  usePomodoroStore
    .getState()
    .hydrateFromUserSettings({
      focusDuration: settings.pomodoro.focusDuration,
      shortBreakDuration: settings.pomodoro.shortBreakDuration,
      longBreakDuration: settings.pomodoro.longBreakDuration,
      longBreakInterval: settings.pomodoro.longBreakInterval,
      autoStartBreak: settings.pomodoro.autoStartBreak,
      autoStartFocus: settings.pomodoro.autoStartFocus,
      soundEnabled: settings.pomodoro.soundEnabled,
      soundVolume: settings.pomodoro.soundVolume,
      notificationEnabled: settings.pomodoro.notificationEnabled,
    });

  useStopwatchStore
    .getState()
    .hydrateFromUserSettings({
      defaultGoalTime: settings.stopwatch.defaultGoalTime,
      notificationsEnabled: settings.stopwatch.notificationsEnabled,
    });
};

export const useUserSettingsStore = create<UserSettingsState>((set) => ({
  settings: null,
  status: 'idle',
  error: null,
  initialized: false,
  hydrate: (settings) => {
    applySettingsToStores(settings);
    set({ settings, status: 'success', error: null, initialized: true });
  },
  setLoading: () => set({ status: 'loading', error: null }),
  setError: (message) =>
    set(() => ({
      error: message,
      status: 'error',
      initialized: true,
    })),
  reset: () => {
    applyLanguagePreference('system');
    set({ settings: null, status: 'idle', error: null, initialized: false });
  },
}));
