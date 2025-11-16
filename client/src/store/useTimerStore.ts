import { create } from "zustand";
import { persist } from "zustand/middleware";
import { notifications } from "@mantine/notifications";
import i18n from "@/lib/i18n";
import type { TimerSettings, TimerStatus } from "@/types/timer";

interface TimerState {
  status: TimerStatus;
  totalMs: number;
  remainingMs: number;
  lastUpdatedAt: number | null;
  settings: TimerSettings;
  preAlertTriggered: boolean;
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  setPreset: (milliseconds: number) => void;
  setCustomDuration: (milliseconds: number) => void;
  setSettings: (settings: Partial<TimerSettings>) => void;
  hydrateFromUserSettings: (settings: TimerSettings) => void;
  tick: () => void;
  restoreTimer: () => void;
}

const MIN_TIMER_DURATION_MS = 30 * 1000; // 30초 기본 최소 지속 시간
const DEFAULT_PRESETS = [5, 10, 15, 30].map((min) => min * 60 * 1000);
const DEFAULT_TOTAL = MIN_TIMER_DURATION_MS;

let timerInterval: number | null = null;

const startInterval = (get: () => TimerState) => {
  if (timerInterval) return;
  timerInterval = window.setInterval(() => {
    get().tick();
  }, 200);
};

const clearIntervalRef = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
};

