import {
  BillingCycle,
  CategoryType,
  Prisma,
  SubscriptionStatus,
  SubscriptionHistoryType,
  SpendingType,
  TransactionSource,
} from '@prisma/client';
import { prisma } from '../lib/prisma';
import { ApiError } from '../middlewares/errorHandler';

export interface SubscriptionFilters {
  status?: SubscriptionStatus;
  category?: string;
  paymentMethod?: string;
  search?: string;
  sort?: 'nextBillingDate' | 'amount' | 'createdAt';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CreateSubscriptionDto {
  name: string;
  amount: number;
  currency?: string;
  billingCycle: BillingCycle;
  nextBillingDate: string;
  paymentMethod?: string;
  category?: string;
  status?: SubscriptionStatus;
  trialEndDate?: string;
  notifyDaysBefore?: number;
  notes?: string;
}

export interface UpdateSubscriptionDto extends Partial<CreateSubscriptionDto> {}

export const subscriptionService = {
  async summary(userId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [activeSubs, fixedTxSum, variableTxSum] = await Promise.all([
      prisma.subscription.findMany({
        where: { userId, status: SubscriptionStatus.ACTIVE },
      }),
      prisma.transaction.aggregate({
        where: {
          userId,
          spendingType: SpendingType.FIXED,
          date: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          userId,
          spendingType: SpendingType.VARIABLE,
          date: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { amount: true },
      }),
    ]);

    const normalizeToMonthly = (sub: { amount: Prisma.Decimal; billingCycle: BillingCycle }) => {
      const amount = Number(sub.amount);
      switch (sub.billingCycle) {
        case 'WEEKLY':
          return amount * 4;
        case 'YEARLY':
          return amount / 12;
        default:
          return amount;
      }
    };

    const monthlyFixedTotal = activeSubs.reduce((sum, sub) => sum + normalizeToMonthly(sub), 0);

    const upcomingMonthTotal = activeSubs
      .filter((sub) => {
        const nextDate = new Date(sub.nextBillingDate);
        return nextDate >= startOfMonth && nextDate <= endOfMonth;
      })
      .reduce((sum, sub) => sum + Number(sub.amount), 0);

    const next7Days = activeSubs
      .filter((sub) => {
        const nextDate = new Date(sub.nextBillingDate);
        return nextDate >= now && nextDate <= sevenDaysLater;
      })
      .map((sub) => ({
        id: sub.id,
        name: sub.name,
        amount: Number(sub.amount),
        billingCycle: sub.billingCycle,
        nextBillingDate: sub.nextBillingDate,
        status: sub.status,
        category: sub.category,
        paymentMethod: sub.paymentMethod,
      }))
      .sort((a, b) => new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime());

    const categoryShare = activeSubs.reduce<Record<string, number>>((acc, sub) => {
      const key = sub.category || 'Uncategorized';
      acc[key] = (acc[key] || 0) + Number(sub.amount);
      return acc;
    }, {});

    const fixed = Number(fixedTxSum._sum.amount || 0);
    const variable = Number(variableTxSum._sum.amount || 0);
    const totalSpending = fixed + variable;
    const fixedRatio = totalSpending > 0 ? fixed / totalSpending : 0;

    return {
      monthlyFixedTotal,
      upcomingMonthTotal,
      next7Days,
      categoryShare,
      fixedVsVariableRatio: {
        fixed,
        variable,
        fixedRatio,
      },
    };
  },

  async recordBillingTransaction(userId: string, subscriptionId: string, billingDate: string, categoryId: string) {
    const subscription = await prisma.subscription.findFirst({
      where: { id: subscriptionId, userId },
    });

    if (!subscription) {
      throw new ApiError(404, '구독을 찾을 수 없습니다');
    }

    const date = new Date(billingDate);
    const externalId = `${subscriptionId}:${date.toISOString().split('T')[0]}`;

    try {
      const tx = await prisma.transaction.create({
        data: {
          amount: Number(subscription.amount),
          description: subscription.name,
          date,
          type: CategoryType.EXPENSE,
          spendingType: SpendingType.FIXED,
          source: TransactionSource.SUBSCRIPTION,
          categoryId,
          userId,
          externalId,
          subscriptionId,
        },
      });
      return tx;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const existing = await prisma.transaction.findFirst({
          where: { userId, externalId },
        });
        if (existing) return existing;
      }
      throw error;
    }
  },

  async list(userId: string, filters: SubscriptionFilters) {
    const {
      status,
      category,
      paymentMethod,
      search,
      sort = 'nextBillingDate',
      order = 'asc',
      page = 1,
      limit = 20,
    } = filters;

    const skip = (page - 1) * limit;

    const where: Prisma.SubscriptionWhereInput = {
      userId,
      ...(status && { status }),
      ...(category && { category }),
      ...(paymentMethod && { paymentMethod }),
      ...(search && { name: { contains: search, mode: 'insensitive' } }),
    };

    const orderBy: Prisma.SubscriptionOrderByWithRelationInput = {
      [sort]: order,
    };

    const [items, total] = await Promise.all([
      prisma.subscription.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.subscription.count({ where }),
    ]);

    return {
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async create(userId: string, payload: CreateSubscriptionDto) {
    const subscription = await prisma.subscription.create({
      data: {
        userId,
        name: payload.name,
        amount: new Prisma.Decimal(payload.amount),
        currency: payload.currency || 'KRW',
        billingCycle: payload.billingCycle,
        nextBillingDate: new Date(payload.nextBillingDate),
        paymentMethod: payload.paymentMethod,
        category: payload.category,
        status: payload.status || SubscriptionStatus.ACTIVE,
        trialEndDate: payload.trialEndDate ? new Date(payload.trialEndDate) : null,
        notifyDaysBefore: payload.notifyDaysBefore,
        notes: payload.notes,
      },
    });

    return subscription;
  },

  async update(userId: string, id: string, payload: UpdateSubscriptionDto) {
    const existing = await prisma.subscription.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new ApiError(404, '구독을 찾을 수 없습니다');
    }

    const updated = await prisma.subscription.update({
      where: { id },
      data: {
        name: payload.name,
        amount: payload.amount !== undefined ? new Prisma.Decimal(payload.amount) : undefined,
        currency: payload.currency,
        billingCycle: payload.billingCycle,
        nextBillingDate: payload.nextBillingDate ? new Date(payload.nextBillingDate) : undefined,
        paymentMethod: payload.paymentMethod,
        category: payload.category,
        status: payload.status,
        trialEndDate: payload.trialEndDate ? new Date(payload.trialEndDate) : payload.trialEndDate === null ? null : undefined,
        notifyDaysBefore: payload.notifyDaysBefore,
        notes: payload.notes,
      },
    });

    // 상태 변경/가격 변경 기록
    if (
      payload.status &&
      payload.status !== existing.status
    ) {
      await prisma.subscriptionHistory.create({
        data: {
          subscriptionId: id,
          type: SubscriptionHistoryType.STATUS_CHANGE,
          prevStatus: existing.status,
          newStatus: payload.status,
        },
      });
    }

    if (
      payload.amount !== undefined &&
      !new Prisma.Decimal(payload.amount).equals(existing.amount)
    ) {
      await prisma.subscriptionHistory.create({
        data: {
          subscriptionId: id,
          type: SubscriptionHistoryType.PRICE_CHANGE,
          prevAmount: existing.amount,
          newAmount: new Prisma.Decimal(payload.amount),
        },
      });
    }

    return updated;
  },

  async cancel(userId: string, id: string, reason?: string) {
    const existing = await prisma.subscription.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new ApiError(404, '구독을 찾을 수 없습니다');
    }

    if (existing.status === SubscriptionStatus.CANCELLED) {
      return existing;
    }

    const updated = await prisma.subscription.update({
      where: { id },
      data: {
        status: SubscriptionStatus.CANCELLED,
      },
    });

    await prisma.subscriptionHistory.create({
      data: {
        subscriptionId: id,
        type: SubscriptionHistoryType.STATUS_CHANGE,
        prevStatus: existing.status,
        newStatus: SubscriptionStatus.CANCELLED,
        description: reason,
      },
    });

    return updated;
  },
};
