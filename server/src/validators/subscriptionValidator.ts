import { z } from 'zod';

const billingCycleEnum = z.enum(['WEEKLY', 'MONTHLY', 'YEARLY']);
const statusEnum = z.enum(['ACTIVE', 'PAUSED', 'CANCELLED']);

export const createSubscriptionSchema = z.object({
  body: z.object({
    name: z.string().min(1, '서비스명을 입력해주세요'),
    amount: z.number().positive('금액은 양수여야 합니다'),
    currency: z.string().optional(),
    billingCycle: billingCycleEnum,
    nextBillingDate: z.string().datetime('유효한 날짜 형식이어야 합니다'),
    paymentMethod: z.string().optional(),
    category: z.string().optional(),
    status: statusEnum.optional(),
    trialEndDate: z.string().datetime().optional(),
    notifyDaysBefore: z.number().int().positive().optional(),
    notes: z.string().optional(),
  }),
});

export const getSubscriptionsSchema = z.object({
  query: z.object({
    status: statusEnum.optional(),
    category: z.string().optional(),
    paymentMethod: z.string().optional(),
    search: z.string().optional(),
    sort: z.enum(['nextBillingDate', 'amount', 'createdAt']).optional().default('nextBillingDate'),
    order: z.enum(['asc', 'desc']).optional().default('asc'),
    page: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 1)),
    limit: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 20)),
  }),
});

export const updateSubscriptionSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    name: z.string().optional(),
    amount: z.number().positive().optional(),
    currency: z.string().optional(),
    billingCycle: billingCycleEnum.optional(),
    nextBillingDate: z.string().datetime().optional(),
    paymentMethod: z.string().optional(),
    category: z.string().optional(),
    status: statusEnum.optional(),
    trialEndDate: z.string().datetime().optional(),
    notifyDaysBefore: z.number().int().positive().optional(),
    notes: z.string().optional(),
  }),
});

export const cancelSubscriptionSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    reason: z.string().optional(),
  }).optional(),
});
