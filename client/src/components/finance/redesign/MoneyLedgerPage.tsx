"use client";

import Link from "next/link";
import { IconWallet } from "@tabler/icons-react";
import { AuthRequiredWrapper } from "@/components/auth/AuthRequiredWrapper";
import {
  ICON_MAP,
  MOCK_MONTH_LABELS,
  MOCK_MONTHLY,
  MOCK_TXNS,
} from "./mockData";

const won = (n: number) => "₩" + Math.abs(n).toLocaleString();
const fmtSigned = (n: number) =>
  (n < 0 ? "-" : "+") + "₩" + Math.abs(n).toLocaleString();

export function MoneyLedgerPage() {
  const today = new Date();
  const month = today.getMonth() + 1;

  const income = 3_200_000;
  const expense = 1_847_200;
  const balance = income - expense;
  const budgetPct = Math.round((expense / income) * 100);

  // 월급일까지 D-N 계산
  const payday = new Date(today.getFullYear(), today.getMonth(), 25);
  if (today.getDate() > 25) payday.setMonth(payday.getMonth() + 1);
  const daysToPayday = Math.max(
    0,
    Math.ceil((payday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  );

  // 미니 거래 4건만 (가계부 카드 안)
  const miniTxns = MOCK_TXNS.slice(0, 4);
  const max = 90;

  return (
    <AuthRequiredWrapper>
      <div className="wl-page-head">
        <div>
          <div className="wl-crumb">메뉴 · 가계부</div>
          <h1 className="wl-page-title">
            가계부
            <span className="wl-page-title__hand">— 이번 달의 흐름</span>
          </h1>
          <div className="wl-page-sub">
            월급일까지 D-{daysToPayday} · {month}월 예산 {budgetPct}% 사용 중
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/dashboard/txns" className="wl-timer-btn">
            거래내역 자세히 →
          </Link>
          <button type="button" className="wl-timer-btn wl-timer-btn--primary">
            + 내역 추가
          </button>
        </div>
      </div>

      <div className="wl-money-card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 14,
            gap: 10,
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 800,
                letterSpacing: "-0.02em",
              }}
            >
              <IconWallet
                size={16}
                style={{ marginRight: 6, verticalAlign: -2 }}
              />
              가계부 — {month}월
            </h3>
            <div
              style={{
                fontSize: 12,
                color: "var(--wl-ink-mute)",
                marginTop: 2,
              }}
            >
              월급일까지 D-{daysToPayday} · 이번 달 흐름을 한눈에
            </div>
          </div>
        </div>

        <div className="wl-money-stats">
          <div className="wl-money-stat wl-money-stat--income">
            <div className="wl-money-stat__lbl">월급 (실수령)</div>
            <div className="wl-money-stat__val">{won(income)}</div>
            <div className="wl-money-stat__sub">매월 25일 입금</div>
          </div>
          <div className="wl-money-stat wl-money-stat--expense">
            <div className="wl-money-stat__lbl">이번 달 지출</div>
            <div className="wl-money-stat__val">{won(expense)}</div>
            <div className="wl-money-stat__sub">예산 {budgetPct}% 사용</div>
          </div>
          <div className="wl-money-stat">
            <div className="wl-money-stat__lbl">남은 예산</div>
            <div
              className="wl-money-stat__val"
              style={{
                color: balance > 500000 ? "#2d7a3a" : "var(--wl-red)",
              }}
            >
              {won(balance)}
            </div>
            <div className="wl-money-stat__sub">
              D-{daysToPayday}까지 사용 가능
            </div>
          </div>
        </div>

        <div className="wl-budget">
          <div className="wl-budget__track">
            <div
              className="wl-budget__fill"
              style={{ width: `${budgetPct}%` }}
            />
          </div>
          <div className="wl-budget__labels">
            <span>0</span>
            <b>{budgetPct}% 사용 중</b>
            <span>{won(income)}</span>
          </div>
        </div>

        <div className="wl-bars">
          {MOCK_MONTHLY.map((d, i) => (
            <div key={i} className="wl-bars__col">
              <div
                className="wl-bars__in"
                style={{ height: `${(d.in / max) * 60}%` }}
              />
              <div
                className="wl-bars__out"
                style={{ height: `${(d.out / max) * 40}%` }}
              />
            </div>
          ))}
        </div>
        <div className="wl-bars__labels">
          {MOCK_MONTH_LABELS.map((m) => (
            <span key={m} style={{ flex: 1, textAlign: "center" }}>
              {m}
            </span>
          ))}
        </div>

        <div style={{ marginTop: 14 }}>
          {miniTxns.map((tx) => {
            const Icon = ICON_MAP[tx.icon];
            return (
              <div key={tx.id} className="wl-txn">
                <div className="wl-txn__icon">
                  <Icon size={14} stroke={1.5} />
                </div>
                <div className="wl-txn__main">
                  <div className="wl-txn__title">
                    {tx.label}
                    {tx.cat === "급여" && (
                      <span className="wl-pill">월급</span>
                    )}
                  </div>
                  <div className="wl-txn__sub">{tx.note}</div>
                </div>
                <div
                  className={`wl-txn__amount wl-txn__amount--${tx.type}`}
                >
                  {fmtSigned(tx.amount)}
                </div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 14,
            paddingTop: 12,
            borderTop: "1px dashed var(--wl-line)",
            textAlign: "center",
          }}
        >
          <Link
            href="/dashboard/txns"
            className="wl-section-link"
            style={{ fontSize: 13 }}
          >
            전체 거래내역 보기 →
          </Link>
        </div>
      </div>
    </AuthRequiredWrapper>
  );
}
