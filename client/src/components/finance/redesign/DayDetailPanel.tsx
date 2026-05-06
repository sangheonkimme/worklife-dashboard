"use client";

import { useEffect } from "react";
import {
  IconX,
  IconChevronRight,
  IconNotes,
  IconCash,
} from "@tabler/icons-react";

export interface DayPanelEvent {
  title: string;
  color: string;
  time: string;
}

export interface DayPanelTarget {
  yr: number;
  mo: number; // 0-based
  d: number;
  events: DayPanelEvent[];
}

interface DayDetailPanelProps {
  day: DayPanelTarget | null;
  onClose: () => void;
  onAdd?: (day: DayPanelTarget) => void;
  onEdit?: (event: DayPanelEvent) => void;
}

interface MockExpense {
  label: string;
  amount: number;
  cat: string;
}

const MONTH_NAMES = [
  "1월", "2월", "3월", "4월", "5월", "6월",
  "7월", "8월", "9월", "10월", "11월", "12월",
];
const DOW = ["일", "월", "화", "수", "목", "금", "토"];

export function DayDetailPanel({
  day,
  onClose,
  onAdd,
  onEdit,
}: DayDetailPanelProps) {
  useEffect(() => {
    if (!day) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [day, onClose]);

  if (!day) return null;

  const { yr, mo, d, events } = day;
  const dt = new Date(yr, mo, d);
  const dow = DOW[dt.getDay()];
  const isWeekend = dt.getDay() === 0 || dt.getDay() === 6;
  const today = new Date();
  const isToday =
    d === today.getDate() &&
    mo === today.getMonth() &&
    yr === today.getFullYear();

  const sortByTime = [...events].sort((a, b) =>
    (a.time || "").localeCompare(b.time || "")
  );

  // Mock 데이터 — 추후 실제 API 결과로 교체
  const memos: string[] = isToday
    ? ["오늘 점심 약속 잊지 말기", "디자인 리뷰 자료 보내기"]
    : [];
  const expenses: MockExpense[] = isToday
    ? [
        { label: "스타벅스 강남점", amount: -6800, cat: "식비" },
        { label: "지하철", amount: -1450, cat: "교통" },
      ]
    : d === 12
      ? [{ label: "월급 입금", amount: 3200000, cat: "수입" }]
      : [];

  const numColor =
    dt.getDay() === 0
      ? "wl-dpd-num--sun"
      : dt.getDay() === 6
        ? "wl-dpd-num--sat"
        : "";

  return (
    <>
      <div className="wl-day-panel-backdrop" onClick={onClose} />
      <aside className="wl-day-panel" role="dialog" aria-modal="true">
        <div className="wl-day-panel-head">
          <div className="wl-dpd-date">
            <div className="wl-dpd-mo">{MONTH_NAMES[mo]}</div>
            <div className={`wl-dpd-num ${numColor}`}>{d}</div>
            <div className="wl-dpd-dow">{dow}요일</div>
            {isToday && <span className="wl-dpd-today">TODAY</span>}
          </div>
          <button
            type="button"
            className="wl-day-panel-close"
            onClick={onClose}
            aria-label="닫기"
          >
            <IconX size={16} />
          </button>
        </div>

        <div className="wl-day-panel-toolbar">
          <button
            type="button"
            className="wl-day-action"
            onClick={() => onAdd?.(day)}
          >
            <span className="wl-da-ico wl-bg-yellow">+</span>
            <div>
              <b>일정 추가</b>
              <small>회의, 약속, 마감 등</small>
            </div>
          </button>
          <button type="button" className="wl-day-action">
            <span className="wl-da-ico wl-bg-pink">
              <IconNotes size={13} />
            </span>
            <div>
              <b>메모 남기기</b>
              <small>오늘의 한 줄</small>
            </div>
          </button>
          <button type="button" className="wl-day-action">
            <span className="wl-da-ico wl-bg-mint">
              <IconCash size={13} />
            </span>
            <div>
              <b>지출 기록</b>
              <small>이 날 가계부에</small>
            </div>
          </button>
        </div>

        <div className="wl-day-panel-body">
          <section className="wl-dp-section">
            <header>
              <h4>일정</h4>
              <span className="wl-dp-count">{sortByTime.length}건</span>
            </header>
            {sortByTime.length === 0 ? (
              <div className="wl-dp-empty">
                예정된 일정이 없어요. 가볍게 하루를 보내세요 ☀️
              </div>
            ) : (
              <div className="wl-dp-events">
                {sortByTime.map((e, i) => (
                  <div
                    key={i}
                    className="wl-dp-event"
                    onClick={() => onEdit?.(e)}
                  >
                    <span
                      className="wl-dp-event__bar"
                      style={{ background: e.color }}
                    />
                    <div className="wl-dp-event__time">
                      {e.time || "종일"}
                    </div>
                    <div className="wl-dp-event__body">
                      <b>{e.title}</b>
                      <small>탭하여 수정 · 알림 30분 전</small>
                    </div>
                    <IconChevronRight size={14} />
                  </div>
                ))}
              </div>
            )}
          </section>

          {expenses.length > 0 && (
            <section className="wl-dp-section">
              <header>
                <h4>가계부</h4>
                <span className="wl-dp-count">{expenses.length}건</span>
              </header>
              <div className="wl-dp-expenses">
                {expenses.map((x, i) => (
                  <div key={i} className="wl-dp-expense">
                    <div>
                      <b>{x.label}</b>
                      <small>{x.cat}</small>
                    </div>
                    <span
                      className={`wl-dp-amt wl-dp-amt--${
                        x.amount < 0 ? "out" : "in"
                      }`}
                    >
                      {x.amount < 0 ? "-" : "+"}₩
                      {Math.abs(x.amount).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {memos.length > 0 && (
            <section className="wl-dp-section">
              <header>
                <h4>메모</h4>
                <span className="wl-dp-count">{memos.length}건</span>
              </header>
              <div className="wl-dp-memos">
                {memos.map((m, i) => (
                  <div key={i} className="wl-dp-memo">
                    {m}
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="wl-dp-section">
            <header>
              <h4>이 날의 통계</h4>
            </header>
            <div className="wl-dp-stats">
              <div className="wl-dp-stat">
                <small>일정</small>
                <b>{sortByTime.length}건</b>
              </div>
              <div className="wl-dp-stat">
                <small>지출</small>
                <b>{expenses.filter((x) => x.amount < 0).length}건</b>
              </div>
              <div className="wl-dp-stat">
                <small>{isWeekend ? "주말 ☕️" : "평일 💼"}</small>
                <b>{isToday ? "D-day" : ""}</b>
              </div>
            </div>
          </section>
        </div>

        <div className="wl-day-panel-foot">
          <button type="button" className="wl-timer-btn">
            전체 일정으로
          </button>
          <button
            type="button"
            className="wl-timer-btn wl-timer-btn--primary"
            onClick={() => onAdd?.(day)}
          >
            + 추가
          </button>
        </div>
      </aside>
    </>
  );
}
