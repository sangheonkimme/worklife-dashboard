import { z } from 'zod';

// 메모 타입 enum
const noteTypeEnum = z.enum(['TEXT', 'CHECKLIST', 'MARKDOWN', 'QUICK']);

// 공개 설정 enum
const noteVisibilityEnum = z.enum(['PRIVATE', 'PUBLIC', 'PROTECTED']);

// 체크리스트 항목 스키마
const checklistItemSchema = z.object({
  content: z.string(),
  isCompleted: z.boolean().default(false),
  order: z.number().optional(),
});

// 메모 생성 스키마
export const createNoteSchema = z.object({
  body: z.object({
    title: z.string().min(1, '제목을 입력해주세요').max(255, '제목은 255자 이하여야 합니다'),
    content: z.string().optional().default(''),
    type: noteTypeEnum.optional().default('TEXT'),
    visibility: noteVisibilityEnum.optional().default('PRIVATE'),
    password: z.string().optional(),
    isPinned: z.boolean().optional().default(false),
    isFavorite: z.boolean().optional().default(false),
    isArchived: z.boolean().optional().default(false),
    folderId: z.string().optional().nullable(),
    checklistItems: z.array(checklistItemSchema).optional(),
    updatedAt: z.string().optional(), // Flutter 앱 동기화용
  }),
});

// 메모 수정 스키마
export const updateNoteSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    title: z.string().min(1, '제목을 입력해주세요').max(255, '제목은 255자 이하여야 합니다').optional(),
    content: z.string().optional(),
    type: noteTypeEnum.optional(),
    visibility: noteVisibilityEnum.optional(),
    password: z.string().optional().nullable(),
    isPinned: z.boolean().optional(),
    isFavorite: z.boolean().optional(),
    isArchived: z.boolean().optional(),
    folderId: z.string().optional().nullable(),
    checklistItems: z.array(checklistItemSchema).optional(),
    updatedAt: z.string().optional(), // Flutter 앱 동기화용
  }),
});

// 메모 조회 (필터링) 스키마
export const getNotesSchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 20)),
    type: noteTypeEnum.optional(),
    folderId: z.string().optional(),
    isPinned: z.string().optional().transform((val) => val === 'true'),
    isFavorite: z.string().optional().transform((val) => val === 'true'),
    isArchived: z.string().optional().transform((val) => val === 'true'),
    search: z.string().optional(),
    sortBy: z.enum(['createdAt', 'updatedAt', 'title']).optional().default('updatedAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

// 메모 삭제 스키마 (소프트 삭제)
export const deleteNoteSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

// 메모 ID로 조회 스키마
export const getNoteByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

// 휴지통 조회 스키마
export const getTrashNotesSchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 20)),
  }),
});

// 메모 복구 스키마
export const restoreNoteSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

// 메모 영구 삭제 스키마
export const permanentDeleteNoteSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

// 메모 고정/즐겨찾기/보관함 토글 스키마
export const toggleNoteFlagSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    flag: z.enum(['pinned', 'favorite', 'archived']),
    value: z.boolean(),
  }),
});
