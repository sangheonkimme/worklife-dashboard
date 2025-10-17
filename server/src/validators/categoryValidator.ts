import { z } from 'zod';

// 카테고리 생성 스키마
export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, '카테고리 이름을 입력해주세요'),
    type: z.enum(['INCOME', 'EXPENSE'], {
      message: '카테고리 유형을 선택해주세요',
    }),
    color: z.string().optional(),
    icon: z.string().optional(),
  }),
});

// 카테고리 수정 스키마
export const updateCategorySchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    color: z.string().optional(),
    icon: z.string().optional(),
  }),
});

// 카테고리 삭제 스키마
export const deleteCategorySchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  query: z.object({
    reassignTo: z.string().optional(), // 거래를 재할당할 카테고리 ID
  }),
});

// 카테고리 조회 스키마
export const getCategoriesSchema = z.object({
  query: z.object({
    type: z.enum(['INCOME', 'EXPENSE']).optional(),
    includeDefault: z
      .string()
      .optional()
      .transform((val) => val === 'true'),
  }),
});

// 카테고리 ID로 조회 스키마
export const getCategoryByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});
