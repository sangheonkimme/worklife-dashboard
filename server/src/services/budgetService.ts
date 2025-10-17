import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";

// 예산 생성 DTO
export interface CreateBudgetDto {
  categoryId?: string; // undefined이면 전체 예산
  amount: number;
  month: string; // YYYY-MM-01 형식
}

// 예산 수정 DTO
export interface UpdateBudgetDto {
  amount: number;
}

// 예산 조회 필터
export interface BudgetFilters {
  month?: string;
  categoryId?: string;
}

export const budgetService = {
  // 예산 목록 조회
  async getBudgets(userId: string, filters: BudgetFilters = {}) {
    const { month, categoryId } = filters;

    // month가 없으면 현재 월 사용
    const targetMonth = month
      ? new Date(month)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const where: Prisma.BudgetWhereInput = {
      userId,
      month: targetMonth,
      ...(categoryId && { categoryId }),
    };

    const budgets = await prisma.budget.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // 카테고리 정보 추가 (categoryId가 있는 경우)
    const budgetsWithCategory = await Promise.all(
      budgets.map(async (budget) => {
        if (budget.categoryId) {
          const category = await prisma.category.findUnique({
            where: { id: budget.categoryId },
            select: {
              id: true,
              name: true,
              type: true,
              color: true,
              icon: true,
            },
          });
          return { ...budget, category };
        }
        return { ...budget, category: null };
      })
    );

    return budgetsWithCategory;
  },

  // 단일 예산 조회
  async getBudgetById(id: string, userId: string) {
    const budget = await prisma.budget.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!budget) {
      return null;
    }

    // 카테고리 정보 추가
    if (budget.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: budget.categoryId },
        select: {
          id: true,
          name: true,
          type: true,
          color: true,
          icon: true,
        },
      });
      return { ...budget, category };
    }

    return { ...budget, category: null };
  },

  // 예산 생성
  async createBudget(userId: string, data: CreateBudgetDto) {
    const { categoryId, amount, month } = data;

    // categoryId가 있으면 유효성 검증
    if (categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
          OR: [{ userId }, { isDefault: true }],
        },
      });

      if (!category) {
        throw new Error("유효하지 않은 카테고리입니다");
      }

      // 지출 카테고리만 예산 설정 가능
      if (category.type !== "EXPENSE") {
        throw new Error("수입 카테고리에는 예산을 설정할 수 없습니다");
      }
    }

    // 중복 예산 확인
    const existingBudget = await prisma.budget.findFirst({
      where: {
        userId,
        categoryId: categoryId || null,
        month: new Date(month),
      },
    });

    if (existingBudget) {
      throw new Error("해당 월에 이미 예산이 설정되어 있습니다");
    }

    const budget = await prisma.budget.create({
      data: {
        userId,
        categoryId: categoryId || null,
        amount,
        month: new Date(month),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // 카테고리 정보 추가
    if (budget.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: budget.categoryId },
        select: {
          id: true,
          name: true,
          type: true,
          color: true,
          icon: true,
        },
      });
      return { ...budget, category };
    }

    return { ...budget, category: null };
  },

  // 예산 수정
  async updateBudget(id: string, userId: string, data: UpdateBudgetDto) {
    // 예산 존재 및 권한 확인
    const existingBudget = await prisma.budget.findFirst({
      where: { id, userId },
    });

    if (!existingBudget) {
      throw new Error("예산을 찾을 수 없습니다");
    }

    const budget = await prisma.budget.update({
      where: { id },
      data: {
        amount: data.amount,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // 카테고리 정보 추가
    if (budget.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: budget.categoryId },
        select: {
          id: true,
          name: true,
          type: true,
          color: true,
          icon: true,
        },
      });
      return { ...budget, category };
    }

    return { ...budget, category: null };
  },

  // 예산 삭제
  async deleteBudget(id: string, userId: string) {
    // 예산 존재 및 권한 확인
    const budget = await prisma.budget.findFirst({
      where: { id, userId },
    });

    if (!budget) {
      throw new Error("예산을 찾을 수 없습니다");
    }

    await prisma.budget.delete({
      where: { id },
    });

    return { message: "예산이 삭제되었습니다" };
  },

  // 예산 사용 현황 조회
  async getBudgetStatus(userId: string, month?: string) {
    // month가 없으면 현재 월 사용
    const targetMonth = month
      ? new Date(month)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    // 다음 월 첫날 계산
    const nextMonth = new Date(targetMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    // 해당 월의 모든 예산 조회
    const budgets = await prisma.budget.findMany({
      where: {
        userId,
        month: targetMonth,
      },
    });

    // 각 예산별 사용 현황 계산
    const budgetStatus = await Promise.all(
      budgets.map(async (budget) => {
        // 해당 예산에 대한 실제 지출 계산
        const where: Prisma.TransactionWhereInput = {
          userId,
          type: "EXPENSE",
          date: {
            gte: targetMonth,
            lt: nextMonth,
          },
          ...(budget.categoryId && { categoryId: budget.categoryId }),
        };

        const spent = await prisma.transaction.aggregate({
          where,
          _sum: {
            amount: true,
          },
        });

        const totalSpent = spent._sum.amount || 0;
        const remaining = budget.amount - totalSpent;
        const percentage =
          budget.amount > 0 ? (totalSpent / budget.amount) * 100 : 0;

        // 카테고리 정보 조회
        let category = null;
        if (budget.categoryId) {
          category = await prisma.category.findUnique({
            where: { id: budget.categoryId },
            select: {
              id: true,
              name: true,
              type: true,
              color: true,
              icon: true,
            },
          });
        }

        return {
          budget: {
            id: budget.id,
            amount: budget.amount,
            month: budget.month,
            categoryId: budget.categoryId,
            category,
          },
          spent: totalSpent,
          remaining,
          percentage,
          isExceeded: totalSpent > budget.amount,
        };
      })
    );

    // 전체 예산이 없으면 전체 지출 통계만 계산
    const totalBudget = budgets.find((b) => !b.categoryId);
    const totalSpent = await prisma.transaction.aggregate({
      where: {
        userId,
        type: "EXPENSE",
        date: {
          gte: targetMonth,
          lt: nextMonth,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const totalSpentAmount = totalSpent._sum.amount || 0;

    return {
      month: targetMonth,
      budgets: budgetStatus,
      total: {
        budget: totalBudget?.amount || 0,
        spent: totalSpentAmount,
        remaining: totalBudget ? totalBudget.amount - totalSpentAmount : 0,
        percentage:
          totalBudget && totalBudget.amount > 0
            ? (totalSpentAmount / totalBudget.amount) * 100
            : 0,
        isExceeded: totalBudget ? totalSpentAmount > totalBudget.amount : false,
      },
    };
  },
};
