import api from "../../lib/axios";
import type {
  ApiResponse,
  RegisterData,
  AuthResponse,
  User,
  UpdateProfilePayload,
} from "../../types";

export const authApi = {
  // 회원가입 — NextAuth 미사용. Express 직접 호출 후 별도로 signIn 진행
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>(
      "/api/auth/register",
      data
    );
    return response.data.data;
  },

  // 프로필 수정
  updateProfile: async (data: UpdateProfilePayload): Promise<User> => {
    const response = await api.put<ApiResponse<User>>(
      "/api/auth/profile",
      data
    );
    return response.data.data;
  },
};
