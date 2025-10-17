import api from '../../lib/axios';
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  User,
} from '../../types';

// 백엔드 API 응답 형식
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const authApi = {
  // 회원가입
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/api/auth/register', data);
    return response.data.data;
  },

  // 로그인
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/api/auth/login', credentials);
    return response.data.data;
  },

  // 로그아웃
  logout: async (): Promise<void> => {
    await api.post('/api/auth/logout');
  },

  // 현재 사용자 정보 조회
  me: async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>('/api/auth/me');
    return response.data.data;
  },

  // 토큰 갱신
  refresh: async (): Promise<{ accessToken: string }> => {
    const response = await api.post<ApiResponse<{ accessToken: string }>>('/api/auth/refresh');
    return response.data.data;
  },

  // 프로필 수정
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.put<ApiResponse<User>>('/api/auth/profile', data);
    return response.data.data;
  },

  // Google 로그인
  googleLogin: async (credential: string): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/api/auth/google', { credential });
    return response.data.data;
  },
};
