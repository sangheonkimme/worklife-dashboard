import type { Prisma, UserSettings as UserSettingsModel } from '@prisma/client';
import { prisma } from '../lib/prisma';

export interface FinanceSettings {
  payday: number;
  currency: string;
  weekStartsOn: number;
}

export interface AppearanceSettings {
  colorScheme: 'light' | 'dark' | 'system';
  sidebarPinned: boolean;
  widgetDockPosition: 'left' | 'right';
  widgetAutoClose: boolean;
}

export interface TimerSettingsPayload {
  presets: number[];
  autoRepeat: boolean;
  preAlertMs: number | null;
  notifications: boolean;
  soundEnabled: boolean;
}

export interface PomodoroSettingsPayload {
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

export interface StopwatchSettingsPayload {
  defaultGoalTime: number | null;
  notificationsEnabled: boolean;
}

export interface NotificationSettingsPayload {
  transactions: boolean;
  monthlyReport: boolean;
  checklist: boolean;
}

export interface UserSettingsPayload {
  locale: string;
  timezone: string;
  finance: FinanceSettings;
  appearance: AppearanceSettings;
  timers: TimerSettingsPayload;
  pomodoro: PomodoroSettingsPayload;
  stopwatch: StopwatchSettingsPayload;
  notifications: NotificationSettingsPayload;
}

const DEFAULT_USER_SETTINGS: UserSettingsPayload = {
  locale: 'ko-KR',
  timezone: 'Asia/Seoul',
  finance: {
    payday: 1,
    currency: 'KRW',
    weekStartsOn: 1,
  },
  appearance: {
    colorScheme: 'dark',
    sidebarPinned: false,
    widgetDockPosition: 'right',
    widgetAutoClose: false,
  },
  timers: {
    presets: [300000, 600000, 900000, 1800000],
    autoRepeat: false,
    preAlertMs: 60000,
    notifications: true,
    soundEnabled: true,
  },
  pomodoro: {
    focusDuration: 1500,
    shortBreakDuration: 300,
    longBreakDuration: 900,
    longBreakInterval: 4,
    autoStartBreak: false,
    autoStartFocus: false,
    soundEnabled: true,
    soundVolume: 50,
    notificationEnabled: true,
  },
  stopwatch: {
    defaultGoalTime: null,
    notificationsEnabled: true,
  },
  notifications: {
    transactions: true,
    monthlyReport: false,
    checklist: true,
  },
};

const jsonToNumberArray = (value: Prisma.JsonValue | null): number[] => {
  if (Array.isArray(value)) {
    return value.filter((item): item is number => typeof item === 'number');
  }
  return [...DEFAULT_USER_SETTINGS.timers.presets];
};

const mapRecordToPayload = (record: UserSettingsModel): UserSettingsPayload => ({
  locale: record.locale,
  timezone: record.timezone,
  finance: {
    payday: record.payday,
    currency: record.currency,
    weekStartsOn: record.weekStartsOn,
  },
  appearance: {
    colorScheme: record.colorScheme as AppearanceSettings['colorScheme'],
    sidebarPinned: record.sidebarPinned,
    widgetDockPosition: record.widgetDockPosition as AppearanceSettings['widgetDockPosition'],
    widgetAutoClose: record.widgetAutoClose,
  },
  timers: {
    presets: jsonToNumberArray(record.timerPresets),
    autoRepeat: record.timerAutoRepeat,
    preAlertMs: record.timerPreAlertMs ?? null,
    notifications: record.timerNotifications,
    soundEnabled: record.timerSoundEnabled,
  },
  pomodoro: {
    focusDuration: record.pomodoroFocusDuration,
    shortBreakDuration: record.pomodoroShortBreakDuration,
    longBreakDuration: record.pomodoroLongBreakDuration,
    longBreakInterval: record.pomodoroLongBreakInterval,
    autoStartBreak: record.pomodoroAutoStartBreak,
    autoStartFocus: record.pomodoroAutoStartFocus,
    soundEnabled: record.pomodoroSoundEnabled,
    soundVolume: record.pomodoroSoundVolume,
    notificationEnabled: record.pomodoroNotificationEnabled,
  },
  stopwatch: {
    defaultGoalTime: record.stopwatchDefaultGoalTime ?? null,
    notificationsEnabled: record.stopwatchNotificationsEnabled,
  },
  notifications: {
    transactions: record.notifyTransactions,
    monthlyReport: record.notifyMonthlyReport,
    checklist: record.notifyChecklist,
  },
});

const mapPayloadToDb = (payload: UserSettingsPayload) => ({
  locale: payload.locale,
  timezone: payload.timezone,
  payday: payload.finance.payday,
  currency: payload.finance.currency,
  weekStartsOn: payload.finance.weekStartsOn,
  colorScheme: payload.appearance.colorScheme,
  sidebarPinned: payload.appearance.sidebarPinned,
  widgetDockPosition: payload.appearance.widgetDockPosition,
  widgetAutoClose: payload.appearance.widgetAutoClose,
  timerPresets: payload.timers.presets as unknown as Prisma.JsonArray,
  timerAutoRepeat: payload.timers.autoRepeat,
  timerPreAlertMs: payload.timers.preAlertMs,
  timerNotifications: payload.timers.notifications,
  timerSoundEnabled: payload.timers.soundEnabled,
  pomodoroFocusDuration: payload.pomodoro.focusDuration,
  pomodoroShortBreakDuration: payload.pomodoro.shortBreakDuration,
  pomodoroLongBreakDuration: payload.pomodoro.longBreakDuration,
  pomodoroLongBreakInterval: payload.pomodoro.longBreakInterval,
  pomodoroAutoStartBreak: payload.pomodoro.autoStartBreak,
  pomodoroAutoStartFocus: payload.pomodoro.autoStartFocus,
  pomodoroSoundEnabled: payload.pomodoro.soundEnabled,
  pomodoroSoundVolume: payload.pomodoro.soundVolume,
  pomodoroNotificationEnabled: payload.pomodoro.notificationEnabled,
  stopwatchDefaultGoalTime: payload.stopwatch.defaultGoalTime,
  stopwatchNotificationsEnabled: payload.stopwatch.notificationsEnabled,
  notifyTransactions: payload.notifications.transactions,
  notifyMonthlyReport: payload.notifications.monthlyReport,
  notifyChecklist: payload.notifications.checklist,
});

const mergeSettings = (
  base: UserSettingsPayload,
  patch: Partial<UserSettingsPayload> | undefined
): UserSettingsPayload => ({
  locale: patch?.locale ?? base.locale,
  timezone: patch?.timezone ?? base.timezone,
  finance: {
    payday: patch?.finance?.payday ?? base.finance.payday,
    currency: patch?.finance?.currency ?? base.finance.currency,
    weekStartsOn: patch?.finance?.weekStartsOn ?? base.finance.weekStartsOn,
  },
  appearance: {
    colorScheme: patch?.appearance?.colorScheme ?? base.appearance.colorScheme,
    sidebarPinned: patch?.appearance?.sidebarPinned ?? base.appearance.sidebarPinned,
    widgetDockPosition:
      patch?.appearance?.widgetDockPosition ?? base.appearance.widgetDockPosition,
    widgetAutoClose: patch?.appearance?.widgetAutoClose ?? base.appearance.widgetAutoClose,
  },
  timers: {
    presets: patch?.timers?.presets ?? base.timers.presets,
    autoRepeat: patch?.timers?.autoRepeat ?? base.timers.autoRepeat,
    preAlertMs: patch?.timers?.preAlertMs ?? base.timers.preAlertMs,
    notifications: patch?.timers?.notifications ?? base.timers.notifications,
    soundEnabled: patch?.timers?.soundEnabled ?? base.timers.soundEnabled,
  },
  pomodoro: {
    focusDuration: patch?.pomodoro?.focusDuration ?? base.pomodoro.focusDuration,
    shortBreakDuration:
      patch?.pomodoro?.shortBreakDuration ?? base.pomodoro.shortBreakDuration,
    longBreakDuration:
      patch?.pomodoro?.longBreakDuration ?? base.pomodoro.longBreakDuration,
    longBreakInterval:
      patch?.pomodoro?.longBreakInterval ?? base.pomodoro.longBreakInterval,
    autoStartBreak: patch?.pomodoro?.autoStartBreak ?? base.pomodoro.autoStartBreak,
    autoStartFocus: patch?.pomodoro?.autoStartFocus ?? base.pomodoro.autoStartFocus,
    soundEnabled: patch?.pomodoro?.soundEnabled ?? base.pomodoro.soundEnabled,
    soundVolume: patch?.pomodoro?.soundVolume ?? base.pomodoro.soundVolume,
    notificationEnabled:
      patch?.pomodoro?.notificationEnabled ?? base.pomodoro.notificationEnabled,
  },
  stopwatch: {
    defaultGoalTime:
      patch?.stopwatch?.defaultGoalTime ?? base.stopwatch.defaultGoalTime,
    notificationsEnabled:
      patch?.stopwatch?.notificationsEnabled ?? base.stopwatch.notificationsEnabled,
  },
  notifications: {
    transactions:
      patch?.notifications?.transactions ?? base.notifications.transactions,
    monthlyReport:
      patch?.notifications?.monthlyReport ?? base.notifications.monthlyReport,
    checklist: patch?.notifications?.checklist ?? base.notifications.checklist,
  },
});

const ensureUserSettings = async (userId: string) => {
  const existing = await prisma.userSettings.findUnique({ where: { userId } });
  if (existing) {
    return existing;
  }

  const created = await prisma.userSettings.create({
    data: {
      userId,
      ...mapPayloadToDb(DEFAULT_USER_SETTINGS),
    },
  });
  return created;
};

export const userSettingsService = {
  async getUserSettings(userId: string): Promise<UserSettingsPayload> {
    const record = await ensureUserSettings(userId);
    return mapRecordToPayload(record);
  },

  async updateUserSettings(
    userId: string,
    payload: Partial<UserSettingsPayload>
  ): Promise<UserSettingsPayload> {
    const currentRecord = await ensureUserSettings(userId);
    const merged = mergeSettings(mapRecordToPayload(currentRecord), payload);

    const updated = await prisma.userSettings.update({
      where: { userId },
      data: mapPayloadToDb(merged),
    });

    return mapRecordToPayload(updated);
  },
};

export { DEFAULT_USER_SETTINGS };
