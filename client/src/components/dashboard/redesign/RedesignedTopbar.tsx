"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  IconBell,
  IconMoon,
  IconSearch,
  IconSun,
} from "@tabler/icons-react";
import { useMantineColorScheme } from "@mantine/core";
import { useAuth } from "@/hooks/useAuth";
import { useUiStore } from "@/store/useUiStore";

const formatToday = (locale: string) => {
  const d = new Date();
  if (locale.startsWith("ko")) {
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();
    const dow = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
    return `${y}년 ${m}월 ${day}일 (${dow})`;
  }
  return d.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
};

export function RedesignedTopbar() {
  const { t, i18n } = useTranslation("dashboard");
  const { user } = useAuth();
  const colorScheme = useUiStore((s) => s.colorScheme);
  const setColorSchemePreference = useUiStore(
    (s) => s.setColorSchemePreference
  );
  const { setColorScheme } = useMantineColorScheme();
  const [today, setToday] = useState("");

  useEffect(() => {
    setToday(formatToday(i18n.language || "ko"));
  }, [i18n.language]);

  const greetingName = user?.name?.trim() || t("topbar.guestName");
  const isDark = colorScheme === "dark";

  const toggleScheme = () => {
    const next = isDark ? "light" : "dark";
    setColorSchemePreference(next);
    setColorScheme(next);
  };

  return (
    <header className="wl-topbar">
      <div>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em" }}>
          {t("topbar.greeting", { name: greetingName })}{" "}
          <span className="wl-hand">— {t("topbar.handTagline")}</span>
        </h1>
        <div className="wl-topbar-sub">
          {today} ·{" "}
          {t("topbar.subtitleDetail", { events: 4, pomodoros: 1 })}
        </div>
      </div>

      <div className="wl-topbar-actions">
        <label className="wl-search">
          <IconSearch size={14} />
          <input
            type="search"
            placeholder={t("topbar.searchPlaceholder")}
            aria-label={t("topbar.searchPlaceholder")}
          />
          <kbd>⌘K</kbd>
        </label>
        <button
          type="button"
          className="wl-icon-btn"
          onClick={toggleScheme}
          aria-label={t(
            isDark ? "topbar.actions.lightMode" : "topbar.actions.darkMode"
          )}
        >
          {isDark ? <IconSun size={16} /> : <IconMoon size={16} />}
        </button>
        <button
          type="button"
          className="wl-icon-btn"
          aria-label={t("topbar.actions.notifications")}
        >
          <IconBell size={16} />
        </button>
      </div>
    </header>
  );
}
