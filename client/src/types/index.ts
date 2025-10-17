// 사용자 타입
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// 인증 관련 타입
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

// 카테고리 타입
export const CategoryType = {
  INCOME: 'INCOME',
  EXPENSE: 'EXPENSE',
} as const;

export type CategoryType = typeof CategoryType[keyof typeof CategoryType];

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  color?: string;
  icon?: string;
  isDefault: boolean;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

// 거래 내역 타입
export interface Transaction {
  id: string;
  amount: number;
  description?: string;
  date: string;
  type: CategoryType;
  categoryId: string;
  category?: Category;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionData {
  amount: number;
  description?: string;
  date: string;
  type: CategoryType;
  categoryId: string;
}

export type UpdateTransactionData = Partial<CreateTransactionData>;

// 예산 타입
export interface Budget {
  id: string;
  categoryId?: string;
  amount: number;
  month: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBudgetData {
  categoryId?: string;
  amount: number;
  month: string;
}

// 급여 계산 타입
export interface SalaryCalculation {
  id: string;
  salaryType: 'annual' | 'monthly';
  grossSalary: number;
  nationalPension: number;
  healthInsurance: number;
  longTermCare: number;
  employmentIns: number;
  incomeTax: number;
  localIncomeTax: number;
  netSalary: number;
  dependents: number;
  nonTaxable: number;
  userId: string;
  createdAt: string;
}

export interface CalculateSalaryData {
  salaryType: 'annual' | 'monthly';
  grossSalary: number;
  dependents?: number;
  nonTaxable?: number;
}

// 통계 타입
export interface MonthlyStatistics {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  categoryBreakdown: {
    categoryId: string;
    categoryName: string;
    amount: number;
    percentage: number;
  }[];
  dailyTrend: {
    date: string;
    income: number;
    expense: number;
  }[];
}

// API 응답 타입
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  status: string;
  statusCode: number;
  message: string;
}
