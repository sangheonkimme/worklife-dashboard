import api from '@/lib/axios';
import type { ApiResponse } from '@/types';
import type {
  Transaction,
  CreateTransactionDto,
  UpdateTransactionDto,
  TransactionFilters,
  TransactionListResponse,
  TransactionStatistics,
  Category,
  Budget,
  CreateBudgetDto,
  UpdateBudgetDto,
  BudgetStatus,
} from '@/types/transaction';

// Transaction API
export const transactionApi = {
  // 거래 목록 조회
  getTransactions: (filters?: TransactionFilters) =>
    api
      .get<ApiResponse<TransactionListResponse>>('/api/transactions', { params: filters })
      .then((res) => res.data.data),

  // 단일 거래 조회
  getTransactionById: (id: string) =>
    api.get<ApiResponse<Transaction>>(`/api/transactions/${id}`).then((res) => res.data.data),

  // 거래 생성
  createTransaction: (data: CreateTransactionDto) =>
    api.post<ApiResponse<Transaction>>('/api/transactions', data).then((res) => res.data.data),

  // 거래 수정
  updateTransaction: (id: string, data: UpdateTransactionDto) =>
    api.put<ApiResponse<Transaction>>(`/api/transactions/${id}`, data).then((res) => res.data.data),

  // 거래 삭제
  deleteTransaction: (id: string) =>
    api.delete<ApiResponse<{ message: string }>>(`/api/transactions/${id}`).then((res) => res.data.data),

  // 대량 거래 입력
  bulkCreateTransactions: (transactions: CreateTransactionDto[]) =>
    api
      .post<ApiResponse<unknown>>('/api/transactions/bulk', { transactions })
      .then((res) => res.data.data),

  // 통계 조회
  getStatistics: (startDate: string, endDate: string, groupBy?: 'day' | 'week' | 'month' | 'category') =>
    api
      .get<ApiResponse<TransactionStatistics>>('/api/transactions/statistics', {
        params: { startDate, endDate, groupBy },
      })
      .then((res) => res.data.data),

  // CSV 내보내기
  exportTransactions: (filters?: TransactionFilters) =>
    api
      .get('/api/transactions/export', {
        params: filters,
        responseType: 'blob',
      })
      .then((res) => res.data),
};

// Category API
export const categoryApi = {
  // 카테고리 목록 조회
  getCategories: (type?: 'INCOME' | 'EXPENSE', includeDefault = true) =>
    api
      .get<ApiResponse<Category[]>>('/api/categories', {
        params: { type, includeDefault },
      })
      .then((res) => res.data.data),

  // 단일 카테고리 조회
  getCategoryById: (id: string) =>
    api.get<ApiResponse<Category>>(`/api/categories/${id}`).then((res) => res.data.data),

  // 카테고리 생성
  createCategory: (data: { name: string; type: 'INCOME' | 'EXPENSE'; color?: string; icon?: string }) =>
    api.post<ApiResponse<Category>>('/api/categories', data).then((res) => res.data.data),

  // 카테고리 수정
  updateCategory: (id: string, data: { name?: string; color?: string; icon?: string }) =>
    api.put<ApiResponse<Category>>(`/api/categories/${id}`, data).then((res) => res.data.data),

  // 카테고리 삭제
  deleteCategory: (id: string, reassignTo?: string) =>
    api
      .delete<ApiResponse<{ message: string }>>(`/api/categories/${id}`, { params: { reassignTo } })
      .then((res) => res.data.data),

  // 카테고리 사용 현황
  getCategoryUsage: (id: string) =>
    api
      .get<ApiResponse<{ category: Category; transactionCount: number; totalAmount: number }>>(
        `/api/categories/${id}/usage`
      )
      .then((res) => res.data.data),
};

// Budget API
export const budgetApi = {
  // 예산 목록 조회
  getBudgets: (month?: string, categoryId?: string) =>
    api
      .get<ApiResponse<Budget[]>>('/api/budgets', {
        params: { month, categoryId },
      })
      .then((res) => res.data.data),

  // 단일 예산 조회
  getBudgetById: (id: string) =>
    api.get<ApiResponse<Budget>>(`/api/budgets/${id}`).then((res) => res.data.data),

  // 예산 생성
  createBudget: (data: CreateBudgetDto) =>
    api.post<ApiResponse<Budget>>('/api/budgets', data).then((res) => res.data.data),

  // 예산 수정
  updateBudget: (id: string, data: UpdateBudgetDto) =>
    api.put<ApiResponse<Budget>>(`/api/budgets/${id}`, data).then((res) => res.data.data),

  // 예산 삭제
  deleteBudget: (id: string) =>
    api.delete<ApiResponse<{ message: string }>>(`/api/budgets/${id}`).then((res) => res.data.data),

  // 예산 사용 현황
  getBudgetStatus: (month?: string) =>
    api
      .get<ApiResponse<BudgetStatus>>('/api/budgets/status', {
        params: { month },
      })
      .then((res) => res.data.data),
};
