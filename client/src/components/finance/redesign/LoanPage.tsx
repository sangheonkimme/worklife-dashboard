"use client";

import { useMemo, useState } from "react";
import { AuthRequiredWrapper } from "@/components/auth/AuthRequiredWrapper";

type LoanType = "equal-payment" | "equal-principal" | "balloon";

interface ScheduleRow {
  no: number;
  pay: number;
  principalPart: number;
  interest: number;
  balance: number;
}

interface LoanResult {
  schedule: ScheduleRow[];
  totalInterest: number;
  totalPay: number;
  monthlyAvg: number;
  firstPay: number;
  fixedPay: number;
}

function calcLoan({
  principal,
  annualRate,
  months,
  graceMonths,
  type,
}: {
  principal: number;
  annualRate: number;
  months: number;
  graceMonths: number;
  type: LoanType;
}): LoanResult {
  const r = annualRate / 100 / 12;
  const n = months;
  const g = Math.min(graceMonths, n);
  const payMonths = n - g;
  const schedule: ScheduleRow[] = [];

  if (principal <= 0 || n <= 0) {
    return {
      schedule,
      totalInterest: 0,
      totalPay: 0,
      monthlyAvg: 0,
      firstPay: 0,
      fixedPay: 0,
    };
  }

  let balance = principal;

  // 거치기간: 이자만 납부
  for (let i = 1; i <= g; i++) {
    const interest = Math.round(balance * r);
    schedule.push({ no: i, pay: interest, principalPart: 0, interest, balance });
  }

  if (type === "equal-payment") {
    const pay =
      payMonths > 0 && r > 0
        ? Math.round(
            (balance * r * Math.pow(1 + r, payMonths)) /
              (Math.pow(1 + r, payMonths) - 1)
          )
        : payMonths > 0
          ? Math.round(balance / payMonths)
          : 0;
    for (let i = 1; i <= payMonths; i++) {
      const interest = Math.round(balance * r);
      const principalPart = pay - interest;
      balance = Math.max(0, balance - principalPart);
      schedule.push({ no: g + i, pay, principalPart, interest, balance });
    }
  } else if (type === "equal-principal") {
    const principalPart = payMonths > 0 ? Math.round(balance / payMonths) : 0;
    for (let i = 1; i <= payMonths; i++) {
      const interest = Math.round(balance * r);
      const pay = principalPart + interest;
      balance = Math.max(0, balance - principalPart);
      schedule.push({ no: g + i, pay, principalPart, interest, balance });
    }
  } else {
    // 만기일시: 이자만 매달, 만기에 원금 일시 상환
    for (let i = 1; i <= payMonths; i++) {
      const interest = Math.round(balance * r);
      const isLast = i === payMonths;
      const principalPart = isLast ? balance : 0;
      const pay = interest + principalPart;
      const newBalance = isLast ? 0 : balance;
      schedule.push({ no: g + i, pay, principalPart, interest, balance: newBalance });
      balance = newBalance;
    }
  }

  const totalInterest = schedule.reduce((s, x) => s + x.interest, 0);
  const totalPay = schedule.reduce((s, x) => s + x.pay, 0);
  const monthlyAvg = n > 0 ? Math.round(totalPay / n) : 0;
  const firstPay = schedule[0]?.pay ?? 0;
  const fixedPay = schedule[g]?.pay ?? firstPay;

  return { schedule, totalInterest, totalPay, monthlyAvg, firstPay, fixedPay };
}

const won = (n: number) => Math.max(0, Math.floor(n)).toLocaleString() + "원";

