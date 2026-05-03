"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  IconCalendar,
  IconChevronUpRight,
} from "@tabler/icons-react";

interface CalCell {
  day: number;
  outside: boolean;
  weekday: number;
  hasEvent?: boolean;
  isToday?: boolean;
}

const buildMonthGrid = (year: number, month: number, today: Date): CalCell[] => {
  // month: 1-12
  const first = new Date(year, month - 1, 1);
  const startDow = first.getDay();
  const lastOfMonth = new Date(year, month, 0).getDate();
  const lastOfPrev = new Date(year, month - 1, 0).getDate();
  const cells: CalCell[] = [];

  for (let i = startDow - 1; i >= 0; i--) {
    const day = lastOfPrev - i;
    cells.push({ day, outside: true, weekday: (startDow - 1 - i) % 7 });
  }
  const eventDays = new Set([7, 12, 14, 21, 24, 28]);
  for (let d = 1; d <= lastOfMonth; d++) {
    const dow = new Date(year, month - 1, d).getDay();
    cells.push({
      day: d,
      outside: false,
      weekday: dow,
      hasEvent: eventDays.has(d),
      isToday:
        today.getFullYear() === year &&
        today.getMonth() + 1 === month &&
        today.getDate() === d,
    });
  }
  let nextDay = 1;
  while (cells.length % 7 !== 0 || cells.length < 42) {
    const dow = (cells[cells.length - 1].weekday + 1) % 7;
    cells.push({ day: nextDay++, outside: true, weekday: dow });
    if (cells.length >= 42) break;
  }
  return cells;
};

const EVENTS = [
  { title: "팀 스탠드업", time: "오후 3:00 — 3:30", live: true },
  { title: "저녁 약속 — 한강", time: "오후 7:00", live: false },
];

const QUICK_NOTES = ["헬스장 가는 길에 빵집 들르기", "수요일 회의 자료 미리 보기"];

export function MiniCalendarCard() {
  const { t, i18n } = useTranslation("dashboard");
  const [memo, setMemo] = useState("");

  const today = useMemo(() => new Date(), []);
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const cells = useMemo(
    () => buildMonthGrid(year, month, today),
    [year, month, today]
  );

  const weekdays = i18n.t("calendar.weekdays", {
    returnObjects: true,
    ns: "dashboard",
  }) as string[];
  const safeWeekdays = Array.isArray(weekdays)
    ? weekdays
    : ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <div className="wl-cal-card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: "-0.01em",
            }}
          >
            <IconCalendar size={16} style={{ marginRight: 6, verticalAlign: -2 }} />
            {t("calendar.title", {
              year,
              month: String(month).padStart(2, "0"),
            })}
          </h3>
          <div style={{ fontSize: 12, color: "var(--wl-ink-mute)", marginTop: 2 }}>
            {t("calendar.subtitle", { count: 7 })}
          </div>
        </div>
        <button
          type="button"
          className="wl-icon-btn"
          aria-label={t("calendar.expandAria")}
        >
          <IconChevronUpRight size={16} />
        </button>
      </div>

      <div className="wl-cal-grid">
        {safeWeekdays.map((d, i) => (
          <div
            key={d}
            className={`wl-cal-dow${
              i === 0 ? " wl-cal-dow--sun" : i === 6 ? " wl-cal-dow--sat" : ""
            }`}
          >
            {d}
          </div>
        ))}
        {cells.map((c, i) => {
          const cls = [
            "wl-cal-cell",
            c.outside ? "wl-cal-cell--out" : "",
            c.isToday ? "wl-cal-cell--today" : "",
            !c.outside && c.weekday === 0 && !c.isToday ? "wl-cal-cell--sun" : "",
            !c.outside && c.weekday === 6 && !c.isToday ? "wl-cal-cell--sat" : "",
          ]
            .filter(Boolean)
            .join(" ");
          return (
            <div key={i} className={cls}>
              <span>{c.day}</span>
              {c.hasEvent && <span className="wl-cal-cell__dot" />}
            </div>
          );
        })}
      </div>

      <div>
        {EVENTS.map((ev, i) => (
          <div key={i} className="wl-event">
            <div
              className={`wl-event__bar${i === 1 ? " wl-event__bar--blue" : ""}`}
            />
            <div style={{ flex: 1 }}>
              <div className="wl-event__title">{ev.title}</div>
              <div className="wl-event__time">{ev.time}</div>
            </div>
            {ev.live && <span className="wl-event__tag">곧</span>}
          </div>
        ))}
      </div>

      <div className="wl-quick-memo">
        <span className="wl-hand">{t("calendar.memoLabel")}</span>
        <input
          value={memo}
          onChange={(e) => setMemo(e.currentTarget.value)}
          placeholder={t("calendar.memoPlaceholder")}
        />
        <button type="button">{t("calendar.memoSave")}</button>
      </div>

      <div>
        {QUICK_NOTES.map((n, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "6px 0",
              fontSize: 13,
              color: "var(--wl-ink-soft)",
            }}
          >
            <span
              style={{
                width: 4,
                height: 16,
                background: "var(--wl-yellow)",
                borderRadius: 2,
                flexShrink: 0,
              }}
            />
            <span>· {n}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
