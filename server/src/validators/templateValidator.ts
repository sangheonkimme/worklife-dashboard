import { z } from 'zod';
import { NoteType } from '@prisma/client';

export const createTemplateSchema = z.object({
  body: z.object({
    name: z.string().min(1, '템플릿 이름을 입력하세요').max(100),
    description: z.string().max(500).optional(),
    content: z.string(),
    type: z.nativeEnum(NoteType).optional(),
  }),
});

export const updateTemplateSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional().nullable(),
    content: z.string().optional(),
    type: z.nativeEnum(NoteType).optional(),
  }),
});

export const getTemplateByIdSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export const deleteTemplateSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});
