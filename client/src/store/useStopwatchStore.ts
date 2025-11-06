import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Lap, SavedSession, StopwatchStatus } from '@/types/stopwatch';

interface StopwatchState {
  // 타이머 상태
  status: StopwatchStatus;
  elapsedTime: number; // 밀리초
  laps: Lap[];

  // 세션 정보
  sessionStartedAt: string | null; // ISO string
  lastTickAt: string | null; // ISO string

  // 위젯 표시
  isWidgetVisible: boolean;

  // 로컬 히스토리 (최대 100개)
  savedSessions: SavedSession[];

  // 액션
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  recordLap: () => void;
  tick: () => void; // 10ms마다 호출

  // 히스토리 관리
  saveCurrentSession: (name?: string, notes?: string) => void;
  deleteSavedSession: (id: string) => void;
  clearHistory: () => void;

  // 세션 복원
  restoreSession: () => void;
  setWidgetVisible: (visible: boolean) => void;

  // 통계 계산
  getFastestLap: () => Lap | null;
  getSlowestLap: () => Lap | null;
  getAverageLapTime: () => number;
}

// 타이머 인터벌 ID (전역)
let intervalId: number | null = null;

export const useStopwatchStore = create<StopwatchState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      status: 'idle',
      elapsedTime: 0,
      laps: [],
      sessionStartedAt: null,
      lastTickAt: null,
      isWidgetVisible: true,
      savedSessions: [],

      // 타이머 시작
      startTimer: () => {
        if (intervalId) return; // 이미 실행 중

        const now = new Date().toISOString();
        set({
          status: 'running',
          sessionStartedAt: get().sessionStartedAt || now,
          lastTickAt: now,
        });

        // 10ms마다 업데이트 (더 정확한 시간 측정)
        intervalId = window.setInterval(() => {
          get().tick();
        }, 10);
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
        }, 10);
      },

      // 타이머 중지/리셋
      resetTimer: () => {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
        set({
          status: 'idle',
          elapsedTime: 0,
          laps: [],
          sessionStartedAt: null,
          lastTickAt: null,
        });
      },

      // 랩 타임 기록
      recordLap: () => {
        const { elapsedTime, laps } = get();
        const lapNumber = laps.length + 1;
        const lastLapTime = laps.length > 0 ? laps[laps.length - 1].totalTime : 0;

        const newLap: Lap = {
          id: `lap-${Date.now()}`,
          lapNumber,
          totalTime: elapsedTime,
          lapTime: elapsedTime - lastLapTime,
          timestamp: new Date().toISOString(),
        };

        set((state) => ({
          laps: [...state.laps, newLap],
        }));
      },

      // 1초마다 호출 (10ms 단위)
      tick: () => {
        set((state) => ({
          elapsedTime: state.elapsedTime + 10,
          lastTickAt: new Date().toISOString(),
        }));
      },

      // 현재 세션 저장 (로컬 히스토리)
      saveCurrentSession: (name?: string, notes?: string) => {
        const { elapsedTime, laps, sessionStartedAt, savedSessions } = get();

        if (!sessionStartedAt) {
          console.error('[Stopwatch] No session to save');
          return;
        }

        const newSession: SavedSession = {
          id: `session-${Date.now()}`,
          duration: elapsedTime,
          laps: [...laps],
          name,
          notes,
          createdAt: new Date().toISOString(),
        };

        // 최대 100개 세션만 유지
        const updatedSessions = [newSession, ...savedSessions].slice(0, 100);

        set({ savedSessions: updatedSessions });

        console.log('[Stopwatch] Session saved to localStorage');

        // 저장 후 리셋
        get().resetTimer();
      },

      // 저장된 세션 삭제
      deleteSavedSession: (id: string) => {
        set((state) => ({
          savedSessions: state.savedSessions.filter((s) => s.id !== id),
        }));
      },

      // 전체 히스토리 삭제
      clearHistory: () => {
        set({ savedSessions: [] });
      },

      // 새로고침 시 세션 복원
      restoreSession: () => {
        const { status, sessionStartedAt, lastTickAt, elapsedTime } = get();

        // running 또는 paused 상태이고 sessionStartedAt이 있으면 복원
        if (
          (status === 'running' || status === 'paused') &&
          sessionStartedAt &&
          lastTickAt
        ) {
          const now = new Date();
          const lastTick = new Date(lastTickAt);
          const elapsedMs = now.getTime() - lastTick.getTime();

          // 경과 시간만큼 elapsedTime에 추가
          const newElapsedTime = elapsedTime + elapsedMs;

          console.log('[Stopwatch] Session restored:', {
            status,
            elapsedMs,
            oldElapsedTime: elapsedTime,
            newElapsedTime,
          });

          set({ elapsedTime: newElapsedTime });

          // running 상태였다면 타이머 재개
          if (status === 'running') {
            if (intervalId) {
              clearInterval(intervalId);
              intervalId = null;
            }

            const now = new Date().toISOString();
            set({ lastTickAt: now });

            intervalId = window.setInterval(() => {
              get().tick();
            }, 10);

            console.log('[Stopwatch] Timer resumed after page reload');
          }
        }
      },

      // 위젯 표시/숨김
      setWidgetVisible: (visible: boolean) => {
        set({ isWidgetVisible: visible });
      },

      // 가장 빠른 랩 찾기
      getFastestLap: () => {
        const { laps } = get();
        if (laps.length === 0) return null;

        return laps.reduce((fastest, lap) =>
          lap.lapTime < fastest.lapTime ? lap : fastest
        );
      },

      // 가장 느린 랩 찾기
      getSlowestLap: () => {
        const { laps } = get();
        if (laps.length === 0) return null;

        return laps.reduce((slowest, lap) =>
          lap.lapTime > slowest.lapTime ? lap : slowest
        );
      },

      // 평균 랩 타임 계산
      getAverageLapTime: () => {
        const { laps } = get();
        if (laps.length === 0) return 0;

        const totalLapTime = laps.reduce((sum, lap) => sum + lap.lapTime, 0);
        return totalLapTime / laps.length;
      },
    }),
    {
      name: 'stopwatch-storage',
      // 모든 상태를 localStorage에 저장 (세션 복원을 위해)
      partialize: (state) => ({
        status: state.status,
        elapsedTime: state.elapsedTime,
        laps: state.laps,
        sessionStartedAt: state.sessionStartedAt,
        lastTickAt: state.lastTickAt,
        isWidgetVisible: state.isWidgetVisible,
        savedSessions: state.savedSessions,
      }),
    }
  )
);
