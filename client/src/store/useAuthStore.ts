import { create } from "zustand";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  clearUser: () => void;
  updateUser: (userData: Partial<User>) => void;
}

// httpOnly 쿠키는 JavaScript에서 접근 불가
// 초기 인증 상태는 false로 시작하고, /api/auth/me 호출 결과로 업데이트
// SSR에서는 middleware가 쿠키를 확인하고, CSR에서는 useAuth 훅이 상태를 복원
export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: true }),
  clearUser: () => set({ user: null, isAuthenticated: false }),
  updateUser: (userData) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...userData } : null,
    })),
}));
