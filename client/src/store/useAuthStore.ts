import { create } from "zustand";
import type { User } from "@/types";
import { getClientAccessToken } from "@/lib/session";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  clearUser: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const hasDocument = typeof document !== "undefined";
const initialAuthenticated = hasDocument
  ? Boolean(getClientAccessToken())
  : false;

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: initialAuthenticated,
  setUser: (user) => set({ user, isAuthenticated: true }),
  clearUser: () => set({ user: null, isAuthenticated: false }),
  updateUser: (userData) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...userData } : null,
    })),
}));
