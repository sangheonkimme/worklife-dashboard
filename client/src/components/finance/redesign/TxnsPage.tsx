"use client";

import { useMemo, useState } from "react";
import { IconSearch, IconTrash, IconX } from "@tabler/icons-react";
import { AuthRequiredWrapper } from "@/components/auth/AuthRequiredWrapper";
import { ICON_MAP, MOCK_TXNS, type MockTxn } from "./mockData";
import { getCategoryColor } from "./categoryColor";

const fmt = (n: number) =>
  (n < 0 ? "-" : n > 0 ? "+" : "") + "₩" + Math.abs(n).toLocaleString();
const fmtAbs = (n: number) => "₩" + Math.abs(n).toLocaleString();

const TODAY = new Date().toISOString().slice(0, 10);
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const YESTERDAY = yesterday.toISOString().slice(0, 10);

const dateLabel = (d: string) => {
  if (d === TODAY) return `오늘 · ${d.slice(5).replace("-", ".")}`;
  if (d === YESTERDAY) return `어제 · ${d.slice(5).replace("-", ".")}`;
  const dt = new Date(d);
  const dow = ["일", "월", "화", "수", "목", "금", "토"][dt.getDay()];
  return `${d.slice(5).replace("-", ".")} ${dow}`;
};

type RangeKey = "week" | "month" | "3m" | "all";
type TypeKey = "all" | "in" | "out";

