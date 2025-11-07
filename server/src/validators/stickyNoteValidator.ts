import { z } from 'zod';

// 스티커 메모 생성 스키마
export const createStickyNoteSchema = z.object({
  body: z.object({
    content: z.string().default(''),
    color: z.string().regex(/^#[0-9A-F]{6}$/i, '유효한 색상 코드를 입력해주세요 (예: #FFF9C4)').default('#FFF9C4'),
    position: z.number().int().min(0).max(2, '위치는 0-2 사이여야 합니다').default(0),
  }),
});

// 스티커 메모 수정 스키마
export const updateStickyNoteSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    content: z.string().optional(),
    color: z.string().regex(/^#[0-9A-F]{6}$/i, '유효한 색상 코드를 입력해주세요 (예: #FFF9C4)').optional(),
    position: z.number().int().min(0).max(2, '위치는 0-2 사이여야 합니다').optional(),
  }),
});

// 스티커 메모 삭제 스키마
export const deleteStickyNoteSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

// 스티커 메모 ID로 조회 스키마
export const getStickyNoteByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});
