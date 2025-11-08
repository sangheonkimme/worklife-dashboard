import { create } from "zustand";
import { persist } from "zustand/middleware";
import { notifications } from "@mantine/notifications";
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
  tick: () => void;
  restoreTimer: () => void;
}

const DEFAULT_PRESETS = [5, 10, 15, 30].map((min) => min * 60 * 1000);
const DEFAULT_TOTAL = DEFAULT_PRESETS[1]; // 10분

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
        const target = remainingMs > 0 ? remainingMs : totalMs;
        if (target <= 0) {
          notifications.show({
            title: "시간을 설정해주세요",
            message: "1초 이상의 시간을 설정해야 타이머를 시작할 수 있습니다.",
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
        set({
          totalMs: milliseconds,
          remainingMs: milliseconds,
          status: "idle",
          lastUpdatedAt: null,
          preAlertTriggered: false,
        });
      },

      setCustomDuration: (milliseconds) => {
        const safeMs = Math.max(0, milliseconds);
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
          notifications.show({
            title: "타이머 알림",
            message: `${Math.floor(settings.preAlertMs / 1000)}초 후에 타이머가 종료됩니다.`,
            color: "yellow",
          });
          showBrowserNotification(
            "타이머 알림",
            "곧 타이머가 종료됩니다. 준비하세요!"
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
              title: "타이머 완료",
              message: "설정한 시간이 모두 경과했습니다.",
              color: "green",
            });
            showBrowserNotification(
              "타이머 완료",
              "설정한 타이머가 종료되었습니다."
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
