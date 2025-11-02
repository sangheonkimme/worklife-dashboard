import { z } from 'zod';

// 태그 생성 스키마
export const createTagSchema = z.object({
  body: z.object({
    name: z.string().min(1, '태그 이름은 필수입니다').max(50, '태그 이름은 50자 이하여야 합니다'),
    color: z.string().optional(),
  }),
});

// 태그 수정 스키마
export const updateTagSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    name: z.string().min(1, '태그 이름은 필수입니다').max(50, '태그 이름은 50자 이하여야 합니다').optional(),
    color: z.string().optional(),
  }),
});

// 태그 삭제 스키마
export const deleteTagSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

// 태그 자동완성 스키마
export const suggestTagsSchema = z.object({
  query: z.object({
    q: z.string().min(1, '검색어는 필수입니다'),
    limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  }),
});

// 태그 목록 조회 스키마
export const getTagsSchema = z.object({
  query: z.object({
    includeCount: z.string().optional().transform(val => val === 'true'),
  }),
});

export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;
export type DeleteTagInput = z.infer<typeof deleteTagSchema>;
export type SuggestTagsInput = z.infer<typeof suggestTagsSchema>;
export type GetTagsInput = z.infer<typeof getTagsSchema>;
