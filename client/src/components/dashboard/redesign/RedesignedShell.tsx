"use client";

import { useEffect, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useMantineColorScheme } from "@mantine/core";
import { useUiStore } from "@/store/useUiStore";
import { RedesignedSidebar } from "./RedesignedSidebar";
import { RedesignedTopbar } from "./RedesignedTopbar";

interface RedesignedShellProps {
  children: ReactNode;
}

export function RedesignedShell({ children }: RedesignedShellProps) {
  const { t } = useTranslation("dashboard");
  const colorScheme = useUiStore((s) => s.colorScheme);
  const { setColorScheme } = useMantineColorScheme();

  useEffect(() => {
    setColorScheme(colorScheme);
  }, [colorScheme, setColorScheme]);

  return (
    <div className="wl-shell">
      <RedesignedSidebar />
      <div className="wl-main">
        <RedesignedTopbar />
        {children}
        <footer className="wl-footer">
          <span>{t("footer.copyright", { year: new Date().getFullYear() })}</span>
          <span>{t("footer.version")}</span>
        </footer>
      </div>
    </div>
  );
}
