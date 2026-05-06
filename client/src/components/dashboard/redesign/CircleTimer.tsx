"use client";

import type { ReactNode } from "react";

interface CircleTimerProps {
  /** 0~1 (1 = full ring) */
  progress: number;
  /** SVG 디스플레이 사이즈 (정사각형) */
  size?: number;
  /** 트랙 두께 */
  strokeWidth?: number;
  /** 진행선 색 (CSS color, css var 가능) */
  color?: string;
  /** 트랙 색 */
  trackColor?: string;
  children?: ReactNode;
}

/**
 * 리디자인 톤의 원형 진행 표시 — Mantine 의존 없음.
 * 트랙은 항상 풀 원, 진행선은 strokeDashoffset으로 줄임.
 */
export function CircleTimer({
  progress,
  size = 170,
  strokeWidth = 4,
  color = "var(--wl-ink)",
  trackColor = "var(--wl-line)",
  children,
}: CircleTimerProps) {
  const radius = size / 2 - strokeWidth - 4;
  const circumference = 2 * Math.PI * radius;
  const safe = Math.max(0, Math.min(1, progress));
  const dashOffset = circumference - circumference * safe;

  return (
    <div className="wl-timer-circle" style={{ width: size, height: size }}>
      <svg width={size} height={size} aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.3s linear" }}
        />
      </svg>
      <div className="wl-timer-time">{children}</div>
    </div>
  );
}
