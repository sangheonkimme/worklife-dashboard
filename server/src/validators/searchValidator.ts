import { z } from 'zod';
import { NoteType } from '@prisma/client';

// 검색 스키마
export const searchNotesSchema = z.object({
  query: z.object({
    q: z.string().min(1, '검색어는 필수입니다'),
    type: z.nativeEnum(NoteType).optional(),
    folderId: z.string().optional(),
    dateFrom: z.string().optional().transform(val => val ? new Date(val) : undefined),
    dateTo: z.string().optional().transform(val => val ? new Date(val) : undefined),
    isPinned: z.string().optional().transform(val => val === 'true'),
    isFavorite: z.string().optional().transform(val => val === 'true'),
    isArchived: z.string().optional().transform(val => val === 'true'),
    page: z.string().optional().transform(val => val ? parseInt(val) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val) : 20),
  }),
});

// 검색 제안 스키마
export const searchSuggestionsSchema = z.object({
  query: z.object({
    q: z.string().min(1, '검색어는 필수입니다'),
    limit: z.string().optional().transform(val => val ? parseInt(val) : 5),
  }),
});

export type SearchNotesInput = z.infer<typeof searchNotesSchema>;
export type SearchSuggestionsInput = z.infer<typeof searchSuggestionsSchema>;
