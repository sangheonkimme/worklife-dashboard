import { z } from 'zod';

// 예산 생성 스키마
export const createBudgetSchema = z.object({
  body: z.object({
    categoryId: z.string().optional(), // null이면 전체 예산
    amount: z.number().positive('예산은 양수여야 합니다'),
    month: z.string().datetime('유효한 날짜 형식이어야 합니다'), // YYYY-MM-01 형식
  }),
});

// 예산 수정 스키마
export const updateBudgetSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    amount: z.number().positive('예산은 양수여야 합니다'),
  }),
});

// 예산 삭제 스키마
export const deleteBudgetSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

// 예산 조회 스키마
export const getBudgetsSchema = z.object({
  query: z.object({
    month: z.string().datetime().optional(), // 특정 월, 없으면 현재 월
    categoryId: z.string().optional(),
  }),
});

// 예산 ID로 조회 스키마
export const getBudgetByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

// 예산 사용 현황 조회 스키마
export const getBudgetStatusSchema = z.object({
  query: z.object({
    month: z.string().datetime().optional(), // 특정 월, 없으면 현재 월
  }),
});
