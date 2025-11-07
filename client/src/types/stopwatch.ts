/**
 * 스톱워치 타입 정의
 */

/**
 * 랩 타임 데이터
 */
export interface Lap {
  id: string;
  lapNumber: number;
  totalTime: number; // 밀리초 (시작부터 이 랩까지의 총 시간)
  lapTime: number; // 밀리초 (이 랩의 소요 시간)
  timestamp: string; // ISO string
}

/**
 * 저장된 세션 데이터 (로컬 히스토리)
 */
export interface SavedSession {
  id: string;
  duration: number; // 밀리초 (총 경과 시간)
  laps: Lap[];
  name?: string; // 세션 이름 (선택적)
  notes?: string; // 메모 (선택적)
  createdAt: string; // ISO string
}

/**
 * 스톱워치 상태
 */
export type StopwatchStatus = 'idle' | 'running' | 'paused';
