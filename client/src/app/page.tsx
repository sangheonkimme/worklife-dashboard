import type { Metadata } from "next";
import LandingPage from "@/components/marketing/LandingPage";

export const metadata: Metadata = {
  title: "워크라이프 대시보드 | Worklife Dashboard",
  description:
    "직장인과 학생을 위한 워크·라이프 기록 플랫폼. 루틴을 통합하고 언제든 꺼내볼 수 있는 대시보드를 Next.js로 제공합니다.",
};

const HomePage = () => {
  return <LandingPage />;
};

export default HomePage;
