import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { notifications } from "@mantine/notifications";
import { authApi } from "../services/api/authApi";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setUser, clearUser } from "../store/slices/authSlice";
import type { LoginCredentials, RegisterData } from "../types";

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAppSelector((state) => state.auth);

  // 현재 사용자 정보 조회
  const { data: currentUser, isLoading, error } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: authApi.me,
    enabled: !!localStorage.getItem("accessToken"),
    retry: false,
    retryOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  });

  // API 에러 처리
  useEffect(() => {
    if (error) {
      // 네트워크 에러인지 확인
      const isNetworkError = !window.navigator.onLine || error.message.includes("Network Error");

      notifications.show({
        title: "인증 오류",
        message: isNetworkError
          ? "네트워크 연결을 확인해주세요. 인터넷에 연결되어 있는지 확인하세요."
          : "사용자 정보를 불러오는데 실패했습니다. 다시 로그인해주세요.",
        color: "red",
        autoClose: 5000,
      });

      // 에러 발생 시 로그인 페이지로 이동
      localStorage.removeItem("accessToken");
      dispatch(clearUser());
      navigate("/login");
    }
  }, [error, dispatch, navigate]);

  // 리프레시 후에도 Redux에 사용자 정보를 채워 넣어 인증 상태를 복원
  useEffect(() => {
    if (currentUser) {
      dispatch(setUser(currentUser));
    }
  }, [currentUser, dispatch]);

  // 로그인 mutation
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      localStorage.setItem("accessToken", data.accessToken);
      dispatch(setUser(data.user));
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      navigate("/dashboard");
    },
  });

  // 회원가입 mutation
  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      localStorage.setItem("accessToken", data.accessToken);
      dispatch(setUser(data.user));
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      navigate("/dashboard");
    },
  });

  // 로그아웃 mutation
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      localStorage.removeItem("accessToken");
      dispatch(clearUser());
      queryClient.clear();
      navigate("/login");
    },
  });

  // Google 로그인 mutation
  const googleLoginMutation = useMutation({
    mutationFn: authApi.googleLogin,
    onSuccess: (data) => {
      localStorage.setItem("accessToken", data.accessToken);
      dispatch(setUser(data.user));
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      navigate("/dashboard");
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

  // Redux 또는 서버에서 가져온 사용자 중 하나라도 있으면 인증된 것으로 간주
  const effectiveUser = user || currentUser || null;
  const effectiveIsAuthenticated = Boolean(
    effectiveUser || localStorage.getItem("accessToken")
  );

  return {
    user: effectiveUser,
    isAuthenticated: effectiveIsAuthenticated,
    isLoading,
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
