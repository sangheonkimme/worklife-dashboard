import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SessionType, TimerStatus } from '@/types/pomodoro';
import * as pomodoroApi from '@/services/api/pomodoroApi';
import i18n from '@/lib/i18n';

interface PomodoroSettings {
  focusDuration: number; // 초
  shortBreakDuration: number; // 초
  longBreakDuration: number; // 초
  longBreakInterval: number;
  autoStartBreak: boolean;
  autoStartFocus: boolean;
  soundEnabled: boolean;
  soundVolume: number;
  notificationEnabled: boolean;
}

interface PomodoroState {
  // 타이머 상태
  status: TimerStatus;
  sessionType: SessionType;
  remainingTime: number; // 초
  totalDuration: number; // 초
  completedSessions: number; // 오늘 완료한 포모도로 수
  sessionStartedAt: string | null; // 세션 시작 시간 (ISO string)
  lastTickAt: string | null; // 마지막 tick 시간 (ISO string)
  isWidgetVisible: boolean; // 플로팅 위젯 표시 여부

  // 설정
  settings: PomodoroSettings;

  // 액션
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  tick: () => void;
  completeSession: () => void;
  switchSession: (type: SessionType) => void;
  updateSettings: (settings: Partial<PomodoroSettings>) => void;
  incrementCompletedSessions: () => void;
  reset: () => void;
  restoreSession: () => void; // 새로고침 시 세션 복원
  setWidgetVisible: (visible: boolean) => void; // 위젯 표시/숨김
  hydrateFromUserSettings: (
    settings: Partial<Omit<PomodoroSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ) => void;
}

// 기본 설정
const defaultSettings: PomodoroSettings = {
  focusDuration: 1500, // 25분
  shortBreakDuration: 300, // 5분
  longBreakDuration: 900, // 15분
  longBreakInterval: 4,
  autoStartBreak: false,
  autoStartFocus: false,
  soundEnabled: true,
  soundVolume: 50,
  notificationEnabled: true,
};

// 타이머 인터벌 ID (전역)
let intervalId: number | null = null;

