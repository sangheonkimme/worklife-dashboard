import { z } from 'zod';

// 공통 ID 파라미터 스키마
const idParamsSchema = z.object({
  id: z.string().min(1, 'ID가 필요합니다'),
});

// 대시보드 체크리스트 항목 생성
export const createDashboardChecklistItemSchema = z.object({
  body: z.object({
    content: z
      .string()
      .min(1, '내용을 입력해주세요')
      .max(60, '최대 60자까지 입력할 수 있습니다'),
  }),
});

// 항목 업데이트 (내용 수정 또는 완료 토글)
export const updateDashboardChecklistItemSchema = z.object({
  params: idParamsSchema,
  body: z
    .object({
      content: z
        .string()
        .min(1, '내용을 입력해주세요')
        .max(60, '최대 60자까지 입력할 수 있습니다')
        .optional(),
      isCompleted: z.boolean().optional(),
      order: z
        .number()
        .int()
        .min(0)
        .max(100)
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: '업데이트할 필드를 최소 1개 이상 포함해야 합니다',
    }),
});

// 항목 삭제
export const deleteDashboardChecklistItemSchema = z.object({
  params: idParamsSchema,
});
