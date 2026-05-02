// 타이머 동시 실행 정책 조정자
// - 일반 타이머 / 포모도로: 카운트다운 → 둘 중 하나가 시작되면 다른 하나는 자동 일시정지
// - 스톱워치: 독립 (다른 두 개와 무관하게 계속 실행)

export type TimerKind = "timer" | "pomodoro" | "stopwatch";

type PauseFn = () => void;

const pauseHandlers = new Map<TimerKind, PauseFn>();

export function registerTimerPauseHandler(kind: TimerKind, pause: PauseFn): void {
  pauseHandlers.set(kind, pause);
}

/**
 * 새 타이머가 시작될 때 호출. 카운트다운 계열은 상호 배타.
 */
export function notifyTimerStarted(kind: TimerKind): void {
  if (kind === "timer") {
    pauseHandlers.get("pomodoro")?.();
  } else if (kind === "pomodoro") {
    pauseHandlers.get("timer")?.();
  }
  // stopwatch는 다른 타이머에 영향 주지 않음
}
