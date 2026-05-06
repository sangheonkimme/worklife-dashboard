"use client";

import { useMemo, useState } from "react";
import { IconRefresh } from "@tabler/icons-react";
import { AuthRequiredWrapper } from "@/components/auth/AuthRequiredWrapper";
import { calculateSalary } from "@/utils/salaryCalculator";
import type { SalaryInput } from "@/types/salary";

type Mode = SalaryInput["salaryType"];
type Severance = SalaryInput["retirementType"];

const won = (n: number) => "₩" + Math.max(0, Math.floor(n)).toLocaleString();

function NumStepper({
  value,
  onChange,
  suffix = "명",
  min = 0,
}: {
  value: number;
  onChange: (n: number) => void;
  suffix?: string;
  min?: number;
}) {
  return (
    <div className="wl-num-stepper">
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))}>
        −
      </button>
      <span>
        {value}
        {suffix}
      </span>
      <button type="button" onClick={() => onChange(value + 1)}>
        +
      </button>
    </div>
  );
}

export function SalaryPage() {
  const [mode, setMode] = useState<Mode>("annual");
  const [amount, setAmount] = useState(50000000);
  const [severance, setSeverance] = useState<Severance>("separate");
  const [nonTax, setNonTax] = useState(2400000);
  const [dependents, setDependents] = useState(1);
  const [kids, setKids] = useState(0);
  const [sme, setSme] = useState(false);

  // 퇴직금 포함이면 연봉의 12/13만 실제 급여로 잡음 (퇴직충당금 분리)
  const adjustedAmount = useMemo(() => {
    if (severance !== "included") return amount;
    return mode === "annual"
      ? Math.floor((amount * 12) / 13)
      : Math.floor((amount * 12) / 13 / 12);
  }, [amount, mode, severance]);

  const result = useMemo(
    () =>
      calculateSalary({
        salaryType: mode,
        retirementType: severance,
        amount: adjustedAmount,
        nonTaxableAmount: nonTax,
        dependents,
        childrenUnder20: kids,
        isSmallCompany: sme,
      }),
    [mode, severance, adjustedAmount, nonTax, dependents, kids, sme]
  );

  // 시안 UI 매핑
  const r = useMemo(() => {
    const ins = result.deductions.insurance;
    const tax = result.deductions.tax;
    return {
      monthlyGross: result.monthlyGrossSalary,
      taxableMonthly: result.monthlyTaxableIncome,
      np: ins.nationalPension,
      hi: ins.healthInsurance,
      ltc: ins.longTermCare,
      ei: ins.employmentInsurance,
      insurance: ins.total,
      baseIncomeTax: tax.incomeTax,
      incomeTax: tax.finalIncomeTax,
      localTax: tax.localIncomeTax,
      totalDeduct: result.deductions.total,
      net: result.monthlyNetSalary,
    };
  }, [result]);

  const reset = () => {
    setAmount(50000000);
    setSeverance("separate");
    setNonTax(2400000);
    setDependents(1);
    setKids(0);
    setSme(false);
    setMode("annual");
  };

  const parseNum = (raw: string) => {
    const v = parseInt(raw.replace(/[^0-9]/g, ""), 10);
    return isNaN(v) ? 0 : v;
  };

  return (
    <AuthRequiredWrapper>
      <div className="wl-page-head">
        <div>
          <div className="wl-crumb">메뉴 · 도구</div>
          <h1 className="wl-page-title">
            연봉 계산기
            <span className="wl-page-title__hand">— 실수령액이 얼마지?</span>
          </h1>
          <div className="wl-page-sub">
            2026년 기준 4대 보험 · 소득세를 자동으로 계산해드려요
          </div>
        </div>
        <button type="button" className="wl-timer-btn" onClick={reset}>
          <IconRefresh size={13} /> 초기화
        </button>
      </div>

      <div className="wl-salary-layout">
        {/* LEFT: INPUT */}
        <div className="wl-salary-col">
          <div className="wl-salary-card">
            <div className="wl-salary-card__head">
              <h3>급여 정보 입력</h3>
              <button
                type="button"
                className="wl-salary-reset"
                onClick={reset}
                aria-label="초기화"
              >
                <IconRefresh size={14} />
              </button>
            </div>

            <div className="wl-salary-field">
              <label>연봉/월급 선택</label>
              <div className="wl-salary-seg">
                <button
                  type="button"
                  className={mode === "annual" ? "wl-salary-seg--on" : ""}
                  onClick={() => setMode("annual")}
                >
                  연봉
                </button>
                <button
                  type="button"
                  className={mode === "monthly" ? "wl-salary-seg--on" : ""}
                  onClick={() => setMode("monthly")}
                >
                  월급
                </button>
              </div>
            </div>

            <div className="wl-salary-field">
              <label>{mode === "annual" ? "연봉" : "월급"}</label>
              <div className="wl-salary-input-wrap">
                <input
                  type="text"
                  inputMode="numeric"
                  value={amount.toLocaleString()}
                  onChange={(e) => setAmount(parseNum(e.target.value))}
                />
                <span className="wl-salary-suffix">원</span>
              </div>
            </div>
          </div>

          <div className="wl-salary-card">
            <div className="wl-salary-options-label">추가 옵션</div>

            <div className="wl-salary-field">
              <label>퇴직금</label>
              <div className="wl-salary-seg">
                <button
                  type="button"
                  className={severance === "separate" ? "wl-salary-seg--on" : ""}
                  onClick={() => setSeverance("separate")}
                >
                  별도
                </button>
                <button
                  type="button"
                  className={severance === "included" ? "wl-salary-seg--on" : ""}
                  onClick={() => setSeverance("included")}
                >
                  포함
                </button>
              </div>
            </div>

            <div className="wl-salary-field">
              <label>비과세액 (연간 총액)</label>
              <div className="wl-salary-input-wrap">
                <input
                  type="text"
                  inputMode="numeric"
                  value={nonTax.toLocaleString()}
                  onChange={(e) => setNonTax(parseNum(e.target.value))}
                />
                <span className="wl-salary-suffix">원</span>
              </div>
              <small className="wl-salary-hint">
                월 {Math.floor(nonTax / 12).toLocaleString()}
              </small>
            </div>

            <div className="wl-salary-field">
              <label>부양가족수 (본인 포함)</label>
              <NumStepper value={dependents} onChange={setDependents} min={1} />
            </div>

            <div className="wl-salary-field">
              <label>8세 이상 20세 이하 자녀수</label>
              <NumStepper value={kids} onChange={setKids} />
            </div>

            <label className="wl-salary-check">
              <input
                type="checkbox"
                checked={sme}
                onChange={(e) => setSme(e.target.checked)}
              />
              <span className="wl-salary-check__box" />
              <span>중소기업 취업자 소득세 감면</span>
            </label>
          </div>
        </div>

        {/* RIGHT: PAYSLIP */}
        <div className="wl-salary-col">
          <div className="wl-salary-card wl-payslip">
            <h3 className="wl-payslip__title">급여명세서</h3>

            <div className="wl-payslip__gross">
              <div className="wl-pg-label">
                <small>지급내역</small>
                <b>월 급여</b>
              </div>
              <div className="wl-pg-amount">
                {won(r.monthlyGross)} <span>원</span>
              </div>
            </div>

            <div className="wl-payslip__section-title">공제내역</div>

            <div className="wl-payslip__group">
              <div className="wl-pg-row wl-pg-row--head">
                <span>4대 보험</span>
                <b className="wl-pg-row__num wl-pg-row__num--blue">
                  {won(r.insurance)} 원
                </b>
              </div>
              <div className="wl-pg-row wl-pg-row--sub">
                <span>국민연금 (4.5%)</span>
                <span>{won(r.np)} 원</span>
              </div>
              <div className="wl-pg-row wl-pg-row--sub">
                <span>건강보험 (3.545%)</span>
                <span>{won(r.hi)} 원</span>
              </div>
              <div className="wl-pg-row wl-pg-row--sub">
                <span>장기요양보험료 (12.95%)</span>
                <span>{won(r.ltc)} 원</span>
              </div>
              <div className="wl-pg-row wl-pg-row--sub">
                <span>고용보험 (0.9%)</span>
                <span>{won(r.ei)} 원</span>
              </div>
            </div>

            <div className="wl-payslip__group">
              <div className="wl-pg-row wl-pg-row--head">
                <span>소득세</span>
                <b className="wl-pg-row__num wl-pg-row__num--purple">
                  {won(r.incomeTax + r.localTax)} 원
                </b>
              </div>
              <div className="wl-pg-row wl-pg-row--sub">
                <span>소득세 (기본)</span>
                <span>{won(r.baseIncomeTax)} 원</span>
              </div>
              <div className="wl-pg-row wl-pg-row--sub">
                <span>소득세</span>
                <span>{won(r.incomeTax)} 원</span>
              </div>
              <div className="wl-pg-row wl-pg-row--sub">
                <span>지방소득세 (10%)</span>
                <span>{won(r.localTax)} 원</span>
              </div>
            </div>

            <div className="wl-payslip__total">
              <span>공제총액</span>
              <b>{won(r.totalDeduct)} 원</b>
            </div>

            <div className="wl-payslip__note">
              <div>* 실제 공제액은 회사 및 개인 상황에 따라 다를 수 있습니다.</div>
              <div>* 2026년 기준 세율이 적용되었습니다.</div>
            </div>

            <div className="wl-payslip__net">
              <span>실지급액</span>
              <b>
                {won(r.net)} <span>원</span>
              </b>
            </div>
          </div>
        </div>
      </div>
    </AuthRequiredWrapper>
  );
}
