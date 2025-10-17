import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
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
  const { data: currentUser, isLoading } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: authApi.me,
    enabled: !!localStorage.getItem("accessToken"),
    retry: false,
    staleTime: Infinity,
  });

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
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
  };
};
