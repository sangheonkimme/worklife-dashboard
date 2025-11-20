import type { Metadata } from "next";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import LoginPageClient from "./LoginPageClient";

export const metadata: Metadata = {
  title: "로그인",
  description:
    "워크라이프 대시보드 로그인 페이지 – 직장과 캠퍼스 루틴을 한 번에 불러오세요.",
};

const LoginPage = () => {
  return (
    <AuthLayout>
      <LoginPageClient />
    </AuthLayout>
  );
};

export default LoginPage;
