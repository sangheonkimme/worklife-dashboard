"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActionIcon, Menu, Switch, NumberInput, Stack, Text } from "@mantine/core";
import {
  IconBolt,
  IconHistory,
  IconSettings,
  IconPlayerPlay,
  IconPlayerPause,
  IconPlayerStop,
  IconFlag,
  IconDeviceFloppy,
} from "@tabler/icons-react";
import { useStopwatchStore } from "@/store/useStopwatchStore";
import { SaveSessionModal } from "@/components/stopwatch/SaveSessionModal";
import { HistoryPanel } from "@/components/stopwatch/HistoryPanel";

const formatMmSsCs = (ms: number) => {
  const total = Math.max(0, ms);
  const m = Math.floor(total / 60000);
  const s = Math.floor((total % 60000) / 1000);
  const cs = Math.floor((total % 1000) / 10);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(
    cs
  ).padStart(2, "0")}`;
};

export function StopwatchCard() {
  const {
    status,
    elapsedTime,
    laps,
    savedSessions,
    goalTime,
    notificationsEnabled,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    recordLap,
    restoreSession,
    setGoalTime,
    setNotificationsEnabled,
  } = useStopwatchStore();

  const { t } = useTranslation("widgets");
  const [saveModalOpened, setSaveModalOpened] = useState(false);
  const [historyOpened, setHistoryOpened] = useState(false);
  const [goalMin, setGoalMin] = useState<number>(
    goalTime ? Math.floor(goalTime / 60000) : 60
  );

  useEffect(() => {
    restoreSession();
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, [restoreSession]);

  const isRunning = status === "running";
  const maxMs = 3_600_000; // 1시간 기준 ring 채움
  const progress = Math.min(elapsedTime / maxMs, 1);

  const handlePrimary = () => {
    if (isRunning) {
      pauseTimer();
      return;
    }
    if (status === "paused") {
      resumeTimer();
    } else {
      startTimer();
    }
  };

  return (
    <div
      className="wl-paper-card wl-paper-card--stopwatch"
      style={{
        padding: 20,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div className="wl-card-head">
        <div className="wl-card-title wl-card-title--stopwatch">
          <IconBolt size={16} />
          {t("stopwatch.title")}
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {isRunning && <span className="wl-tag wl-tag--live">REC</span>}
          <ActionIcon
            variant="subtle"
            color="dark"
            size="sm"
            onClick={() => setHistoryOpened(true)}
            aria-label={t("stopwatch.actions.openHistory")}
          >
            <IconHistory size={14} />
            {savedSessions.length > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  background: "var(--wl-stopwatch-blue)",
                  color: "white",
                  fontSize: 9,
                  borderRadius: 99,
                  padding: "1px 4px",
                  fontWeight: 700,
                }}
              >
                {savedSessions.length}
              </span>
            )}
          </ActionIcon>
          <Menu shadow="md" width={250}>
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                color="dark"
                size="sm"
                aria-label={t("stopwatch.actions.openSettings")}
              >
                <IconSettings size={14} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>{t("stopwatch.menu.notifications")}</Menu.Label>
              <Menu.Item closeMenuOnClick={false}>
                <Switch
                  label={t("stopwatch.menu.enableNotifications")}
                  checked={notificationsEnabled}
                  onChange={(e) =>
                    setNotificationsEnabled(e.currentTarget.checked)
                  }
                  size="sm"
                />
              </Menu.Item>
              <Menu.Item closeMenuOnClick={false}>
                <Stack gap="xs">
                  <Text size="xs" fw={500}>
                    {t("stopwatch.menu.goalLabel")}
                  </Text>
                  <NumberInput
                    value={goalMin}
                    onChange={(value) => {
                      const m = typeof value === "number" ? value : 0;
                      setGoalMin(m);
                      setGoalTime(m > 0 ? m * 60000 : null);
                    }}
                    min={0}
                    max={999}
                    size="xs"
                    placeholder={t("stopwatch.menu.goalPlaceholder")}
                  />
                </Stack>
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </div>
      </div>

      <CircleStopwatch progress={progress} display={formatMmSsCs(elapsedTime)} />

      <div
        style={{
          display: "flex",
          gap: 8,
          justifyContent: "center",
          marginTop: 14,
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          className="wl-timer-btn wl-timer-btn--primary"
          onClick={handlePrimary}
        >
          {isRunning ? <IconPlayerPause size={12} /> : <IconPlayerPlay size={12} />}
          {isRunning
            ? t("stopwatch.actions.pause")
            : status === "paused"
            ? t("stopwatch.actions.resume")
            : t("stopwatch.actions.start")}
        </button>
        <button
          type="button"
          className="wl-timer-btn"
          onClick={recordLap}
          disabled={status === "idle"}
        >
          <IconFlag size={12} />
          {t("stopwatch.actions.recordLap")}
        </button>
        <button type="button" className="wl-timer-btn" onClick={resetTimer}>
          <IconPlayerStop size={12} />
        </button>
      </div>

      <div className="wl-card-foot">
        {t("stopwatch.labels.lapsValue", { count: laps.length })}
      </div>

      {(status !== "idle" || elapsedTime > 0 || laps.length > 0) && (
        <button
          type="button"
          className="wl-timer-btn"
          onClick={() => setSaveModalOpened(true)}
          style={{ marginTop: 8, alignSelf: "stretch", justifyContent: "center" }}
        >
          <IconDeviceFloppy size={12} />
          {t("stopwatch.buttons.saveSession")}
        </button>
      )}

      <SaveSessionModal
        opened={saveModalOpened}
        onClose={() => setSaveModalOpened(false)}
      />
      <HistoryPanel
        opened={historyOpened}
        onClose={() => setHistoryOpened(false)}
      />
    </div>
  );
}

/** 스톱워치 전용 — 트랙만 보이고 진행은 채우지 않음 (시간이 비결정적이라) */
function CircleStopwatch({
  progress,
  display,
}: {
  progress: number;
  display: string;
}) {
  const size = 170;
  const strokeWidth = 4;
  const radius = size / 2 - strokeWidth - 4;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - circumference * progress;

  return (
    <div className="wl-timer-circle" style={{ width: size, height: size }}>
      <svg width={size} height={size} aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(44,94,139,0.18)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--wl-stopwatch-blue)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.2s linear" }}
        />
      </svg>
      <div className="wl-timer-time wl-timer-time--stopwatch">{display}</div>
    </div>
  );
}
