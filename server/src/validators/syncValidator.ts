import { z } from 'zod';

const isISODate = (value: string) => !Number.isNaN(Date.parse(value));

// Flutter 앱 동기화 API 스키마
export const getSyncSchema = z.object({
  query: z.object({
    since: z
      .string()
      .optional()
      .refine((val) => !val || isISODate(val), '유효한 ISO 날짜 문자열이어야 합니다'),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 200)),
  }),
});

export type GetSyncInput = z.infer<typeof getSyncSchema>['query'];
