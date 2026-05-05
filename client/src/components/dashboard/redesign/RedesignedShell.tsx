"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useMantineColorScheme } from "@mantine/core";
import { useUiStore } from "@/store/useUiStore";
import { RedesignedSidebar } from "./RedesignedSidebar";
import { RedesignedTopbar } from "./RedesignedTopbar";

interface RedesignedShellProps {
  children: ReactNode;
}

// 대시보드 홈에만 인사 토픽바 노출. 하위 페이지는 자체 page-head 사용.
const TOPBAR_ROUTES = new Set(["/dashboard"]);

export function RedesignedShell({ children }: RedesignedShellProps) {
  const { t } = useTranslation("dashboard");
  const pathname = usePathname();
  const colorScheme = useUiStore((s) => s.colorScheme);
  const { setColorScheme } = useMantineColorScheme();

  useEffect(() => {
    setColorScheme(colorScheme);
  }, [colorScheme, setColorScheme]);

  const showTopbar = TOPBAR_ROUTES.has(pathname ?? "");

  return (
    <div className="wl-shell">
      <RedesignedSidebar />
      <div className="wl-main">
        {showTopbar && <RedesignedTopbar />}
        {children}
        <footer className="wl-footer">
          <span>{t("footer.copyright", { year: new Date().getFullYear() })}</span>
          <span>{t("footer.version")}</span>
        </footer>
      </div>
    </div>
  );
}
