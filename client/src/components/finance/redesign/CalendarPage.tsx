"use client";

import { useMemo, useState } from "react";
import {
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconPencil,
} from "@tabler/icons-react";
import { AuthRequiredWrapper } from "@/components/auth/AuthRequiredWrapper";
import { DayDetailPanel, type DayPanelTarget } from "./DayDetailPanel";

interface CalEvent {
  title: string;
  color: string;
  time: string;
}

interface UpcomingEvent {
  day: string;
  title: string;
  time: string;
  color: string;
  live?: boolean;
}

const MOCK_EVENTS: Record<number, CalEvent[]> = {
  3: [{ title: "필라테스", color: "#8ec0d6", time: "07:00" }],
  7: [
    { title: "디자인 리뷰", color: "var(--wl-red)", time: "14:00" },
    { title: "저녁 약속", color: "#e8c84a", time: "19:00" },
  ],
  12: [{ title: "월급 입금", color: "#4a8d5a", time: "" }],
  15: [{ title: "치과 예약", color: "var(--wl-ink)", time: "10:30" }],
  21: [{ title: "팀 워크샵", color: "var(--wl-red)", time: "종일" }],
  24: [{ title: "엄마 생신", color: "#e89aac", time: "저녁" }],
  28: [{ title: "포트폴리오 마감", color: "var(--wl-red)", time: "23:59" }],
};

const MOCK_UPCOMING: UpcomingEvent[] = [
  { day: "오늘 · 11.02", title: "팀 스탠드업", time: "오후 3:00 — 3:30", color: "var(--wl-red)", live: true },
  { day: "오늘 · 11.02", title: "저녁 약속 — 한강", time: "오후 7:00", color: "var(--wl-ink)" },
  { day: "내일 · 11.03", title: "필라테스", time: "오전 7:00", color: "#8ec0d6" },
  { day: "11.07 토", title: "디자인 리뷰", time: "오후 2:00", color: "var(--wl-red)" },
  { day: "11.07 토", title: "저녁 약속", time: "오후 7:00", color: "#e8c84a" },
  { day: "11.12 목", title: "월급 입금", time: "정기", color: "#4a8d5a" },
];

const DOW = ["일", "월", "화", "수", "목", "금", "토"];
const MONTH_NAMES = [
  "1월", "2월", "3월", "4월", "5월", "6월",
  "7월", "8월", "9월", "10월", "11월", "12월",
];

const LEGEND: { label: string; color: string }[] = [
  { label: "업무", color: "var(--wl-red)" },
  { label: "개인", color: "#e89aac" },
  { label: "운동", color: "#8ec0d6" },
  { label: "금융", color: "#4a8d5a" },
  { label: "기타", color: "var(--wl-ink-soft)" },
];

