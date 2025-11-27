import { z } from 'zod';

const isISODate = (value: string) => !Number.isNaN(Date.parse(value));

export const getSyncSchema = z.object({
  query: z.object({
    since: z
      .string()
      .nonempty('since 쿼리 파라미터가 필요합니다')
      .refine(isISODate, '유효한 ISO 날짜 문자열이어야 합니다'),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 200))
      .refine((val) => val > 0 && val <= 1000, 'limit는 1~1000 사이여야 합니다')
      .optional(),
  }),
});

export const getSyncMetaSchema = z.object({
  query: z.object({}),
});

export type GetSyncInput = z.infer<typeof getSyncSchema>['query'];