export function LoanPage() {
  const [principal, setPrincipal] = useState(100000000);
  const [rate, setRate] = useState(4.5);
  const [years, setYears] = useState(10);
  const [extraMonths, setExtraMonths] = useState(0);
  const [grace, setGrace] = useState(0);
  const [type, setType] = useState<LoanType>("equal-payment");
  const [showAll, setShowAll] = useState(false);

  const totalMonths = years * 12 + extraMonths;
  const result = useMemo(
    () =>
      calcLoan({
        principal,
        annualRate: rate,
        months: totalMonths,
        graceMonths: grace,
        type,
      }),
    [principal, rate, totalMonths, grace, type]
  );

  const visibleRows = showAll ? result.schedule : result.schedule.slice(0, 8);

  const fixedPaySub =
    type === "equal-principal"
      ? "첫 회 납입액"
      : type === "balloon"
        ? "월 이자 (만기에 원금 일시 상환)"
        : grace > 0
          ? "거치 종료 후 고정 납입액"
          : "매월 고정 납입액";

  return (
    <AuthRequiredWrapper>
      <div className="wl-page-head">
        <div>
          <div className="wl-crumb">메뉴 · 도구</div>
          <h1 className="wl-page-title">
            대출 이자 계산기
            <span className="wl-page-title__hand">— 한눈에 비교하기</span>
          </h1>
          <div className="wl-page-sub">
            월 납입금과 총 이자를 한눈에 비교하고, 거치기간이 있을 때의 변화를 확인할 수 있어요.
          </div>
        </div>
      </div>

      {/* 대출 조건 */}
      <div className="wl-loan-card">
        <h3 className="wl-loan-h3">대출 조건</h3>

        <div className="wl-loan-grid-2">
          <div className="wl-loan-field">
            <label>대출 금액</label>
            <div className="wl-loan-input-wrap">
              <input
                type="text"
                inputMode="numeric"
                value={principal.toLocaleString()}
                onChange={(e) => {
                  const v = parseInt(e.target.value.replace(/[^0-9]/g, ""), 10);
                  setPrincipal(isNaN(v) ? 0 : v);
                }}
              />
              <span className="wl-loan-suffix">원</span>
            </div>
          </div>

          <div className="wl-loan-field">
            <label>연이자율</label>
            <div className="wl-loan-input-wrap">
              <input
                type="number"
                step="0.1"
                min={0}
                max={30}
                value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
              />
              <span className="wl-loan-suffix">%</span>
            </div>
          </div>
        </div>

        <div className="wl-loan-grid-3">
          <div className="wl-loan-field">
            <label>기간 (년)</label>
            <div className="wl-loan-input-wrap">
              <input
                type="number"
                min={0}
                max={50}
                value={years}
                onChange={(e) =>
                  setYears(Math.max(0, parseInt(e.target.value, 10) || 0))
                }
              />
              <div className="wl-loan-spinner">
                <button type="button" onClick={() => setYears(years + 1)}>
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => setYears(Math.max(0, years - 1))}
                >
                  ▼
                </button>
              </div>
            </div>
          </div>

          <div className="wl-loan-field">
            <label>기간 (개월)</label>
            <div className="wl-loan-input-wrap">
              <input
                type="number"
                min={0}
                max={11}
                value={extraMonths}
                onChange={(e) =>
                  setExtraMonths(Math.max(0, parseInt(e.target.value, 10) || 0))
                }
              />
              <div className="wl-loan-spinner">
                <button
                  type="button"
                  onClick={() => setExtraMonths(Math.min(11, extraMonths + 1))}
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => setExtraMonths(Math.max(0, extraMonths - 1))}
                >
                  ▼
                </button>
              </div>
            </div>
          </div>

          <div className="wl-loan-field">
            <label>거치기간 (개월)</label>
            <div className="wl-loan-input-wrap">
              <input
                type="number"
                min={0}
                value={grace}
                onChange={(e) =>
                  setGrace(Math.max(0, parseInt(e.target.value, 10) || 0))
                }
              />
              <div className="wl-loan-spinner">
                <button type="button" onClick={() => setGrace(grace + 1)}>
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => setGrace(Math.max(0, grace - 1))}
                >
                  ▼
                </button>
              </div>
            </div>
            <small className="wl-loan-hint">거치기간 동안에는 이자만 납부</small>
          </div>
        </div>

        <div className="wl-loan-type-tabs">
          {(
            [
              ["equal-payment", "원리금균등"],
              ["equal-principal", "원금균등"],
              ["balloon", "만기일시(이자만)"],
            ] as [LoanType, string][]
          ).map(([k, l]) => (
            <button
              key={k}
              type="button"
              className={`wl-loan-tab${type === k ? " wl-loan-tab--on" : ""}`}
              onClick={() => setType(k)}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* 상환 요약 */}
      <div className="wl-loan-card" style={{ marginTop: 18 }}>
        <h3 className="wl-loan-h3">상환 요약</h3>

        <div className="wl-loan-summary">
          <div className="wl-loan-stat">
            <div className="wl-ls-lbl">월 납입금</div>
            <div className="wl-ls-val">{won(result.fixedPay)}</div>
            <div className="wl-ls-sub">{fixedPaySub}</div>
          </div>
          <div className="wl-loan-stat">
            <div className="wl-ls-lbl">총 이자</div>
            <div className="wl-ls-val">{won(result.totalInterest)}</div>
            <div className="wl-ls-sub">전체 기간 동안 납부할 이자 합계</div>
          </div>
          <div className="wl-loan-stat">
            <div className="wl-ls-lbl">총 상환액</div>
            <div className="wl-ls-val">{won(result.totalPay)}</div>
            <div className="wl-ls-sub">원금 + 이자</div>
          </div>
          <div className="wl-loan-stat">
            <div className="wl-ls-lbl">월 평균 납입금</div>
            <div className="wl-ls-val">{won(result.monthlyAvg)}</div>
            <div className="wl-ls-sub">총 상환액 ÷ 전체 개월 수</div>
          </div>
        </div>

        <div className="wl-loan-chips">
          <span className="wl-loan-chip">연이율 {rate}%</span>
          <span className="wl-loan-chip">총 {totalMonths}개월</span>
          {grace > 0 && (
            <span className="wl-loan-chip">거치 {grace}개월</span>
          )}
        </div>
        <p className="wl-loan-disclaimer">
          실제 금융기관 조건과 차이가 있을 수 있으며 참고용으로만 사용해주세요.
        </p>
      </div>

      {/* 월별 상환 일정 */}
      <div className="wl-loan-card" style={{ marginTop: 18 }}>
        <div className="wl-loan-schedule-head">
          <div>
            <h3 className="wl-loan-h3" style={{ marginBottom: 4 }}>
              월별 상환 일정
            </h3>
            <small className="wl-loan-hint">
              모든 금액은 반올림된 값이며 마지막 회차는 소폭 차이가 날 수 있어요.
            </small>
          </div>
          {result.schedule.length > 8 && (
            <button
              type="button"
              className="wl-loan-toggle-all"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? "처음 8개월만 보기" : `총 ${totalMonths}개월 모두 보기`}
            </button>
          )}
        </div>

        <div className="wl-loan-table-wrap">
          <table className="wl-loan-table">
            <thead>
              <tr>
                <th style={{ width: 60 }}>회차</th>
                <th>납입금</th>
                <th>원금</th>
                <th>이자</th>
                <th>잔액</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => (
                <tr key={row.no}>
                  <td className="wl-loan-no">#{row.no}</td>
                  <td className="wl-loan-num">
                    <b>{won(row.pay)}</b>
                  </td>
                  <td className="wl-loan-num">{won(row.principalPart)}</td>
                  <td className="wl-loan-num wl-loan-num--orange">{won(row.interest)}</td>
                  <td className="wl-loan-num wl-loan-num--muted">{won(row.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AuthRequiredWrapper>
  );
}
