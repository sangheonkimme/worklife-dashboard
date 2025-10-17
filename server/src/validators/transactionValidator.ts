import { z } from 'zod';

// 거래 생성 스키마
export const createTransactionSchema = z.object({
  body: z.object({
    amount: z.number().positive('금액은 양수여야 합니다'),
    description: z.string().optional(),
    date: z.string().datetime('유효한 날짜 형식이어야 합니다'),
    type: z.enum(['INCOME', 'EXPENSE'], {
      message: '거래 유형을 선택해주세요',
    }),
    categoryId: z.string().min(1, '카테고리를 선택해주세요'),
  }),
});

// 거래 수정 스키마
export const updateTransactionSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    amount: z.number().positive('금액은 양수여야 합니다').optional(),
    description: z.string().optional(),
    date: z.string().datetime('유효한 날짜 형식이어야 합니다').optional(),
    type: z.enum(['INCOME', 'EXPENSE']).optional(),
    categoryId: z.string().min(1).optional(),
  }),
});

// 거래 조회 (필터링) 스키마
export const getTransactionsSchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 20)),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    type: z.enum(['INCOME', 'EXPENSE']).optional(),
    categoryId: z.string().optional(),
    search: z.string().optional(),
    sortBy: z.enum(['date', 'amount', 'createdAt']).optional().default('date'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

// 거래 삭제 스키마
export const deleteTransactionSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

// 거래 ID로 조회 스키마
export const getTransactionByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

// 통계 조회 스키마
export const getStatisticsSchema = z.object({
  query: z.object({
    startDate: z.string().datetime('유효한 날짜 형식이어야 합니다'),
    endDate: z.string().datetime('유효한 날짜 형식이어야 합니다'),
    groupBy: z.enum(['day', 'week', 'month', 'category']).optional().default('day'),
  }),
});

// 대량 거래 입력 스키마
export const bulkCreateTransactionsSchema = z.object({
  body: z.object({
    transactions: z.array(
      z.object({
        amount: z.number().positive(),
        description: z.string().optional(),
        date: z.string().datetime(),
        type: z.enum(['INCOME', 'EXPENSE']),
        categoryId: z.string().min(1),
      })
    ).min(1, '최소 1개 이상의 거래가 필요합니다'),
  }),
});
