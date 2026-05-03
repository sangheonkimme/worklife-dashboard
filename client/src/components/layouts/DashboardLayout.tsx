"use client";

import type { ReactNode } from "react";
import { RedesignedShell } from "@/components/dashboard/redesign/RedesignedShell";
import { PomodoroWidget } from "@/components/pomodoro/PomodoroWidget";
import { StopwatchWidget } from "@/components/stopwatch/StopwatchWidget";

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <RedesignedShell>
      {children}
      {/* 플로팅 위젯은 대시보드 외 페이지에서만 표시 (각 컴포넌트 내부에서 path 체크) */}
      <PomodoroWidget />
      <StopwatchWidget />
    </RedesignedShell>
  );
};
