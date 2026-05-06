"use client";

import { useTranslation } from "react-i18next";
import {
  IconBuildingBank,
  IconHome,
  IconCoffee,
  IconShoppingBag,
} from "@tabler/icons-react";

// Phase 2 (가계부 페이지)에서 실제 API와 연결 예정. Phase 1은 시각 mock.
const MONTHLY = [
  { in: 80, out: 35 },
  { in: 70, out: 28 },
  { in: 78, out: 40 },
  { in: 72, out: 32 },
  { in: 80, out: 36 },
  { in: 76, out: 34 },
  { in: 80, out: 30 },
  { in: 80, out: 38 },
  { in: 78, out: 36 },
  { in: 84, out: 36 },
  { in: 86, out: 38 },
];
const MONTHS = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월"];

const TRANSACTIONS = [
  {
    icon: IconBuildingBank,
    title: "11월 급여",
    pill: "월급",
    sub: "(주)디자인하우스 · 정기 입금",
    amount: "+₩3,200,000",
    direction: "in" as const,
  },
  {
    icon: IconHome,
    title: "월세 자동이체",
    sub: "정기지출 · 매월 1일",
    amount: "-₩850,000",
    direction: "out" as const,
  },
  {
    icon: IconCoffee,
    title: "스타벅스 강남점",
    sub: "오늘 오전",
    amount: "-₩6,800",
    direction: "out" as const,
  },
  {
    icon: IconShoppingBag,
    title: "마트 장보기",
    sub: "이마트",
    amount: "-₩78,400",
    direction: "out" as const,
  },
];

export function MoneySummaryCard() {
  const { t } = useTranslation("dashboard");

  const month = new Date().getMonth() + 1;
  const today = new Date();
  const payday = new Date(today.getFullYear(), today.getMonth() + 1, 25);
  const daysToPayday = Math.max(
    0,
    Math.ceil((payday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  );
  const budgetPct = 58;

  return (
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
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em" }}>
            <IconBuildingBank size={16} style={{ marginRight: 6, verticalAlign: -2 }} />
            {t("money.title", { month })}
          </h3>
          <div style={{ fontSize: 12, color: "var(--wl-ink-mute)", marginTop: 2 }}>
            {t("money.subtitle", { days: daysToPayday })}
          </div>
        </div>
        <button type="button" className="wl-add-btn">
          {t("money.addEntry")}
        </button>
      </div>

      <div className="wl-money-stats">
        <div className="wl-money-stat wl-money-stat--income">
          <div className="wl-money-stat__lbl">{t("money.stats.income")}</div>
          <div className="wl-money-stat__val">₩3,200,000</div>
          <div className="wl-money-stat__sub">{t("money.stats.incomeSub")}</div>
        </div>
        <div className="wl-money-stat wl-money-stat--expense">
          <div className="wl-money-stat__lbl">{t("money.stats.expense")}</div>
          <div className="wl-money-stat__val">₩1,847,200</div>
          <div className="wl-money-stat__sub">
            {t("money.stats.expenseSub", { pct: budgetPct })}
          </div>
        </div>
        <div className="wl-money-stat">
          <div className="wl-money-stat__lbl">{t("money.stats.remaining")}</div>
          <div className="wl-money-stat__val">₩1,352,800</div>
          <div className="wl-money-stat__sub">
            {t("money.stats.remainingSub", { days: daysToPayday })}
          </div>
        </div>
      </div>

      <div className="wl-budget">
        <div className="wl-budget__track">
          <div className="wl-budget__fill" style={{ width: `${budgetPct}%` }} />
        </div>
        <div className="wl-budget__labels">
          <span>0</span>
          <b>{t("money.budgetUsed", { pct: budgetPct })}</b>
          <span>₩3,200,000</span>
        </div>
      </div>

      <div className="wl-bars">
        {MONTHLY.map((m, i) => (
          <div key={i} className="wl-bars__col">
            <div className="wl-bars__in" style={{ height: `${m.in}%` }} />
            <div className="wl-bars__out" style={{ height: `${m.out}%` }} />
          </div>
        ))}
      </div>
      <div className="wl-bars__labels">
        {MONTHS.map((m) => (
          <span key={m} style={{ flex: 1, textAlign: "center" }}>
            {m}
          </span>
        ))}
      </div>

      <div style={{ marginTop: 14 }}>
        {TRANSACTIONS.map((tx, i) => {
          const Icon = tx.icon;
          return (
            <div key={i} className="wl-txn">
              <div className="wl-txn__icon">
                <Icon size={14} stroke={1.5} />
              </div>
              <div className="wl-txn__main">
                <div className="wl-txn__title">
                  {tx.title}
                  {tx.pill && <span className="wl-pill">{tx.pill}</span>}
                </div>
                <div className="wl-txn__sub">{tx.sub}</div>
              </div>
              <div
                className={`wl-txn__amount wl-txn__amount--${tx.direction}`}
              >
                {tx.amount}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