export function CalendarPage() {
  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [activeDay, setActiveDay] = useState<DayPanelTarget | null>(null);

  const yr = cursor.getFullYear();
  const mo = cursor.getMonth();
  const firstDay = new Date(yr, mo, 1).getDay();
  const daysInMonth = new Date(yr, mo + 1, 0).getDate();
  const daysPrev = new Date(yr, mo, 0).getDate();

  const cells: { d: number; muted: boolean }[] = [];
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ d: daysPrev - i, muted: true });
  for (let i = 1; i <= daysInMonth; i++) cells.push({ d: i, muted: false });
  while (cells.length < 42)
    cells.push({ d: cells.length - daysInMonth - firstDay + 1, muted: true });

  const totalEvents = Object.values(MOCK_EVENTS).reduce(
    (sum, arr) => sum + arr.length,
    0
  );

  const goPrev = () => setCursor(new Date(yr, mo - 1, 1));
  const goNext = () => setCursor(new Date(yr, mo + 1, 1));
  const goToday = () =>
    setCursor(new Date(today.getFullYear(), today.getMonth(), 1));

  return (
    <AuthRequiredWrapper>
      <div className="wl-page-head">
        <div>
          <div className="wl-crumb">메뉴 · 캘린더</div>
          <h1 className="wl-page-title">
            {yr}년 {MONTH_NAMES[mo]}
            <span className="wl-page-title__hand">— 이달의 일정</span>
          </h1>
          <div className="wl-page-sub">
            총 <b>{totalEvents}개</b>의 일정 · 다가오는 일정 <b>{MOCK_UPCOMING.length}개</b>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div className="wl-cal-nav-group">
            <button type="button" className="wl-cal-nav" onClick={goPrev} aria-label="이전 달">
              <IconChevronLeft size={14} />
            </button>
            <button type="button" className="wl-cal-nav" onClick={goToday}>
              오늘
            </button>
            <button type="button" className="wl-cal-nav" onClick={goNext} aria-label="다음 달">
              <IconChevronRight size={14} />
            </button>
          </div>
          <button type="button" className="wl-timer-btn wl-timer-btn--primary">
            + 일정 추가
          </button>
        </div>
      </div>

      <div className="wl-cal-grid-2">
        <div className="wl-subs-card" style={{ padding: 18 }}>
          <div className="wl-big-cal">
            <div className="wl-big-cal__head">
              {DOW.map((d, i) => (
                <div
                  key={d}
                  className={`wl-big-dow${
                    i === 0 ? " wl-big-dow--sun" : i === 6 ? " wl-big-dow--sat" : ""
                  }`}
                >
                  {d}
                </div>
              ))}
            </div>
            <div className="wl-big-cal__grid">
              {cells.map((c, i) => {
                const isToday =
                  !c.muted &&
                  c.d === today.getDate() &&
                  mo === today.getMonth() &&
                  yr === today.getFullYear();
                const dayEvents = !c.muted ? MOCK_EVENTS[c.d] ?? [] : [];
                const dowI = i % 7;
                return (
                  <div
                    key={i}
                    className={`wl-big-cell${c.muted ? " wl-big-cell--muted" : ""}${
                      isToday ? " wl-big-cell--today" : ""
                    }`}
                    onClick={() => {
                      if (c.muted) return;
                      setActiveDay({
                        yr,
                        mo,
                        d: c.d,
                        events: dayEvents.map((e) => ({
                          title: e.title,
                          color: e.color,
                          time: e.time,
                        })),
                      });
                    }}
                  >
                    <div
                      className={`wl-big-cell__num${
                        dowI === 0
                          ? " wl-big-cell__num--sun"
                          : dowI === 6
                            ? " wl-big-cell__num--sat"
                            : ""
                      }`}
                    >
                      {c.d}
                      {isToday && <span className="wl-today-pill">TODAY</span>}
                    </div>
                    <div className="wl-big-cell__events">
                      {dayEvents.slice(0, 3).map((e, j) => (
                        <div
                          key={j}
                          className="wl-big-event"
                          style={{ background: e.color }}
                          title={e.title}
                        >
                          {e.time && <span className="wl-big-event__time">{e.time}</span>}
                          {e.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="wl-big-event__more">+{dayEvents.length - 3}개</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="wl-subs-card">
          <div className="wl-subs-card__head">
            <div className="wl-subs-card__title">
              <IconCalendar size={16} /> 다가오는 일정
            </div>
            <span className="wl-tag">{MOCK_UPCOMING.length}</span>
          </div>
          <div className="wl-upcoming">
            {MOCK_UPCOMING.map((u, i) => (
              <div key={i} className="wl-upc">
                <span className="wl-upc__bar" style={{ background: u.color }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="wl-upc__day">{u.day}</div>
                  <div className="wl-upc__title">{u.title}</div>
                  <div className="wl-upc__time">{u.time}</div>
                </div>
                {u.live && <span className="wl-tag wl-tag--live">곧</span>}
                <button
                  type="button"
                  className="wl-upc__edit"
                  aria-label="일정 수정"
                >
                  <IconPencil size={12} />
                </button>
              </div>
            ))}
          </div>
          <div className="wl-cal-legend-block">
            <div className="wl-cal-legend-h">일정 카테고리</div>
            <div className="wl-cal-legend">
              {LEGEND.map((l) => (
                <span key={l.label} className="wl-legend-item">
                  <span className="wl-legend-dot" style={{ background: l.color }} />
                  {l.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <DayDetailPanel
        day={activeDay}
        onClose={() => setActiveDay(null)}
      />
    </AuthRequiredWrapper>
  );
}