const showBrowserNotification = (title: string, body: string) => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return;
  }

  if (Notification.permission === "granted") {
    new Notification(title, { body });
  }
};

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      status: "idle",
      totalMs: DEFAULT_TOTAL,
      remainingMs: DEFAULT_TOTAL,
      lastUpdatedAt: null,
      preAlertTriggered: false,
      settings: {
        presets: DEFAULT_PRESETS,
        autoRepeat: false,
        preAlertMs: 60 * 1000,
        notifications: true,
        soundEnabled: true,
      },

      startTimer: () => {
        const { totalMs, remainingMs, status } = get();
        const fallbackDuration = totalMs > 0 ? totalMs : MIN_TIMER_DURATION_MS;
        const target = remainingMs > 0 ? remainingMs : fallbackDuration;
        if (target <= 0) {
          notifications.show({
            title: i18n.t("widgets:timer.notifications.startErrorTitle"),
            message: i18n.t("widgets:timer.notifications.startErrorMessage"),
            color: "yellow",
          });
          return;
        }

        // 이미 실행 중이면 무시
        if (status === "running") {
          return;
        }

        set({
          status: "running",
          remainingMs: target,
          lastUpdatedAt: Date.now(),
          preAlertTriggered: false,
        });
        startInterval(get);
      },

      pauseTimer: () => {
        if (get().status !== "running") return;
        clearIntervalRef();
        set({ status: "paused", lastUpdatedAt: null });
      },

      resumeTimer: () => {
        const { status, remainingMs } = get();
        if (status !== "paused" || remainingMs <= 0) return;
        set({ status: "running", lastUpdatedAt: Date.now() });
        startInterval(get);
      },

      resetTimer: () => {
        clearIntervalRef();
        set((state) => ({
          status: "idle",
          remainingMs: state.totalMs,
          lastUpdatedAt: null,
          preAlertTriggered: false,
        }));
      },

      setPreset: (milliseconds) => {
        clearIntervalRef();
        const safePreset = milliseconds > 0 ? milliseconds : MIN_TIMER_DURATION_MS;
        set({
          totalMs: safePreset,
          remainingMs: safePreset,
          status: "idle",
          lastUpdatedAt: null,
          preAlertTriggered: false,
        });
      },

      setCustomDuration: (milliseconds) => {
        const safeMs = milliseconds > 0 ? milliseconds : MIN_TIMER_DURATION_MS;
        clearIntervalRef();
        set({
          totalMs: safeMs,
          remainingMs: safeMs,
          status: "idle",
          lastUpdatedAt: null,
          preAlertTriggered: false,
        });
      },

      setSettings: (settings) => {
        set((state) => ({
          settings: {
            ...state.settings,
            ...settings,
          },
        }));
      },

      hydrateFromUserSettings: (externalSettings) => {
        set((state) => {
          const mergedSettings: TimerSettings = {
            ...state.settings,
            ...externalSettings,
            presets:
              externalSettings.presets?.length
                ? externalSettings.presets
                : state.settings.presets,
          };

          if (state.status === "idle") {
            const firstPreset = mergedSettings.presets[0];
            const safePresetValue =
              firstPreset && firstPreset > 0
                ? firstPreset
                : MIN_TIMER_DURATION_MS;
            return {
              settings: mergedSettings,
              totalMs: safePresetValue,
              remainingMs: safePresetValue,
              lastUpdatedAt: null,
              preAlertTriggered: false,
              status: "idle" as TimerStatus,
            };
          }

          return {
            settings: mergedSettings,
          };
        });
      },

      tick: () => {
        const {
          status,
          remainingMs,
          lastUpdatedAt,
          settings,
          preAlertTriggered,
        } = get();

        if (status !== "running") return;

        const now = Date.now();
        const last = lastUpdatedAt ?? now;
        const delta = Math.max(0, now - last);
        const nextRemaining = Math.max(remainingMs - delta, 0);

        if (
          !preAlertTriggered &&
          settings.preAlertMs &&
          settings.notifications &&
          nextRemaining <= settings.preAlertMs &&
          nextRemaining > 0
        ) {
          const secondsLeft = Math.floor((settings.preAlertMs ?? 0) / 1000);
          notifications.show({
            title: i18n.t("widgets:timer.notifications.preAlertTitle"),
            message: i18n.t("widgets:timer.notifications.preAlertMessage", {
              seconds: secondsLeft,
            }),
            color: "yellow",
          });
          showBrowserNotification(
            i18n.t("widgets:timer.notifications.preAlertTitle"),
            i18n.t("widgets:timer.notifications.browserPreAlert")
          );
          set({ preAlertTriggered: true });
        }

        if (nextRemaining === 0) {
          clearIntervalRef();
          set({
            remainingMs: 0,
            status: "finished",
            lastUpdatedAt: null,
          });

          if (settings.notifications) {
            notifications.show({
              title: i18n.t("widgets:timer.notifications.completeTitle"),
              message: i18n.t("widgets:timer.notifications.completeMessage"),
              color: "green",
            });
            showBrowserNotification(
              i18n.t("widgets:timer.notifications.completeTitle"),
              i18n.t("widgets:timer.notifications.browserComplete")
            );
          }

          if (settings.autoRepeat && get().totalMs > 0) {
            setTimeout(() => {
              set({
                remainingMs: get().totalMs,
                preAlertTriggered: false,
                status: "idle",
              });
              get().startTimer();
            }, 800);
          }

          return;
        }

        set({
          remainingMs: nextRemaining,
          lastUpdatedAt: now,
        });
      },

      restoreTimer: () => {
        const { status, lastUpdatedAt, remainingMs } = get();
        if (status !== "running" || !lastUpdatedAt) {
          return;
        }

        const now = Date.now();
        const delta = Math.max(0, now - lastUpdatedAt);
        const nextRemaining = Math.max(remainingMs - delta, 0);

        if (nextRemaining === 0) {
          set({
            remainingMs: 0,
            status: "finished",
            lastUpdatedAt: null,
          });
          return;
        }

        set({
          remainingMs: nextRemaining,
          lastUpdatedAt: now,
        });
        startInterval(get);
      },
    }),
    {
      name: "timer-store",
      version: 1,
      partialize: (state) => ({
        status: state.status,
        totalMs: state.totalMs,
        remainingMs: state.remainingMs,
        lastUpdatedAt: state.lastUpdatedAt,
        settings: state.settings,
        preAlertTriggered: state.preAlertTriggered,
      }),
    }
  )
);
