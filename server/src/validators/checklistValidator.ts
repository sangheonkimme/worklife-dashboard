import { z } from 'zod';

export const createChecklistItemSchema = z.object({
  body: z.object({
    content: z.string().min(1, '내용을 입력하세요').max(500),
    order: z.number().int().min(0).optional(),
  }),
});

export const updateChecklistItemSchema = z.object({
  body: z.object({
    content: z.string().min(1).max(500).optional(),
    isCompleted: z.boolean().optional(),
    order: z.number().int().min(0).optional(),
  }),
});

export const toggleChecklistItemSchema = z.object({
  body: z.object({
    isCompleted: z.boolean(),
  }),
});

export const reorderChecklistItemsSchema = z.object({
  body: z.object({
    items: z.array(
      z.object({
        id: z.string(),
        order: z.number().int().min(0),
      })
    ),
  }),
});
