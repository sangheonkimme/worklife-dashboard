// 세션 타입
export type SessionType = 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK';

// 타이머 상태
export type TimerStatus = 'idle' | 'running' | 'paused';

// 포모도로 세션
export interface PomodoroSession {
  id: string;
  userId: string;
  type: SessionType;
  duration: number; // 초
  completed: boolean;
  startedAt: string;
  completedAt: string | null;
  taskName?: string;
  tags: string[];
  notes?: string;
  createdAt: string;
}

// 포모도로 설정
export interface PomodoroSettings {
  id: string;
  userId: string;
  focusDuration: number; // 초 (기본 1500 = 25분)
  shortBreakDuration: number; // 초 (기본 300 = 5분)
  longBreakDuration: number; // 초 (기본 900 = 15분)
  longBreakInterval: number; // 긴 휴식 간격 (기본 4)
  autoStartBreak: boolean;
  autoStartFocus: boolean;
  soundEnabled: boolean;
  soundVolume: number; // 0-100
  notificationEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

// 포모도로 통계
export interface PomodoroStats {
  totalSessions: number;
  completedSessions: number;
  totalFocusTime: number; // 초
  todayCompleted: number;
  currentStreak: number; // 연속 달성 일수
  longestStreak: number; // 최장 연속 달성 일수
}

// 세션 생성 요청
export interface CreateSessionRequest {
  type: SessionType;
  duration: number;
  completed: boolean;
  startedAt: string;
  completedAt?: string;
  taskName?: string;
  tags?: string[];
  notes?: string;
}

// 설정 업데이트 요청
export interface UpdateSettingsRequest {
  focusDuration?: number;
  shortBreakDuration?: number;
  longBreakDuration?: number;
  longBreakInterval?: number;
  autoStartBreak?: boolean;
  autoStartFocus?: boolean;
  soundEnabled?: boolean;
  soundVolume?: number;
  notificationEnabled?: boolean;
}

// 통계 조회 쿼리
export type StatsPeriod = 'today' | 'week' | 'month' | 'all';

// 세션 목록 조회 쿼리
export interface SessionsQuery {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
}

// API 응답
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface SessionsResponse {
  sessions: PomodoroSession[];
  total: number;
  hasMore: boolean;
}
