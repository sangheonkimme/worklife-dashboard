import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Gaegu, JetBrains_Mono } from "next/font/google";
import { AppProviders } from "./providers";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import "@/styles/design-tokens.css";
import "@/styles/dashboard-redesign.css";

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

const fontHand = Gaegu({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-hand",
  display: "swap",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.worklife-dashboard.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
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
    url: siteUrl,
    siteName: "Worklife Dashboard",
    locale: "ko_KR",
    type: "website",
  },
  alternates: {
    canonical: "https://www.worklife-dashboard.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${fontSans.variable} ${fontHand.variable} ${fontMono.variable}`}
    >
      <body>
        <AppProviders>{children}</AppProviders>
        <SpeedInsights />
      </body>
    </html>
  );
}
