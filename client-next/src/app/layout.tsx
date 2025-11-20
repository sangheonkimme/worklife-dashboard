import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "./providers";

export const metadata: Metadata = {
  metadataBase: new URL("https://worklife-dashboard.example"),
  title: {
    default: "Worklife Dashboard | 워크와 라이프를 잇는 기록 허브",
    template: "%s | Worklife Dashboard",
  },
  description:
    "워크라이프 대시보드는 직장인과 학생이 하루의 기록을 정리하고 공유할 수 있도록 돕는 통합 대시보드입니다.",
  openGraph: {
    title: "Worklife Dashboard",
    description:
      "직장 & 캠퍼스 생활을 모두 챙기는 사람들을 위한 루틴 기반 기록 플랫폼.",
    url: "https://worklife-dashboard.example",
    siteName: "Worklife Dashboard",
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
