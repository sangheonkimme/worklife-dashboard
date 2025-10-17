export type CategoryType = 'INCOME' | 'EXPENSE';

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  color?: string;
  icon?: string;
  isDefault: boolean;
  userId?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  description?: string;
  date: string;
  type: CategoryType;
  categoryId: string;
  category: Category;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionDto {
  amount: number;
  description?: string;
  date: string;
  type: CategoryType;
  categoryId: string;
}

export interface UpdateTransactionDto {
  amount?: number;
  description?: string;
  date?: string;
  type?: CategoryType;
  categoryId?: string;
}

export interface TransactionFilters {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  type?: CategoryType;
  categoryId?: string;
  search?: string;
  sortBy?: 'date' | 'amount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface TransactionListResponse {
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TransactionStatistics {
  summary: {
    income: number;
    expense: number;
    net: number;
  };
  byCategory: Array<{
    category?: Category;
    type: CategoryType;
    total: number;
    count: number;
  }>;
  timeSeries: Array<{
    date: string;
    income: number;
    expense: number;
    net: number;
  }>;
}

export interface Budget {
  id: string;
  categoryId?: string;
  category?: Category;
  amount: number;
  month: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBudgetDto {
  categoryId?: string;
  amount: number;
  month: string;
}

export interface UpdateBudgetDto {
  amount: number;
}

export interface BudgetStatus {
  month: string;
  budgets: Array<{
    budget: {
      id: string;
      amount: number;
      month: string;
      categoryId?: string;
      category?: Category;
    };
    spent: number;
    remaining: number;
    percentage: number;
    isExceeded: boolean;
  }>;
  total: {
    budget: number;
    spent: number;
    remaining: number;
    percentage: number;
    isExceeded: boolean;
  };
}
