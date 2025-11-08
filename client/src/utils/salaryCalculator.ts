/**
 * 연봉 계산기 유틸리티 함수
 * 2025년 기준 세율 및 공제율 적용
 */

import type {
  SalaryInput,
  SalaryResult,
  InsuranceDeductions,
  TaxDeductions,
  TotalDeductions,
} from "@/types/salary";
import { formatCurrency as formatCurrencyWithLocale } from "@/utils/format";

// 2025년 기준 공제율
const RATES = {
  NATIONAL_PENSION: 0.045, // 국민연금 4.5%
  HEALTH_INSURANCE: 0.03545, // 건강보험 3.545%
  LONG_TERM_CARE_RATE: 0.1295, // 장기요양보험 (건강보험료의 12.95%)
  EMPLOYMENT_INSURANCE: 0.009, // 고용보험 0.9%
  LOCAL_INCOME_TAX_RATE: 0.1, // 지방소득세 (소득세의 10%)
  SMALL_COMPANY_TAX_REDUCTION: 0.9, // 중소기업 취업자 소득세 감면율 90%
};

// 국민연금 상한액 (2025년 기준: 월 590만원)
const NATIONAL_PENSION_MAX = 5900000;

// 건강보험 상한액 (실제로는 매우 높음, 일반적으로 적용 안됨)
const HEALTH_INSURANCE_MAX = 100000000;

/**
 * 국민연금 계산
 */
function calculateNationalPension(monthlyIncome: number): number {
  const baseAmount = Math.min(monthlyIncome, NATIONAL_PENSION_MAX);
  return Math.floor(baseAmount * RATES.NATIONAL_PENSION);
}

/**
 * 건강보험 계산
 */
function calculateHealthInsurance(monthlyIncome: number): number {
  const baseAmount = Math.min(monthlyIncome, HEALTH_INSURANCE_MAX);
  return Math.floor(baseAmount * RATES.HEALTH_INSURANCE);
}

/**
 * 장기요양보험 계산 (건강보험료의 12.95%)
 */
function calculateLongTermCare(healthInsurance: number): number {
  return Math.floor(healthInsurance * RATES.LONG_TERM_CARE_RATE);
}

/**
 * 고용보험 계산
 */
function calculateEmploymentInsurance(monthlyIncome: number): number {
  return Math.floor(monthlyIncome * RATES.EMPLOYMENT_INSURANCE);
}

/**
 * 4대 보험 계산
 */
function calculateInsuranceDeductions(
  monthlyTaxableIncome: number
): InsuranceDeductions {
  const nationalPension = calculateNationalPension(monthlyTaxableIncome);
  const healthInsurance = calculateHealthInsurance(monthlyTaxableIncome);
  const longTermCare = calculateLongTermCare(healthInsurance);
  const employmentInsurance =
    calculateEmploymentInsurance(monthlyTaxableIncome);

  const total =
    nationalPension + healthInsurance + longTermCare + employmentInsurance;

  return {
    nationalPension,
    healthInsurance,
    longTermCare,
    employmentInsurance,
    total,
  };
}

/**
 * 소득세 계산 (간이세액표 적용)
 * 2025년 기준 간이세액 계산
 */
function calculateIncomeTax(
  monthlyTaxableIncome: number,
  dependents: number,
  childrenUnder20: number
): number {
  // 4대 보험 공제 후 금액
  const insurance = calculateInsuranceDeductions(monthlyTaxableIncome);
  const afterInsurance = monthlyTaxableIncome - insurance.total;

  // 간이세액표 기준 (2025년)
  // 실제 간이세액표는 매우 복잡하므로 간략화된 계산식 사용
  let tax = 0;

  if (afterInsurance <= 1060000) {
    tax = Math.floor(afterInsurance * 0.04);
  } else if (afterInsurance <= 2220000) {
    tax = Math.floor(42400 + (afterInsurance - 1060000) * 0.05);
  } else if (afterInsurance <= 4220000) {
    tax = Math.floor(100400 + (afterInsurance - 2220000) * 0.07);
  } else if (afterInsurance <= 6220000) {
    tax = Math.floor(240400 + (afterInsurance - 4220000) * 0.1);
  } else if (afterInsurance <= 10000000) {
    tax = Math.floor(440400 + (afterInsurance - 6220000) * 0.15);
  } else if (afterInsurance <= 15000000) {
    tax = Math.floor(1007400 + (afterInsurance - 10000000) * 0.2);
  } else {
    tax = Math.floor(2007400 + (afterInsurance - 15000000) * 0.25);
  }

  // 부양가족 공제 (1인당 약 12,500원 감면)
  const dependentDeduction = (dependents - 1) * 12500;

  // 자녀 공제 (1인당 약 12,500원 추가 감면)
  const childDeduction = childrenUnder20 * 12500;

  // 최종 소득세 (음수 방지)
  tax = Math.max(0, tax - dependentDeduction - childDeduction);

  return Math.floor(tax);
}

