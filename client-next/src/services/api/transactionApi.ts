import api from '@/lib/axios';
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
    api.get<TransactionListResponse>('/api/transactions', { params: filters }).then((res) => res.data),

  // 단일 거래 조회
  getTransactionById: (id: string) =>
    api.get<Transaction>(`/api/transactions/${id}`).then((res) => res.data),

  // 거래 생성
  createTransaction: (data: CreateTransactionDto) =>
    api.post<Transaction>('/api/transactions', data).then((res) => res.data),

  // 거래 수정
  updateTransaction: (id: string, data: UpdateTransactionDto) =>
    api.put<Transaction>(`/api/transactions/${id}`, data).then((res) => res.data),

  // 거래 삭제
  deleteTransaction: (id: string) =>
    api.delete(`/api/transactions/${id}`).then((res) => res.data),

  // 대량 거래 입력
  bulkCreateTransactions: (transactions: CreateTransactionDto[]) =>
    api.post('/api/transactions/bulk', { transactions }).then((res) => res.data),

  // 통계 조회
  getStatistics: (startDate: string, endDate: string, groupBy?: 'day' | 'week' | 'month' | 'category') =>
    api
      .get<TransactionStatistics>('/api/transactions/statistics', {
        params: { startDate, endDate, groupBy },
      })
      .then((res) => res.data),

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
      .get<Category[]>('/api/categories', {
        params: { type, includeDefault },
      })
      .then((res) => res.data),

  // 단일 카테고리 조회
  getCategoryById: (id: string) =>
    api.get<Category>(`/api/categories/${id}`).then((res) => res.data),

  // 카테고리 생성
  createCategory: (data: { name: string; type: 'INCOME' | 'EXPENSE'; color?: string; icon?: string }) =>
    api.post<Category>('/api/categories', data).then((res) => res.data),

  // 카테고리 수정
  updateCategory: (id: string, data: { name?: string; color?: string; icon?: string }) =>
    api.put<Category>(`/api/categories/${id}`, data).then((res) => res.data),

  // 카테고리 삭제
  deleteCategory: (id: string, reassignTo?: string) =>
    api.delete(`/api/categories/${id}`, { params: { reassignTo } }).then((res) => res.data),

  // 카테고리 사용 현황
  getCategoryUsage: (id: string) =>
    api
      .get<{ category: Category; transactionCount: number; totalAmount: number }>(
        `/api/categories/${id}/usage`
      )
      .then((res) => res.data),
};

// Budget API
export const budgetApi = {
  // 예산 목록 조회
  getBudgets: (month?: string, categoryId?: string) =>
    api
      .get<Budget[]>('/api/budgets', {
        params: { month, categoryId },
      })
      .then((res) => res.data),

  // 단일 예산 조회
  getBudgetById: (id: string) =>
    api.get<Budget>(`/api/budgets/${id}`).then((res) => res.data),

  // 예산 생성
  createBudget: (data: CreateBudgetDto) =>
    api.post<Budget>('/api/budgets', data).then((res) => res.data),

  // 예산 수정
  updateBudget: (id: string, data: UpdateBudgetDto) =>
    api.put<Budget>(`/api/budgets/${id}`, data).then((res) => res.data),

  // 예산 삭제
  deleteBudget: (id: string) =>
    api.delete(`/api/budgets/${id}`).then((res) => res.data),

  // 예산 사용 현황
  getBudgetStatus: (month?: string) =>
    api
      .get<BudgetStatus>('/api/budgets/status', {
        params: { month },
      })
      .then((res) => res.data),
};
