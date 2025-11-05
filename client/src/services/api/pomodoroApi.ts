import api from '@/lib/axios';
import type {
  ApiResponse,
  CreateSessionRequest,
  PomodoroSession,
  PomodoroSettings,
  PomodoroStats,
  SessionsQuery,
  SessionsResponse,
  StatsPeriod,
  UpdateSettingsRequest,
} from '@/types/pomodoro';

/**
 * 포모도로 통계 조회
 */
export const getStats = async (
  period: StatsPeriod = 'today'
): Promise<PomodoroStats> => {
  const response = await api.get<ApiResponse<PomodoroStats>>(
    `/api/pomodoro/stats`,
    {
      params: { period },
    }
  );
  return response.data.data;
};

/**
 * 포모도로 세션 목록 조회
 */
export const getSessions = async (
  query: SessionsQuery = {}
): Promise<SessionsResponse> => {
  const response = await api.get<ApiResponse<SessionsResponse>>(
    `/api/pomodoro/sessions`,
    {
      params: query,
    }
  );
  return response.data.data;
};

/**
 * 포모도로 세션 생성
 */
export const createSession = async (
  data: CreateSessionRequest
): Promise<PomodoroSession> => {
  const response = await api.post<ApiResponse<PomodoroSession>>(
    `/api/pomodoro/sessions`,
    data
  );
  return response.data.data;
};

/**
 * 포모도로 설정 조회
 */
export const getSettings = async (): Promise<PomodoroSettings> => {
  const response = await api.get<ApiResponse<PomodoroSettings>>(
    `/api/pomodoro/settings`
  );
  return response.data.data;
};

/**
 * 포모도로 설정 업데이트
 */
export const updateSettings = async (
  data: UpdateSettingsRequest
): Promise<PomodoroSettings> => {
  const response = await api.put<ApiResponse<PomodoroSettings>>(
    `/api/pomodoro/settings`,
    data
  );
  return response.data.data;
};