export function TxnsPage() {
  const [q, setQ] = useState("");
  const [type, setType] = useState<TypeKey>("all");
  const [cat, setCat] = useState<string>("all");
  const [pay, setPay] = useState<string>("all");
  const [range, setRange] = useState<RangeKey>("month");
  const [activeId, setActiveId] = useState<number>(MOCK_TXNS[0]?.id ?? 0);

  const allCats = useMemo(
    () => Array.from(new Set(MOCK_TXNS.map((t) => t.cat))),
    []
  );
  const allPays = useMemo(
    () => Array.from(new Set(MOCK_TXNS.map((t) => t.pay))),
    []
  );

  const filtered = useMemo(() => {
    return MOCK_TXNS.filter((t) => {
      if (type !== "all" && t.type !== type) return false;
      if (cat !== "all" && t.cat !== cat) return false;
      if (pay !== "all" && t.pay !== pay) return false;
      if (q) {
        const s = (
          t.label +
          " " +
          t.note +
          " " +
          t.memo +
          " " +
          t.cat
        ).toLowerCase();
        if (!s.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [q, type, cat, pay]);

  const grouped = useMemo(() => {
    const map: Record<string, MockTxn[]> = {};
    filtered.forEach((t) => {
      (map[t.date] ||= []).push(t);
    });
    return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  const sumIn = filtered
    .filter((t) => t.type === "in")
    .reduce((a, t) => a + t.amount, 0);
  const sumOut = filtered
    .filter((t) => t.type === "out")
    .reduce((a, t) => a + Math.abs(t.amount), 0);
  const active =
    MOCK_TXNS.find((t) => t.id === activeId) ?? filtered[0] ?? null;

  return (
    <AuthRequiredWrapper>
      <div className="wl-page-head">
        <div>
          <div className="wl-crumb">메뉴 · 가계부 · 거래내역</div>
          <h1 className="wl-page-title">
            거래내역
            <span className="wl-page-title__hand">— 모든 흐름을 자세히</span>
          </h1>
          <div className="wl-page-sub">
            총 {MOCK_TXNS.length}건 · 검색 결과 <b>{filtered.length}건</b>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" className="wl-timer-btn">
            CSV
          </button>
          <button type="button" className="wl-timer-btn">
            영수증 첨부
          </button>
          <button type="button" className="wl-timer-btn wl-timer-btn--primary">
            + 내역 추가
          </button>
        </div>
      </div>

      {/* 빅 검색바 */}
      <div className="wl-txn-search-bar">
        <IconSearch size={18} />
        <input
          placeholder="가게 이름, 메모, 카테고리, 결제수단 검색…"
          value={q}
          onChange={(e) => setQ(e.currentTarget.value)}
          aria-label="거래내역 검색"
        />
        {q && (
          <button
            type="button"
            className="wl-txn-clear"
            onClick={() => setQ("")}
            aria-label="검색어 지우기"
          >
            <IconX size={14} />
          </button>
        )}
        <div className="wl-txn-search-stats">
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span className="wl-ts-dot wl-ts-dot--in" />
            수입 <b>{fmt(sumIn)}</b>
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span className="wl-ts-dot wl-ts-dot--out" />
            지출 <b>-{fmtAbs(sumOut)}</b>
          </span>
        </div>
      </div>

      {/* 필터 칩 */}
      <div className="wl-txn-filters">
        <div className="wl-txn-filter-group">
          <span className="wl-txn-filter-label">유형</span>
          {(
            [
              ["all", "전체"],
              ["in", "수입"],
              ["out", "지출"],
            ] as [TypeKey, string][]
          ).map(([k, l]) => (
            <span
              key={k}
              className={`wl-cat-chip${type === k ? " wl-cat-chip--on" : ""}`}
              onClick={() => setType(k)}
            >
              {l}
            </span>
          ))}
        </div>
        <div className="wl-txn-filter-group">
          <span className="wl-txn-filter-label">기간</span>
          {(
            [
              ["week", "이번 주"],
              ["month", "이번 달"],
              ["3m", "3개월"],
              ["all", "전체"],
            ] as [RangeKey, string][]
          ).map(([k, l]) => (
            <span
              key={k}
              className={`wl-cat-chip${range === k ? " wl-cat-chip--on" : ""}`}
              onClick={() => setRange(k)}
            >
              {l}
            </span>
          ))}
        </div>
        <div className="wl-txn-filter-group">
          <span className="wl-txn-filter-label">카테고리</span>
          <span
            className={`wl-cat-chip${cat === "all" ? " wl-cat-chip--on" : ""}`}
            onClick={() => setCat("all")}
          >
            전체
          </span>
          {allCats.map((c) => (
            <span
              key={c}
              className={`wl-cat-chip${cat === c ? " wl-cat-chip--on" : ""}`}
              onClick={() => setCat(c)}
              style={
                cat === c
                  ? undefined
                  : { borderLeft: `3px solid ${getCategoryColor(c)}` }
              }
            >
              {c}
            </span>
          ))}
        </div>
        <div className="wl-txn-filter-group">
          <span className="wl-txn-filter-label">결제</span>
          <span
            className={`wl-cat-chip${pay === "all" ? " wl-cat-chip--on" : ""}`}
            onClick={() => setPay("all")}
          >
            전체
          </span>
          {allPays.map((p) => (
            <span
              key={p}
              className={`wl-cat-chip${pay === p ? " wl-cat-chip--on" : ""}`}
              onClick={() => setPay(p)}
            >
              {p}
            </span>
          ))}
        </div>
      </div>

      {/* 2-pane 레이아웃 */}
      <div className="wl-txn-detail-layout">
        {/* 좌측 리스트 */}
        <div className="wl-txn-list-card">
          <div className="wl-txn-list-head">
            <div>날짜 · 시간</div>
            <div>내역</div>
            <div>카테고리</div>
            <div>결제</div>
            <div className="wl-thl-col--amt">금액</div>
          </div>

          {grouped.length === 0 && (
            <div className="wl-empty-state">
              <span className="wl-empty-state__hand">검색 결과가 없어요</span>
              <div>다른 키워드나 필터를 시도해보세요.</div>
            </div>
          )}

          {grouped.map(([date, items]) => {
            const dayIn = items
              .filter((t) => t.type === "in")
              .reduce((a, t) => a + t.amount, 0);
            const dayOut = items
              .filter((t) => t.type === "out")
              .reduce((a, t) => a + Math.abs(t.amount), 0);
            return (
              <div key={date} className="wl-txn-day">
                <div className="wl-txn-day-head">
                  <div className="wl-txn-day-label">{dateLabel(date)}</div>
                  <div className="wl-txn-day-sums">
                    {dayIn > 0 && (
                      <span className="wl-td-in">
                        +₩{dayIn.toLocaleString()}
                      </span>
                    )}
                    {dayOut > 0 && (
                      <span className="wl-td-out">
                        -₩{dayOut.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                {items.map((t) => {
                  const Icon = ICON_MAP[t.icon];
                  return (
                    <div
                      key={t.id}
                      className={`wl-txn-row${
                        activeId === t.id ? " wl-txn-row--on" : ""
                      }`}
                      onClick={() => setActiveId(t.id)}
                    >
                      <div>
                        <div className="wl-tr-time">{t.time}</div>
                      </div>
                      <div className="wl-thl-col--label">
                        <div className="wl-tr-ico">
                          <Icon size={14} stroke={1.5} />
                        </div>
                        <div className="wl-tr-text">
                          <div className="wl-tr-label">{t.label}</div>
                          <div className="wl-tr-note">{t.note}</div>
                        </div>
                      </div>
                      <div>
                        <span
                          className="wl-tr-cat-tag"
                          style={{ background: getCategoryColor(t.cat) }}
                        >
                          {t.cat}
                        </span>
                      </div>
                      <div className="wl-thl-col--pay">{t.pay}</div>
                      <div
                        className={`wl-thl-col--amt wl-amt--${t.type}`}
                      >
                        {fmt(t.amount)}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}

          <div className="wl-txn-list-foot">
            <span>{filtered.length}건 표시 · 더 불러오려면 스크롤</span>
            <button type="button" className="wl-timer-btn">
              더 보기
            </button>
          </div>
        </div>

        {/* 우측 디테일 패널 */}
        <aside className="wl-txn-detail">
          {!active ? (
            <div className="wl-empty-state">
              <span className="wl-empty-state__hand">
                거래를 선택하세요 →
              </span>
            </div>
          ) : (
            <>
              <div className="wl-txn-detail-head">
                <div
                  className={`wl-txn-detail-amt wl-txn-detail-amt--${active.type}`}
                >
                  {fmt(active.amount)}
                </div>
                <div className="wl-txn-detail-name">{active.label}</div>
                <div className="wl-txn-detail-note">{active.note}</div>
                <span
                  className="wl-tr-cat-tag"
                  style={{
                    background: getCategoryColor(active.cat),
                    marginTop: 10,
                    display: "inline-block",
                  }}
                >
                  {active.cat}
                </span>
              </div>

              <ul className="wl-txn-detail-rows">
                <li>
                  <span>일시</span>
                  <b>
                    {active.date} · {active.time}
                  </b>
                </li>
                <li>
                  <span>결제수단</span>
                  <b>{active.pay}</b>
                </li>
                <li>
                  <span>유형</span>
                  <b>{active.type === "in" ? "수입" : "지출"}</b>
                </li>
                <li>
                  <span>카테고리</span>
                  <b>{active.cat}</b>
                </li>
                <li>
                  <span>고정/변동</span>
                  <b>{active.pay === "자동이체" ? "고정 지출" : "변동 지출"}</b>
                </li>
              </ul>

              <div className="wl-txn-memo-block">
                <div className="wl-txn-memo-label">메모</div>
                <textarea
                  defaultValue={active.memo}
                  placeholder="이 거래에 대한 메모…"
                />
              </div>

              <div className="wl-txn-receipt">
                <div className="wl-receipt-tape" />
                <div className="wl-receipt-h">RECEIPT</div>
                <div className="wl-receipt-row">
                  <span>{active.label}</span>
                  <b>{fmt(active.amount).replace("+", "")}</b>
                </div>
                <div className="wl-receipt-row wl-receipt-row--small">
                  <span>{active.note}</span>
                </div>
                <div className="wl-receipt-divider">
                  - - - - - - - - - - - - - - - - - - - -
                </div>
                <div className="wl-receipt-row">
                  <span>합계</span>
                  <b>{fmt(active.amount).replace("+", "")}</b>
                </div>
                <div className="wl-receipt-row wl-receipt-row--small">
                  <span>{active.pay}</span>
                  <span>{active.time}</span>
                </div>
                <div className="wl-receipt-foot">— 영수증 첨부 가능 —</div>
              </div>

              <div className="wl-txn-detail-actions">
                <button type="button" className="wl-timer-btn">
                  복제
                </button>
                <button
                  type="button"
                  className="wl-timer-btn wl-timer-btn--ghost-danger"
                >
                  <IconTrash size={13} />
                  삭제
                </button>
                <button
                  type="button"
                  className="wl-timer-btn wl-timer-btn--primary"
                  style={{ marginLeft: "auto" }}
                >
                  수정
                </button>
              </div>
            </>
          )}
        </aside>
      </div>
    </AuthRequiredWrapper>
  );
}
