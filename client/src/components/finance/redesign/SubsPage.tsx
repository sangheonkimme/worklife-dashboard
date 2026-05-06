"use client";

import { useMemo, useState } from "react";
import {
  IconRefresh,
  IconCalendar,
  IconTarget,
  IconPencil,
  IconArrowUpRight,
} from "@tabler/icons-react";
import { AuthRequiredWrapper } from "@/components/auth/AuthRequiredWrapper";
import { MOCK_SUBS, SUB_CATS, type MockSub } from "./subsMockData";

type ViewKey = "list" | "gantt";

const fmt = (n: number) => "₩" + n.toLocaleString();
const fmtK = (n: number) => "₩" + Math.round(n / 1000) + "K";

export function SubsPage() {
  const [filter, setFilter] = useState<string>("all");
  const [view, setView] = useState<ViewKey>("list");

  const today = useMemo(() => new Date(), []);
  const yr = today.getFullYear();
  const mo = today.getMonth();
  const firstDay = new Date(yr, mo, 1).getDay();
  const daysInMonth = new Date(yr, mo + 1, 0).getDate();
  const todayDate = today.getDate();

  const monthlyActive = MOCK_SUBS.filter(
    (s) => s.status === "active" && s.cycle === "월",
  );
  const yearlyActive = MOCK_SUBS.filter(
    (s) => s.status === "active" && s.cycle === "년",
  );
  const paused = MOCK_SUBS.filter((s) => s.status === "paused");
  const monthlyTotal = monthlyActive.reduce((a, s) => a + s.price, 0);
  const yearlyTotal = yearlyActive.reduce((a, s) => a + s.price, 0);
  const annualized = monthlyTotal * 12 + yearlyTotal;
  const avgPrice =
    monthlyActive.length > 0
      ? Math.round(monthlyTotal / monthlyActive.length)
      : 0;
  const pausedSavings = paused.reduce((a, s) => a + s.price, 0);

  const byCat = useMemo(() => {
    const map: Record<string, number> = {};
    monthlyActive.forEach((s) => {
      map[s.cat] = (map[s.cat] || 0) + s.price;
    });
    return Object.entries(map)
      .map(([cat, amt]) => {
        const c = SUB_CATS.find((x) => x.id === cat);
        return {
          cat,
          amt,
          color: c?.color ?? "var(--wl-ink-soft)",
          pct: monthlyTotal > 0 ? ((amt / monthlyTotal) * 100).toFixed(1) : "0",
        };
      })
      .sort((a, b) => b.amt - a.amt);
  }, [monthlyActive, monthlyTotal]);

  const filtered = MOCK_SUBS.filter(
    (s) => filter === "all" || s.cat === filter,
  );
  // 시안 기준: '이번 달 결제 예정' 카운트는 월/년 모두 포함한 활성 건수
  const sortedActiveByDay = [...filtered]
    .filter((s) => s.status === "active")
    .sort((a, b) => a.day - b.day);

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  const subsOnDay = (d: number) =>
    MOCK_SUBS.filter(
      (s) => s.status === "active" && s.cycle === "월" && s.day === d,
    );

  const nextDleft = sortedActiveByDay[0]
    ? Math.max(0, sortedActiveByDay[0].day - todayDate)
    : 0;

  const trendData = [
    { m: "6월", v: 142000 },
    { m: "7월", v: 148000 },
    { m: "8월", v: 156000 },
    { m: "9월", v: 162000 },
    { m: "10월", v: 158000 },
    { m: `${mo + 1}월`, v: monthlyTotal, now: true },
  ];
  const trendMax = Math.max(...trendData.map((b) => b.v)) * 1.1;

  return (
    <AuthRequiredWrapper>
      <div className="wl-page-head">
        <div>
          <div className="wl-crumb">메뉴 · 정기구독</div>
          <h1 className="wl-page-title">
            정기구독
            <span className="wl-page-title__hand">— 새는 돈 잡기</span>
          </h1>
          <div className="wl-page-sub">
            활성 구독{" "}
            <b>{monthlyActive.length + yearlyActive.length}건</b> · 이번 달 결제
            예정 <b>{sortedActiveByDay.length}건</b> · 다음 결제까지{" "}
            <b>D-{nextDleft}</b>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" className="wl-timer-btn">
            <IconRefresh size={14} /> 가져오기
          </button>
          <button type="button" className="wl-timer-btn wl-timer-btn--primary">
            + 구독 추가
          </button>
        </div>
      </div>

      {/* TOP STAT STRIP */}
      <div className="wl-subs-strip">
        <div className="wl-subs-stat wl-subs-stat--hero">
          <div className="wl-subs-stat__lbl">월 합계</div>
          <div className="wl-subs-stat__val">{fmt(monthlyTotal)}</div>
          <div className="wl-subs-stat__sub wl-subs-stat__sub--hand">
            매달 빠져나가는 돈
          </div>
          <span className="wl-subs-stat__stamp">MONTHLY</span>
        </div>
        <div className="wl-subs-stat">
          <div className="wl-subs-stat__lbl">연 환산</div>
          <div className="wl-subs-stat__val">{fmt(annualized)}</div>
          <div className="wl-subs-stat__sub">월 × 12 + 연결제</div>
        </div>
        <div className="wl-subs-stat">
          <div className="wl-subs-stat__lbl">평균 단가</div>
          <div className="wl-subs-stat__val">{fmt(avgPrice)}</div>
          <div className="wl-subs-stat__sub">건당 / 월</div>
        </div>
        <div className="wl-subs-stat">
          <div className="wl-subs-stat__lbl">일시정지</div>
          <div className="wl-subs-stat__val">{paused.length}건</div>
          <div className="wl-subs-stat__sub">절약 중 {fmt(pausedSavings)}</div>
        </div>
      </div>

      {/* CATEGORY + CALENDAR */}
      <div className="wl-subs-grid-2">
        <div className="wl-subs-card">
          <div className="wl-subs-card__head">
            <div>
              <div className="wl-subs-card__title">
                <IconTarget size={16} /> 카테고리별 비중
              </div>
              <div className="wl-subs-card__sub">
                월 합계 {fmt(monthlyTotal)} 기준
              </div>
            </div>
          </div>
          <div className="wl-cat-bar-stack">
            {byCat.map((c) => (
              <div
                key={c.cat}
                style={{ width: c.pct + "%", background: c.color }}
                title={`${c.cat} ${c.pct}%`}
              />
            ))}
          </div>
          <div className="wl-cat-rows">
            {byCat.map((c) => (
              <div key={c.cat} className="wl-cat-row">
                <span className="wl-cat-dot" style={{ background: c.color }} />
                <span className="wl-cat-name">{c.cat}</span>
                <span className="wl-cat-pct">{c.pct}%</span>
                <span className="wl-cat-amount">{fmt(c.amt)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="wl-subs-card">
          <div className="wl-subs-card__head">
            <div>
              <div className="wl-subs-card__title">
                <IconCalendar size={16} /> 이달의 결제 캘린더
              </div>
              <div className="wl-subs-card__sub">{mo + 1}월 · 결제일 표시</div>
            </div>
            <div className="wl-subs-cal__legend">
              <span>
                <span className="wl-legend-dot wl-legend-dot--ink" /> 결제일
              </span>
              <span>
                <span className="wl-legend-dot wl-legend-dot--today" /> 오늘
              </span>
            </div>
          </div>

          <div className="wl-subs-cal">
            <div className="wl-subs-cal__head">
              {["일", "월", "화", "수", "목", "금", "토"].map((d, i) => (
                <div
                  key={d}
                  className={`wl-subs-cal__dow${
                    i === 0
                      ? " wl-subs-cal__dow--sun"
                      : i === 6
                        ? " wl-subs-cal__dow--sat"
                        : ""
                  }`}
                >
                  {d}
                </div>
              ))}
            </div>
            <div className="wl-subs-cal__grid">
              {cells.map((d, i) => {
                if (d === null)
                  return (
                    <div
                      key={i}
                      className="wl-subs-cal__cell wl-subs-cal__cell--empty"
                    />
                  );
                const items = subsOnDay(d);
                const isToday = d === todayDate;
                const isPast = d < todayDate;
                return (
                  <div
                    key={i}
                    className={`wl-subs-cal__cell${isToday ? " wl-subs-cal__cell--today" : ""}${
                      isPast ? " wl-subs-cal__cell--past" : ""
                    }${items.length ? " wl-subs-cal__cell--has" : ""}`}
                  >
                    <div className="wl-subs-cal__num">{d}</div>
                    <div className="wl-subs-cal__pills">
                      {items.slice(0, 2).map((s) => (
                        <span
                          key={s.id}
                          className="wl-subs-cal__pill"
                          style={{ background: s.color }}
                          title={`${s.name} ${fmt(s.price)}`}
                        >
                          {s.initial}
                        </span>
                      ))}
                      {items.length > 2 && (
                        <span className="wl-subs-cal__more">
                          +{items.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* LIST */}
      <div className="wl-subs-card" style={{ marginTop: 18 }}>
        <div className="wl-subs-card__head">
          <div>
            <div className="wl-subs-card__title">
              <IconRefresh size={16} /> 구독 목록
            </div>
            <div className="wl-subs-card__sub">
              총 {filtered.length}건 · 결제일 가까운 순
            </div>
          </div>
          <div className="wl-subs-view-tabs">
            {(
              [
                ["list", "목록"],
                ["gantt", "간트"],
              ] as [ViewKey, string][]
            ).map(([k, l]) => (
              <span
                key={k}
                className={`wl-subs-view-tab${view === k ? " wl-subs-view-tab--on" : ""}`}
                onClick={() => setView(k)}
              >
                {l}
              </span>
            ))}
          </div>
        </div>

        <div className="wl-subs-chip-row">
          {SUB_CATS.map((c) => (
            <span
              key={c.id}
              className={`wl-cat-chip${filter === c.id ? " wl-cat-chip--on" : ""}`}
              onClick={() => setFilter(c.id)}
              style={
                filter === c.id || c.id === "all"
                  ? undefined
                  : { borderLeft: `3px solid ${c.color}` }
              }
            >
              {c.label}
            </span>
          ))}
        </div>

        {view === "list" ? (
          <div className="wl-subs-list">
            {filtered.map((s) => {
              const dleft =
                s.cycle === "월" ? Math.max(0, s.day - todayDate) : null;
              return <SubRow key={s.id} sub={s} dleft={dleft} />;
            })}
          </div>
        ) : (
          <div className="wl-subs-gantt">
            {filtered
              .filter((s: MockSub) => s.cycle === "월")
              .sort((a: MockSub, b: MockSub) => a.day - b.day)
              .map((s: MockSub) => (
                <div key={s.id} className="wl-gantt-row">
                  <div className="wl-gantt-name">
                    <span
                      className="wl-sub-mark wl-sub-mark--sm"
                      style={{ background: s.color }}
                    >
                      {s.initial}
                    </span>
                    <span>{s.name}</span>
                  </div>
                  <div className="wl-gantt-track">
                    <div
                      className="wl-gantt-tick"
                      style={{
                        left: ((todayDate - 1) / (daysInMonth - 1)) * 100 + "%",
                      }}
                      title="오늘"
                    />
                    <div
                      className="wl-gantt-marker"
                      style={{
                        left: ((s.day - 1) / (daysInMonth - 1)) * 100 + "%",
                        background: s.color,
                      }}
                    >
                      <span className="wl-gantt-pop">
                        {s.day}일 · {fmt(s.price)}
                      </span>
                    </div>
                  </div>
                  <div className="wl-gantt-amt">{fmt(s.price)}</div>
                </div>
              ))}
            <div className="wl-gantt-axis">
              {[1, 5, 10, 15, 20, 25, daysInMonth].map((d) => (
                <span
                  key={d}
                  style={{ left: ((d - 1) / (daysInMonth - 1)) * 100 + "%" }}
                >
                  {d}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* INSIGHTS */}
      <div className="wl-subs-grid-2" style={{ marginTop: 18 }}>
        <div className="wl-subs-card wl-subs-insight">
          <div className="wl-subs-insight__stamp">SAVE TIPS</div>
          <h3 className="wl-subs-insight__title">새는 돈, 점검해볼까요?</h3>
          <ul className="wl-subs-insight__list">
            <li>
              <span className="wl-i-dot" style={{ background: "#e89aac" }} />
              <div>
                <b>왓챠</b>는 이번 달 일시정지 중이지만 90일째 사용 안 함.
                <small>
                  해지하면 연 <b>{fmt(12900 * 12)}</b> 절약
                </small>
              </div>
              <button type="button" className="wl-timer-btn">
                해지 검토
              </button>
            </li>
            <li>
              <span className="wl-i-dot" style={{ background: "#a259ff" }} />
              <div>
                <b>Adobe CC + Figma Pro</b> — 비슷한 작업에 둘 다 결제 중.
                <small>
                  둘 중 하나만 쓰면 월 <b>{fmt(18500)}</b> 절약
                </small>
              </div>
              <button type="button" className="wl-timer-btn">
                자세히
              </button>
            </li>
            <li>
              <span className="wl-i-dot" style={{ background: "#4a8d5a" }} />
              <div>
                <b>Spotify</b>는 가족 요금제로 변경 시 1인당 절감.
                <small>
                  가족 4인 기준 월 약 <b>{fmt(5000)}</b> 절약
                </small>
              </div>
              <button type="button" className="wl-timer-btn">
                전환
              </button>
            </li>
          </ul>
        </div>

        <div className="wl-subs-card">
          <div className="wl-subs-card__head">
            <div>
              <div className="wl-subs-card__title">
                <IconArrowUpRight size={16} /> 구독 비용 추이
              </div>
              <div className="wl-subs-card__sub">최근 6개월 · 월별 합계</div>
            </div>
            <span className="wl-tag wl-tag--live">+8%</span>
          </div>
          <div className="wl-subs-trend">
            {trendData.map((b) => (
              <div key={b.m} className="wl-subs-trend__col">
                <div className="wl-subs-trend__wrap">
                  <div
                    className={`wl-subs-trend__bar${b.now ? " wl-subs-trend__bar--now" : ""}`}
                    style={{ height: (b.v / trendMax) * 100 + "%" }}
                  >
                    <span className="wl-subs-trend__val">{fmtK(b.v)}</span>
                  </div>
                </div>
                <div className="wl-subs-trend__lbl">{b.m}</div>
              </div>
            ))}
          </div>
          <div className="wl-subs-trend__foot">
            <span className="wl-hand">평균 ₩152K · 11월이 가장 높음</span>
          </div>
        </div>
      </div>
    </AuthRequiredWrapper>
  );
}

function SubRow({ sub, dleft }: { sub: MockSub; dleft: number | null }) {
  const fmt = (n: number) => "₩" + n.toLocaleString();
  const cat = SUB_CATS.find(
    (c: { id: string; color: string }) => c.id === sub.cat,
  );
  return (
    <div
      className={`wl-sub-card${sub.status === "paused" ? " wl-sub-card--paused" : ""}`}
    >
      <div className="wl-sub-mark" style={{ background: sub.color }}>
        {sub.initial}
      </div>
      <div className="wl-sub-main">
        <div className="wl-sub-name-row">
          <h4>{sub.name}</h4>
          {sub.status === "paused" && <span className="wl-tag">일시정지</span>}
        </div>
        <div className="wl-sub-meta">
          <span className="wl-sub-cat" style={{ color: cat?.color }}>
            ● {sub.cat}
          </span>
          <span className="wl-sub-meta__sep">·</span>
          <span>가입 {sub.started}</span>
        </div>
      </div>
      <div className="wl-sub-price">
        <div className="wl-sub-price__val">{fmt(sub.price)}</div>
        <div className="wl-sub-price__cycle">/ {sub.cycle}</div>
      </div>
      <div className="wl-sub-next">
        <div className="wl-sub-next__d">{sub.next}</div>
        <div
          className={`wl-sub-next__left${
            dleft !== null && dleft <= 3 ? " wl-sub-next__left--soon" : ""
          }`}
        >
          {sub.cycle === "월" ? (dleft === 0 ? "오늘" : `D-${dleft}`) : "내년"}
        </div>
      </div>
      <button type="button" className="wl-sub-edit" aria-label="구독 수정">
        <IconPencil size={13} />
      </button>
    </div>
  );
}
