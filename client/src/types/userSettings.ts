export interface FinanceSettings {
  payday: number;
  currency: string;
  weekStartsOn: number;
}

export type ColorSchemeOption = "light" | "dark" | "system";
export type WidgetDockPosition = "left" | "right";

export interface AppearanceSettings {
  colorScheme: ColorSchemeOption;
  sidebarPinned: boolean;
  widgetDockPosition: WidgetDockPosition;
  widgetAutoClose: boolean;
}

export type LanguagePreference = "system" | "ko" | "en";

export interface TimerPreferences {
  presets: number[];
  autoRepeat: boolean;
  preAlertMs: number | null;
  notifications: boolean;
  soundEnabled: boolean;
}

export interface PomodoroPreferences {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
  autoStartBreak: boolean;
  autoStartFocus: boolean;
  soundEnabled: boolean;
  soundVolume: number;
  notificationEnabled: boolean;
}

export interface StopwatchPreferences {
  defaultGoalTime: number | null;
  notificationsEnabled: boolean;
}

export interface NotificationPreferences {
  transactions: boolean;
  monthlyReport: boolean;
  checklist: boolean;
}

export interface UserSettings {
  locale: string;
  language: LanguagePreference;
  timezone: string;
  finance: FinanceSettings;
  appearance: AppearanceSettings;
  timers: TimerPreferences;
  pomodoro: PomodoroPreferences;
  stopwatch: StopwatchPreferences;
  notifications: NotificationPreferences;
}

export type UpdateUserSettingsPayload = Partial<UserSettings>;