export const usePomodoroStore = create<PomodoroState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      status: 'idle',
      sessionType: 'FOCUS',
      remainingTime: defaultSettings.focusDuration,
      totalDuration: defaultSettings.focusDuration,
      completedSessions: 0,
      sessionStartedAt: null,
      lastTickAt: null,
      isWidgetVisible: true, // 기본적으로 위젯 표시
      settings: defaultSettings,

      // 타이머 시작
      startTimer: () => {
        if (intervalId) return; // 이미 실행 중

        const now = new Date().toISOString();
        set({
          status: 'running',
          sessionStartedAt: get().sessionStartedAt || now,
          lastTickAt: now
        });

        intervalId = window.setInterval(() => {
          get().tick();
        }, 1000);
      },

      // 타이머 일시정지
      pauseTimer: () => {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
        set({ status: 'paused' });
      },

      // 타이머 재개
      resumeTimer: () => {
        if (intervalId) return; // 이미 실행 중

        const now = new Date().toISOString();
        set({ status: 'running', lastTickAt: now });

        intervalId = window.setInterval(() => {
          get().tick();
        }, 1000);
      },

      // 타이머 중지
      stopTimer: () => {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
        const { settings, sessionType } = get();
        const duration =
          sessionType === 'FOCUS'
            ? settings.focusDuration
            : sessionType === 'SHORT_BREAK'
            ? settings.shortBreakDuration
            : settings.longBreakDuration;

        set({
          status: 'idle',
          remainingTime: duration,
          sessionStartedAt: null,
          lastTickAt: null,
        });
      },

      // 1초마다 호출
      tick: () => {
        const { remainingTime } = get();
        const now = new Date().toISOString();

        if (remainingTime <= 0) {
          get().completeSession();
          return;
        }

        set({
          remainingTime: remainingTime - 1,
          lastTickAt: now
        });
      },

      // 세션 완료 처리
      completeSession: () => {
        const { sessionType, totalDuration, settings, sessionStartedAt } = get();

        // 타이머 정지
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }

        // 서버에 세션 기록 (비동기, 에러는 무시)
        if (sessionStartedAt) {
          pomodoroApi
            .createSession({
              type: sessionType,
              duration: totalDuration,
              completed: true,
              startedAt: sessionStartedAt,
              completedAt: new Date().toISOString(),
            })
            .catch((error) => {
              console.error('Failed to save pomodoro session:', error);
            });
        }

        // 알림 표시
        if (settings.notificationEnabled) {
          const notificationTitle = i18n.t('widgets:pomodoro.notifications.title');
          const message =
            sessionType === 'FOCUS'
              ? i18n.t('widgets:pomodoro.notifications.focusComplete')
              : i18n.t('widgets:pomodoro.notifications.breakComplete');

          showNotification(notificationTitle, message);
        }

        // 소리 재생
        if (settings.soundEnabled) {
          playCompletionSound(settings.soundVolume);
        }

        // 집중 세션 완료 시 카운트 증가
        if (sessionType === 'FOCUS') {
          get().incrementCompletedSessions();
        }

        // 다음 세션으로 전환
        const nextType = getNextSessionType(
          sessionType,
          get().completedSessions,
          settings.longBreakInterval
        );
        get().switchSession(nextType);

        // 자동 시작 설정 확인
        if (
          (nextType === 'FOCUS' && settings.autoStartFocus) ||
          (nextType !== 'FOCUS' && settings.autoStartBreak)
        ) {
          // 짧은 딜레이 후 시작 (사용자가 알림을 볼 시간)
          setTimeout(() => {
            get().startTimer();
          }, 1000);
        }
      },

      // 세션 전환
      switchSession: (type: SessionType) => {
        const { settings } = get();
        const duration =
          type === 'FOCUS'
            ? settings.focusDuration
            : type === 'SHORT_BREAK'
            ? settings.shortBreakDuration
            : settings.longBreakDuration;

        set({
          status: 'idle',
          sessionType: type,
          remainingTime: duration,
          totalDuration: duration,
          sessionStartedAt: null,
          lastTickAt: null,
        });
      },

      // 설정 업데이트
      updateSettings: (newSettings: Partial<PomodoroSettings>) => {
        const { settings, sessionType, status } = get();
        const updatedSettings = { ...settings, ...newSettings };

        set({ settings: updatedSettings });

        // 타이머가 idle 상태일 때만 시간 업데이트
        if (status === 'idle') {
          const duration =
            sessionType === 'FOCUS'
              ? updatedSettings.focusDuration
              : sessionType === 'SHORT_BREAK'
              ? updatedSettings.shortBreakDuration
              : updatedSettings.longBreakDuration;

          set({
            remainingTime: duration,
            totalDuration: duration,
          });
        }

        // 서버에 설정 저장 (비동기, 에러는 무시)
        pomodoroApi.updateSettings(newSettings).catch((error) => {
          console.error('Failed to update pomodoro settings:', error);
        });
      },

      // 완료 세션 수 증가
      incrementCompletedSessions: () => {
        set((state) => ({
          completedSessions: state.completedSessions + 1,
        }));
      },

      // 리셋
      reset: () => {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }

        set({
          status: 'idle',
          sessionType: 'FOCUS',
          remainingTime: get().settings.focusDuration,
          totalDuration: get().settings.focusDuration,
          sessionStartedAt: null,
          lastTickAt: null,
        });
      },

      // 새로고침 시 세션 복원
      restoreSession: () => {
        const { status, sessionStartedAt, lastTickAt, remainingTime } = get();

        // running 또는 paused 상태이고 sessionStartedAt이 있으면 복원
        if ((status === 'running' || status === 'paused') && sessionStartedAt && lastTickAt) {
          const now = new Date();
          const lastTick = new Date(lastTickAt);
          const elapsedSeconds = Math.floor((now.getTime() - lastTick.getTime()) / 1000);

          // 경과 시간만큼 remainingTime 차감
          const newRemainingTime = Math.max(0, remainingTime - elapsedSeconds);

          console.log('[Pomodoro] Session restored:', {
            status,
            elapsedSeconds,
            oldRemainingTime: remainingTime,
            newRemainingTime,
          });

          set({ remainingTime: newRemainingTime });

          // 시간이 다 지났으면 완료 처리
          if (newRemainingTime <= 0) {
            get().completeSession();
            return;
          }

          // running 상태였다면 타이머 재개
          if (status === 'running') {
            // 인터벌이 이미 실행 중일 수 있으므로 먼저 정리
            if (intervalId) {
              clearInterval(intervalId);
              intervalId = null;
            }

            const now = new Date().toISOString();
            set({ lastTickAt: now });

            intervalId = window.setInterval(() => {
              get().tick();
            }, 1000);

            console.log('[Pomodoro] Timer resumed after page reload');
          }
        }
      },

      // 위젯 표시/숨김
      setWidgetVisible: (visible: boolean) => {
        set({ isWidgetVisible: visible });
      },

      hydrateFromUserSettings: (externalSettings) => {
        set((state) => {
          const merged = {
            ...state.settings,
            ...externalSettings,
          };

          let nextDuration = merged.focusDuration;
          if (state.sessionType === 'SHORT_BREAK') {
            nextDuration = merged.shortBreakDuration;
          } else if (state.sessionType === 'LONG_BREAK') {
            nextDuration = merged.longBreakDuration;
          }

          if (state.status === 'idle') {
            return {
              settings: merged,
              remainingTime: nextDuration,
              totalDuration: nextDuration,
            };
          }

          return { settings: merged };
        });
      },
    }),
    {
      name: 'pomodoro-storage',
      // 모든 상태를 localStorage에 저장 (세션 복원을 위해)
      partialize: (state) => ({
        status: state.status,
        sessionType: state.sessionType,
        remainingTime: state.remainingTime,
        totalDuration: state.totalDuration,
        completedSessions: state.completedSessions,
        sessionStartedAt: state.sessionStartedAt,
        lastTickAt: state.lastTickAt,
        isWidgetVisible: state.isWidgetVisible,
        settings: state.settings,
      }),
    }
  )
);

/**
 * 다음 세션 타입 결정
 */
function getNextSessionType(
  currentType: SessionType,
  completedSessions: number,
  longBreakInterval: number
): SessionType {
  if (currentType === 'FOCUS') {
    // 집중 후에는 휴식
    if (completedSessions % longBreakInterval === 0 && completedSessions > 0) {
      return 'LONG_BREAK'; // 긴 휴식
    }
    return 'SHORT_BREAK'; // 짧은 휴식
  } else {
    // 휴식 후에는 집중
    return 'FOCUS';
  }
}

/**
 * 브라우저 알림 표시
 */
function showNotification(title: string, body: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/pomodoro-icon.png',
      badge: '/badge-icon.png',
    });
  }
}

/**
 * 완료 소리 재생
 */
function playCompletionSound(volume: number) {
  const audio = new Audio('/sounds/pomodoro-complete.mp3');
  audio.volume = volume / 100;
  audio.play().catch((error) => {
    console.error('Failed to play completion sound:', error);
  });
}

/**
 * 알림 권한 요청
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};
