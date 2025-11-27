import { z } from 'zod';

// 폴더 생성 스키마
export const createFolderSchema = z.object({
  body: z.object({
    name: z.string().min(1, '폴더 이름은 필수입니다').max(100, '폴더 이름은 100자 이하여야 합니다'),
    color: z.string().optional(),
    icon: z.string().optional(),
    parentId: z.any().optional().transform(() => undefined),
  }),
});

// 폴더 수정 스키마
export const updateFolderSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    name: z.string().min(1, '폴더 이름은 필수입니다').max(100, '폴더 이름은 100자 이하여야 합니다').optional(),
    color: z.string().optional(),
    icon: z.string().optional(),
    parentId: z.any().optional().transform(() => undefined),
  }),
});

// 폴더 이동 스키마
export const moveFolderSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    parentId: z.any().optional().transform(() => null), // 이동은 루트 외 불가
  }),
});

// 폴더 삭제 스키마
export const deleteFolderSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

// 폴더 목록 조회 스키마
export const getFoldersSchema = z.object({
  query: z.object({
    includeChildren: z.string().optional().transform(val => val === 'true'),
  }),
});

export type CreateFolderInput = z.infer<typeof createFolderSchema>;
export type UpdateFolderInput = z.infer<typeof updateFolderSchema>;
export type MoveFolderInput = z.infer<typeof moveFolderSchema>;
export type DeleteFolderInput = z.infer<typeof deleteFolderSchema>;
export type GetFoldersInput = z.infer<typeof getFoldersSchema>;
