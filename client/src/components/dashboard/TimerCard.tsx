"use client";

import { useEffect } from "react";
import { ActionIcon } from "@mantine/core";
import {
  IconPlayerPlay,
  IconPlayerPause,
  IconRotate,
  IconSettings,
  IconTarget,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { useTimerStore } from "@/store/useTimerStore";
import { unlockAudio } from "@/utils/audio";
import { CircleTimer } from "@/components/dashboard/redesign/CircleTimer";

const PRESETS_MIN = [1, 5, 10, 15, 25] as const;

const formatMmSs = (ms: number) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = String(Math.floor(total / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${m}:${s}`;
};

export function TimerCard() {
  const { t } = useTranslation("widgets");

  const status = useTimerStore((s) => s.status);
  const totalMs = useTimerStore((s) => s.totalMs);
  const remainingMs = useTimerStore((s) => s.remainingMs);
  const startTimer = useTimerStore((s) => s.startTimer);
  const pauseTimer = useTimerStore((s) => s.pauseTimer);
  const resumeTimer = useTimerStore((s) => s.resumeTimer);
  const resetTimer = useTimerStore((s) => s.resetTimer);
  const setPreset = useTimerStore((s) => s.setPreset);
  const restoreTimer = useTimerStore((s) => s.restoreTimer);

  useEffect(() => {
    restoreTimer();
  }, [restoreTimer]);

  const isRunning = status === "running";
  const progress = totalMs > 0 ? remainingMs / totalMs : 0;

  const handlePrimary = () => {
    if (isRunning) {
      pauseTimer();
      return;
    }
    unlockAudio();
    if (status === "paused") {
      resumeTimer();
    } else {
      startTimer();
    }
  };

  const presetMs = (m: number) => m * 60 * 1000;

  return (
    <div
      className="wl-paper-card"
      style={{ padding: 20, height: "100%", display: "flex", flexDirection: "column" }}
    >
      <div className="wl-card-head">
        <div className="wl-card-title">
          <IconTarget size={16} />
          {t("timer.title")}
        </div>
        <ActionIcon
          variant="subtle"
          color="dark"
          size="sm"
          aria-label={t("timer.aria.openSettings")}
        >
          <IconSettings size={14} />
        </ActionIcon>
      </div>

      <CircleTimer
        progress={progress}
        color="var(--wl-ink)"
        trackColor="var(--wl-line)"
      >
        {formatMmSs(remainingMs)}
        <small>
          {t("timer.display.total", { time: formatMmSs(totalMs) })}
        </small>
      </CircleTimer>

      <div
        style={{
          display: "flex",
          gap: 8,
          justifyContent: "center",
          marginTop: 14,
        }}
      >
        <button
          type="button"
          className="wl-timer-btn wl-timer-btn--primary"
          onClick={handlePrimary}
        >
          {isRunning ? <IconPlayerPause size={12} /> : <IconPlayerPlay size={12} />}
          {isRunning ? t("timer.buttons.pause") : t("timer.buttons.start")}
        </button>
        <button type="button" className="wl-timer-btn" onClick={resetTimer}>
          <IconRotate size={12} />
          {t("timer.buttons.reset")}
        </button>
      </div>

      <div className="wl-card-foot">
        {t("timer.sections.quickPresetsDescription")}
      </div>

      <div
        style={{
          display: "flex",
          gap: 6,
          marginTop: 10,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {PRESETS_MIN.map((m) => {
          const ms = presetMs(m);
          const active = totalMs === ms && status === "idle";
          return (
            <button
              key={m}
              type="button"
              className={`wl-preset${active ? " wl-preset--on" : ""}`}
              onClick={() => setPreset(ms)}
            >
              {m}M
            </button>
          );
        })}
      </div>
    </div>
  );
}