/**
 * 지방소득세 계산 (소득세의 10%)
 */
function calculateLocalIncomeTax(finalIncomeTax: number): number {
  return Math.floor(finalIncomeTax * RATES.LOCAL_INCOME_TAX_RATE);
}

/**
 * 세금 공제 계산
 */
function calculateTaxDeductions(
  monthlyTaxableIncome: number,
  dependents: number,
  childrenUnder20: number,
  isSmallCompany: boolean
): TaxDeductions {
  // 기본 소득세 계산
  const incomeTax = calculateIncomeTax(
    monthlyTaxableIncome,
    dependents,
    childrenUnder20
  );

  // 중소기업 취업자 소득세 감면 (90%)
  const incomeTaxReduction = isSmallCompany
    ? Math.floor(incomeTax * RATES.SMALL_COMPANY_TAX_REDUCTION)
    : 0;

  // 최종 소득세 (감면 후)
  const finalIncomeTax = incomeTax - incomeTaxReduction;

  // 지방소득세는 감면 후 소득세 기준으로 계산
  const localIncomeTax = calculateLocalIncomeTax(finalIncomeTax);

  return {
    incomeTax,
    incomeTaxReduction,
    finalIncomeTax,
    localIncomeTax,
    total: finalIncomeTax + localIncomeTax,
  };
}

/**
 * 연봉 계산 메인 함수
 */
export function calculateSalary(input: SalaryInput): SalaryResult {
  // 1. 월 총급여 계산
  let monthlyGrossSalary = 0;

  if (input.salaryType === "annual") {
    // 연봉 입력 시
    monthlyGrossSalary = Math.floor(input.amount / 12);
  } else {
    // 월급 입력 시
    monthlyGrossSalary = input.amount;
  }

  // 2. 과세 대상 소득 계산 (비과세액 제외)
  // 비과세액은 연간 총액이므로 12로 나눠서 월 단위로 환산
  const monthlyNonTaxable = Math.floor(input.nonTaxableAmount / 12);
  const monthlyTaxableIncome = monthlyGrossSalary - monthlyNonTaxable;

  // 3. 4대 보험 계산
  const insurance = calculateInsuranceDeductions(monthlyTaxableIncome);

  // 4. 세금 계산
  const tax = calculateTaxDeductions(
    monthlyTaxableIncome,
    input.dependents,
    input.childrenUnder20,
    input.isSmallCompany
  );

  // 5. 전체 공제 내역
  const deductions: TotalDeductions = {
    insurance,
    tax,
    total: insurance.total + tax.total,
  };

  // 6. 월 실수령액 계산
  const monthlyNetSalary = monthlyGrossSalary - deductions.total;

  // 7. 연 총급여 및 실수령액 계산
  const annualGrossSalary =
    input.salaryType === "annual" ? input.amount : monthlyGrossSalary * 12;
  const annualNetSalary = monthlyNetSalary * 12;

  return {
    monthlyGrossSalary,
    monthlyTaxableIncome,
    deductions,
    monthlyNetSalary,
    annualGrossSalary,
    annualNetSalary,
  };
}

/**
 * 금액을 원 단위로 포맷
 */
export function formatCurrencyWithUnit(amount: number): string {
  return `${formatCurrencyWithLocale(Math.floor(amount))} 원`;
}
