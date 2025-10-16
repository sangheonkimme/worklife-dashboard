import api from '../../lib/axios';
import {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  User,
} from '../../types';

export const authApi = {
  // 회원가입
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/register', data);
    return response.data;
  },

  // 로그인
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/login', credentials);
    return response.data;
  },

  // 로그아웃
  logout: async (): Promise<void> => {
    await api.post('/api/auth/logout');
  },

  // 현재 사용자 정보 조회
  me: async (): Promise<User> => {
    const response = await api.get<User>('/api/auth/me');
    return response.data;
  },

  // 토큰 갱신
  refresh: async (): Promise<{ accessToken: string }> => {
    const response = await api.post<{ accessToken: string }>('/api/auth/refresh');
    return response.data;
  },

  // 프로필 수정
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.put<User>('/api/auth/profile', data);
    return response.data;
  },
};
