"use client";

import Link from "next/link";
import { Card, Stack, Text, Group, Button } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { StickyNotes } from "@/components/dashboard/StickyNotes";
import { DashboardChecklist } from "@/components/dashboard/DashboardChecklist";
import { TimerCard } from "@/components/dashboard/TimerCard";
import { PomodoroTimerCard } from "@/components/dashboard/PomodoroTimerCard";
import { StopwatchCard } from "@/components/dashboard/StopwatchCard";
import { ToolsSection } from "@/components/dashboard/redesign/ToolsSection";
import { MoneySummaryCard } from "@/components/dashboard/redesign/MoneySummaryCard";
import { MiniCalendarCard } from "@/components/dashboard/redesign/MiniCalendarCard";

const DashboardPage = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation("dashboard");

  if (!isAuthenticated) {
    return (
      <Card radius="md" padding="lg" withBorder>
        <Stack gap="xs">
          <Text fw={600} size="lg">
            {t("guestCta.title")}
          </Text>
          <Text size="sm" c="dimmed">
            {t("guestCta.description")}
          </Text>
          <Group gap="sm">
            <Button component={Link} href="/login">
              {t("guestCta.login")}
            </Button>
            <Button component={Link} href="/signup" variant="light">
              {t("guestCta.signup")}
            </Button>
          </Group>
        </Stack>
      </Card>
    );
  }

  return (
    <>
      {/* 1. 메모 보드(좌 9/12) + 오늘 체크리스트(우 3/12) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 9fr) minmax(0, 3fr)",
          gap: 18,
          alignItems: "start",
        }}
      >
        <StickyNotes />
        <DashboardChecklist />
      </div>

      {/* 2. 도구 모음 */}
      <ToolsSection />

      {/* 3. 타이머 3종 */}
      <section>
        <div className="wl-section-head">
          <h2 className="wl-section-title">{t("sections.timers")}</h2>
          <Link
            href="/dashboard/settings"
            className="wl-section-link"
          >
            {t("sections.timersSettings")}
          </Link>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          <TimerCard />
          <PomodoroTimerCard />
          <StopwatchCard />
        </div>
      </section>

      {/* 4. 한눈에 보기 — 가계부 + 캘린더 */}
      <section>
        <div className="wl-section-head">
          <h2 className="wl-section-title">{t("sections.overview")}</h2>
          <Link href="/dashboard/transactions" className="wl-section-link">
            {t("sections.overviewMore")}
          </Link>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
            gap: 18,
            alignItems: "start",
          }}
        >
          <MoneySummaryCard />
          <MiniCalendarCard />
        </div>
      </section>
    </>
  );
};

export default DashboardPage;
