"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { authApi } from "@/services/api/authApi";
import { useAuthStore } from "@/store/useAuthStore";
import type { LoginCredentials, RegisterData, User } from "@/types";
import { clearAccessTokenCookie, persistAccessToken } from "@/lib/session";

export const useAuth = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, setUser, clearUser, isAuthenticated } = useAuthStore();
  const { t } = useTranslation("auth");

  // 현재 사용자 정보 조회
  // httpOnly 쿠키는 JS에서 확인 불가하므로, 항상 /api/auth/me를 호출하여 인증 상태 확인
  // 쿠키가 있으면 서버에서 인증 성공, 없으면 401 반환
  const {
    data: currentUser,
    isLoading,
    error,
    isFetched,
  } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: authApi.me,
    retry: false,
    retryOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!error) return;

    // 401 Unauthorized 에러가 아닌 경우에만 알림 표시
    const is401Error = error.message?.includes("401");

    if (!is401Error) {
      const isNetworkError =
        typeof window !== "undefined" &&
        (!window.navigator.onLine || error.message.includes("Network Error"));

      notifications.show({
        title: t("notifications.errorTitle"),
        message: isNetworkError
          ? t("notifications.networkError")
          : t("notifications.fetchError"),
        color: "red",
        autoClose: 5000,
      });
    }

    // 인증 에러가 발생하면 토큰만 제거하고 로그인 페이지로 리다이렉트하지 않음
    void clearAccessTokenCookie();
    clearUser();
  }, [error, clearUser, t]);

  // 리프레시 후에도 Zustand에 사용자 정보를 채워 넣어 인증 상태를 복원
  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
    }
  }, [currentUser, setUser]);

  // 로그인 mutation
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: async (data, variables) => {
      await persistAccessToken(data.accessToken, variables.rememberMe);
      setUser(data.user);
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      router.push("/dashboard");
    },
  });

  // 회원가입 mutation
  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: async (data) => {
      await persistAccessToken(data.accessToken);
      setUser(data.user);
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      router.push("/dashboard");
    },
  });

  // 로그아웃 mutation
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: async () => {
      await clearAccessTokenCookie();
      clearUser();
      queryClient.clear();
      router.push("/login");
    },
  });

  // Google 로그인 mutation
  const googleLoginMutation = useMutation({
    mutationFn: authApi.googleLogin,
    onSuccess: async (data) => {
      await persistAccessToken(data.accessToken);
      setUser(data.user);
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      router.push("/dashboard");
    },
  });

  // 로그인 함수
  const login = async (credentials: LoginCredentials) => {
    return loginMutation.mutateAsync(credentials);
  };

  // 회원가입 함수
  const register = async (data: RegisterData) => {
    return registerMutation.mutateAsync(data);
  };

  // 로그아웃 함수
  const logout = async () => {
    return logoutMutation.mutateAsync();
  };

  // Google 로그인 함수
  const googleLogin = async (credential: string) => {
    return googleLoginMutation.mutateAsync(credential);
  };

  // Zustand 또는 서버에서 가져온 사용자 중 하나라도 있으면 인증된 것으로 간주
  const effectiveUser: User | null = user || currentUser || null;
  const effectiveIsAuthenticated = Boolean(effectiveUser) || isAuthenticated;

  return {
    user: effectiveUser,
    isAuthenticated: effectiveIsAuthenticated,
    isLoading,
    isFetched, // 인증 확인 완료 여부 (로딩 UI 제어용)
    login,
    register,
    logout,
    googleLogin,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    googleLoginError: googleLoginMutation.error,
    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
    isGoogleLoginLoading: googleLoginMutation.isPending,
  };
};
