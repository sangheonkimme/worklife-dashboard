"use client";

interface ChecklistProgressRingProps {
  completed: number;
  total: number;
  size?: number;
}

export function ChecklistProgressRing({
  completed,
  total,
  size = 60,
}: ChecklistProgressRingProps) {
  const pct = total > 0 ? completed / total : 0;
  const strokeWidth = 5;
  const radius = size / 2 - strokeWidth - 1;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - circumference * pct;

  return (
    <div
      className="wl-progress-ring"
      style={{ width: size, height: size }}
      aria-label={`${Math.round(pct * 100)}% complete`}
      role="img"
    >
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--wl-line)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--wl-ink)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.3s ease" }}
        />
      </svg>
      <div className="wl-progress-ring__pct">{Math.round(pct * 100)}%</div>
    </div>
  );
}
