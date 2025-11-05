import { z } from 'zod';

// 세션 타입 enum
export const sessionTypeSchema = z.enum(['FOCUS', 'SHORT_BREAK', 'LONG_BREAK']);

// 세션 생성 요청 검증
export const createSessionSchema = z.object({
  body: z.object({
    type: sessionTypeSchema,
    duration: z.number().int().positive(),
    completed: z.boolean().default(false),
    startedAt: z.string().datetime(),
    completedAt: z.string().datetime().optional(),
    taskName: z.string().optional(),
    tags: z.array(z.string()).default([]),
    notes: z.string().optional(),
  }),
});

// 통계 조회 쿼리 검증
export const statsQuerySchema = z.object({
  query: z.object({
    period: z.enum(['today', 'week', 'month', 'all']).default('today'),
  }),
});

// 세션 목록 조회 쿼리 검증
export const sessionsQuerySchema = z.object({
  query: z.object({
    limit: z.coerce.number().int().positive().max(100).default(50),
    offset: z.coerce.number().int().nonnegative().default(0),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
});

// 설정 업데이트 요청 검증
export const updateSettingsSchema = z.object({
  body: z.object({
    focusDuration: z.number().int().positive().optional(),
    shortBreakDuration: z.number().int().positive().optional(),
    longBreakDuration: z.number().int().positive().optional(),
    longBreakInterval: z.number().int().positive().optional(),
    autoStartBreak: z.boolean().optional(),
    autoStartFocus: z.boolean().optional(),
    soundEnabled: z.boolean().optional(),
    soundVolume: z.number().int().min(0).max(100).optional(),
    notificationEnabled: z.boolean().optional(),
  }),
});

// 타입 추출
export type CreateSessionInput = z.infer<typeof createSessionSchema>['body'];
export type StatsQueryInput = z.infer<typeof statsQuerySchema>['query'];
export type SessionsQueryInput = z.infer<typeof sessionsQuerySchema>['query'];
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>['body'];
