import { prisma } from '../lib/prisma';
import {
  CategoryType,
  Prisma,
  SpendingType,
  TransactionSource,
} from '@prisma/client';

// 거래 생성 DTO
export interface CreateTransactionDto {
  amount: number;
  description?: string;
  date: string;
  type: CategoryType;
  categoryId: string;
  spendingType?: SpendingType;
  source?: TransactionSource;
  subscriptionId?: string | null;
  externalId?: string | null;
}

// 거래 수정 DTO
export interface UpdateTransactionDto {
  amount?: number;
  description?: string;
  date?: string;
  type?: CategoryType;
  categoryId?: string;
  spendingType?: SpendingType;
  source?: TransactionSource;
  subscriptionId?: string | null;
  externalId?: string | null;
}

// 거래 조회 필터
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

// 통계 필터
export interface StatisticsFilters {
  startDate: string;
  endDate: string;
  groupBy?: 'day' | 'week' | 'month' | 'category';
}

export const transactionService = {
  // 거래 목록 조회 (페이지네이션 및 필터링)
  async getTransactions(userId: string, filters: TransactionFilters) {
    const {
      page = 1,
      limit = 20,
      startDate,
      endDate,
      type,
      categoryId,
      search,
      sortBy = 'date',
      sortOrder = 'desc',
    } = filters;

    const skip = (page - 1) * limit;

    // WHERE 조건 구성
    const where: Prisma.TransactionWhereInput = {
      userId,
      ...(startDate && endDate && {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      }),
      ...(type && { type }),
      ...(categoryId && { categoryId }),
      ...(search && {
        description: {
          contains: search,
          mode: 'insensitive' as Prisma.QueryMode,
        },
      }),
    };

    // 정렬 옵션
    const orderBy: Prisma.TransactionOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    // 데이터 조회 및 총 개수 조회
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              type: true,
              color: true,
              icon: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  // 단일 거래 조회
  async getTransactionById(id: string, userId: string) {
    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            type: true,
            color: true,
            icon: true,
          },
        },
      },
    });

    return transaction;
  },

  // 거래 생성
  async createTransaction(userId: string, data: CreateTransactionDto) {
    // 카테고리 유효성 검증
    const category = await prisma.category.findFirst({
      where: {
        id: data.categoryId,
        OR: [{ userId }, { isDefault: true }],
      },
    });

    if (!category) {
      throw new Error('유효하지 않은 카테고리입니다');
    }

    // 카테고리 타입과 거래 타입이 일치하는지 확인
    if (category.type !== data.type) {
      throw new Error('카테고리 타입과 거래 타입이 일치하지 않습니다');
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount: data.amount,
        description: data.description,
        date: new Date(data.date),
        type: data.type,
        categoryId: data.categoryId,
        spendingType: data.spendingType,
        source: data.source,
        subscriptionId: data.subscriptionId || undefined,
        externalId: data.externalId || undefined,
        userId,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            type: true,
            color: true,
            icon: true,
          },
        },
      },
    });

    return transaction;
  },

  // 거래 수정
  async updateTransaction(id: string, userId: string, data: UpdateTransactionDto) {
    // 거래 존재 및 권한 확인
    const existingTransaction = await prisma.transaction.findFirst({
      where: { id, userId },
    });

    if (!existingTransaction) {
      throw new Error('거래를 찾을 수 없습니다');
    }

    // 카테고리 변경 시 유효성 검증
    if (data.categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: data.categoryId,
          OR: [{ userId }, { isDefault: true }],
        },
      });

      if (!category) {
        throw new Error('유효하지 않은 카테고리입니다');
      }

      // 타입이 변경되는 경우 카테고리 타입과 일치 확인
      const transactionType = data.type || existingTransaction.type;
      if (category.type !== transactionType) {
        throw new Error('카테고리 타입과 거래 타입이 일치하지 않습니다');
      }
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.date && { date: new Date(data.date) }),
        ...(data.type && { type: data.type }),
        ...(data.categoryId && { categoryId: data.categoryId }),
        ...(data.spendingType && { spendingType: data.spendingType }),
        ...(data.source && { source: data.source }),
        ...(data.subscriptionId !== undefined && { subscriptionId: data.subscriptionId }),
        ...(data.externalId !== undefined && { externalId: data.externalId }),
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            type: true,
            color: true,
            icon: true,
          },
        },
      },
    });

    return transaction;
  },

  // 거래 삭제
  async deleteTransaction(id: string, userId: string) {
    // 거래 존재 및 권한 확인
    const transaction = await prisma.transaction.findFirst({
      where: { id, userId },
    });

    if (!transaction) {
      throw new Error('거래를 찾을 수 없습니다');
    }

    await prisma.transaction.delete({
      where: { id },
    });

    return { message: '거래가 삭제되었습니다' };
  },

  // 대량 거래 입력
  async bulkCreateTransactions(userId: string, transactions: CreateTransactionDto[]) {
    const results = {
      success: [] as any[],
      failed: [] as { index: number; data: CreateTransactionDto; error: string }[],
    };

    for (let i = 0; i < transactions.length; i++) {
      try {
        const transaction = await this.createTransaction(userId, transactions[i]);
        results.success.push(transaction);
      } catch (error) {
        results.failed.push({
          index: i,
          data: transactions[i],
          error: error instanceof Error ? error.message : '알 수 없는 오류',
        });
      }
    }

    return results;
  },

  // 통계 조회
  async getStatistics(userId: string, filters: StatisticsFilters) {
    const { startDate, endDate, groupBy = 'day' } = filters;

    const where: Prisma.TransactionWhereInput = {
      userId,
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    };

    // 전체 수입/지출 합계
    const totals = await prisma.transaction.groupBy({
      by: ['type'],
      where,
      _sum: {
        amount: true,
      },
    });

    const income = totals.find((t) => t.type === 'INCOME')?._sum.amount || 0;
    const expense = totals.find((t) => t.type === 'EXPENSE')?._sum.amount || 0;

    // 카테고리별 집계
    const byCategory = await prisma.transaction.groupBy({
      by: ['categoryId', 'type'],
      where,
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    // 카테고리 정보 가져오기
    const categoryIds = byCategory.map((item) => item.categoryId);
    const categories = await prisma.category.findMany({
      where: {
        id: { in: categoryIds },
      },
      select: {
        id: true,
        name: true,
        type: true,
        color: true,
        icon: true,
      },
    });

    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    const categorySummary = byCategory.map((item) => ({
      category: categoryMap.get(item.categoryId),
      type: item.type,
      total: item._sum.amount || 0,
      count: item._count.id,
    }));

    // 일별/월별 추이 (groupBy에 따라)
    let timeSeriesData: any[] = [];

    if (groupBy === 'category') {
      timeSeriesData = categorySummary;
    } else {
      // 날짜별 집계를 위해 모든 거래 조회
      const transactions = await prisma.transaction.findMany({
        where,
        orderBy: { date: 'asc' },
        select: {
          date: true,
          amount: true,
          type: true,
        },
      });

      // 날짜별로 그룹화
      const dateMap = new Map<string, { income: number; expense: number }>();

      transactions.forEach((t) => {
        let dateKey: string;

        if (groupBy === 'day') {
          dateKey = t.date.toISOString().split('T')[0];
        } else if (groupBy === 'month') {
          dateKey = t.date.toISOString().substring(0, 7);
        } else {
          // week
          const weekStart = new Date(t.date);
          weekStart.setDate(t.date.getDate() - t.date.getDay());
          dateKey = weekStart.toISOString().split('T')[0];
        }

        if (!dateMap.has(dateKey)) {
          dateMap.set(dateKey, { income: 0, expense: 0 });
        }

        const dateData = dateMap.get(dateKey)!;
        if (t.type === 'INCOME') {
          dateData.income += t.amount;
        } else {
          dateData.expense += t.amount;
        }
      });

      timeSeriesData = Array.from(dateMap.entries()).map(([date, data]) => ({
        date,
        income: data.income,
        expense: data.expense,
        net: data.income - data.expense,
      }));
    }

    return {
      summary: {
        income,
        expense,
        net: income - expense,
      },
      byCategory: categorySummary,
      timeSeries: timeSeriesData,
    };
  },

  // CSV 내보내기용 데이터
  async getTransactionsForExport(userId: string, filters: Omit<TransactionFilters, 'page' | 'limit'>) {
    const { startDate, endDate, type, categoryId, sortBy = 'date', sortOrder = 'desc' } = filters;

    const where: Prisma.TransactionWhereInput = {
      userId,
      ...(startDate && endDate && {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      }),
      ...(type && { type }),
      ...(categoryId && { categoryId }),
    };

    const orderBy: Prisma.TransactionOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: {
          select: {
            name: true,
            type: true,
          },
        },
      },
      orderBy,
    });

    return transactions;
  },
};
