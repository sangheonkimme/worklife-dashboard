"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  IconPlayerPlay,
  IconPlayerPause,
  IconPlayerStop,
  IconFlame,
} from "@tabler/icons-react";
import {
  usePomodoroStore,
  requestNotificationPermission,
} from "@/store/usePomodoroStore";
import { unlockAudio } from "@/utils/audio";
import { CircleTimer } from "@/components/dashboard/redesign/CircleTimer";

const formatMmSs = (sec: number) => {
  const total = Math.max(0, Math.floor(sec));
  const m = String(Math.floor(total / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${m}:${s}`;
};

export function PomodoroTimerCard() {
  const {
    status,
    sessionType,
    remainingTime,
    totalDuration,
    completedSessions,
    settings,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    switchSession,
    restoreSession,
  } = usePomodoroStore();
  const { t } = useTranslation("widgets");

  useEffect(() => {
    restoreSession();
    requestNotificationPermission();
  }, [restoreSession]);

  const isRunning = status === "running";
  const progress = totalDuration > 0 ? remainingTime / totalDuration : 0;
  const focusMin = Math.round(settings.focusDuration / 60);
  const breakMin = Math.round(settings.shortBreakDuration / 60);

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

  return (
    <div
      className="wl-paper-card wl-paper-card--pomodoro"
      style={{
        padding: 20,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div className="wl-card-head">
        <div className="wl-card-title wl-card-title--accent">
          <IconFlame size={16} />
          {t("pomodoro.title")}
        </div>
        <span className="wl-tag">
          {t("pomodoro.badges.completed", { count: completedSessions })}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 6,
          marginBottom: 4,
        }}
      >
        <button
          type="button"
          className={`wl-preset${sessionType === "FOCUS" ? " wl-preset--on" : ""}`}
          onClick={() => switchSession("FOCUS")}
          disabled={isRunning}
        >
          {t("pomodoro.sessionLabels.focus")} {focusMin}
        </button>
        <button
          type="button"
          className={`wl-preset${
            sessionType === "SHORT_BREAK" ? " wl-preset--on" : ""
          }`}
          onClick={() => switchSession("SHORT_BREAK")}
          disabled={isRunning}
        >
          {t("pomodoro.sessionLabels.shortBreak")} {breakMin}
        </button>
      </div>

      <CircleTimer
        progress={progress}
        color="var(--wl-red)"
        trackColor="rgba(226,92,77,0.18)"
      >
        <span className="wl-timer-time wl-timer-time--pomodoro">
          {formatMmSs(remainingTime)}
        </span>
        <small>
          {sessionType === "FOCUS"
            ? t("pomodoro.sessionLabels.focus")
            : sessionType === "SHORT_BREAK"
            ? t("pomodoro.sessionLabels.shortBreak")
            : t("pomodoro.sessionLabels.longBreak")}
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
          {isRunning
            ? t("pomodoro.actions.pause")
            : status === "paused"
            ? t("pomodoro.actions.resume")
            : t("pomodoro.actions.start")}
        </button>
        {(status === "running" || status === "paused") && (
          <button type="button" className="wl-timer-btn" onClick={stopTimer}>
            <IconPlayerStop size={12} />
            {t("pomodoro.actions.stop")}
          </button>
        )}
      </div>

      <div className="wl-card-foot">
        {t("pomodoro.badges.today")} — {completedSessions * focusMin}
        분 집중
      </div>
    </div>
  );
}
