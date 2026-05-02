"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { authApi } from "@/services/api/authApi";
import type { LoginCredentials, RegisterData } from "@/types";

export const useAuth = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, status } = useSession();

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";
  const user = session?.user ?? null;

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const result = await signIn("credentials", {
        email: credentials.email,
        password: credentials.password,
        redirect: false,
      });
      if (!result || result.error) {
        throw new Error(result?.error ?? "로그인에 실패했습니다");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      router.push("/dashboard");
      router.refresh();
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      await authApi.register(data);
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      if (!result || result.error) {
        throw new Error(result?.error ?? "회원가입 후 로그인에 실패했습니다");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      router.push("/dashboard");
      router.refresh();
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await signOut({ redirect: false });
    },
    onSuccess: () => {
      queryClient.clear();
      router.push("/login");
      router.refresh();
    },
  });

  const googleLogin = async () => {
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    googleLogin,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    googleLoginError: null,
    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
    isGoogleLoginLoading: false,
  };
};
