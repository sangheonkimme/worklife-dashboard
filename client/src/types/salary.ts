/**
 * 연봉계산기 관련 타입 정의
 */

// 연봉/월급 구분
export type SalaryType = "annual" | "monthly";

// 퇴직금 포함 여부
export type RetirementType = "separate" | "included";

// 연봉 계산 입력 데이터
export interface SalaryInput {
  salaryType: SalaryType; // 연봉/월급 선택
  retirementType: RetirementType; // 퇴직금 별도/포함
  amount: number; // 금액 (연봉 또는 월급)
  nonTaxableAmount: number; // 비과세액 (식대 등, 최대 월 20만원)
  dependents: number; // 부양가족수 (본인 포함)
  childrenUnder20: number; // 8세 이상 20세 이하 자녀수
  isSmallCompany: boolean; // 중소기업 취업자 소득세 감면 여부
}

// 4대 보험 공제 내역
export interface InsuranceDeductions {
  nationalPension: number; // 국민연금
  healthInsurance: number; // 건강보험
  longTermCare: number; // 장기요양보험
  employmentInsurance: number; // 고용보험
  total: number; // 4대 보험 합계
}

// 세금 공제 내역
export interface TaxDeductions {
  incomeTax: number; // 소득세 (감면 전)
  incomeTaxReduction: number; // 중소기업 소득세 감면액
  finalIncomeTax: number; // 최종 소득세 (감면 후)
  localIncomeTax: number; // 지방소득세
  total: number; // 세금 합계 (감면 후)
}

// 전체 공제 내역
export interface TotalDeductions {
  insurance: InsuranceDeductions; // 4대 보험
  tax: TaxDeductions; // 세금
  total: number; // 총 공제액
}

// 연봉 계산 결과
export interface SalaryResult {
  monthlyGrossSalary: number; // 월 총급여 (세전)
  monthlyTaxableIncome: number; // 월 과세 대상 소득
  deductions: TotalDeductions; // 공제 내역
  monthlyNetSalary: number; // 월 실수령액
  annualGrossSalary: number; // 연 총급여
  annualNetSalary: number; // 연 실수령액
}

// 계산 결과를 위한 초기값
export const initialSalaryInput: SalaryInput = {
  salaryType: "annual",
  retirementType: "separate",
  amount: 0,
  nonTaxableAmount: 200000,
  dependents: 1,
  childrenUnder20: 0,
  isSmallCompany: false,
};

export const initialSalaryResult: SalaryResult = {
  monthlyGrossSalary: 0,
  monthlyTaxableIncome: 0,
  deductions: {
    insurance: {
      nationalPension: 0,
      healthInsurance: 0,
      longTermCare: 0,
      employmentInsurance: 0,
      total: 0,
    },
    tax: {
      incomeTax: 0,
      incomeTaxReduction: 0,
      finalIncomeTax: 0,
      localIncomeTax: 0,
      total: 0,
    },
    total: 0,
  },
  monthlyNetSalary: 0,
  annualGrossSalary: 0,
  annualNetSalary: 0,
};
