import { z } from 'zod';

const timerPresetsSchema = z
  .array(z.number().int().min(1000).max(24 * 60 * 60 * 1000))
  .max(6);

export const updateUserSettingsSchema = z.object({
  body: z
    .object({
      locale: z.string().min(2).max(10).optional(),
      timezone: z.string().min(2).max(64).optional(),
      finance: z
        .object({
          payday: z.number().int().min(1).max(31).optional(),
          currency: z.string().length(3).optional(),
          weekStartsOn: z.number().int().min(0).max(6).optional(),
        })
        .optional(),
      appearance: z
        .object({
          colorScheme: z.enum(['light', 'dark', 'system']).optional(),
          sidebarPinned: z.boolean().optional(),
          widgetDockPosition: z.enum(['left', 'right']).optional(),
          widgetAutoClose: z.boolean().optional(),
        })
        .optional(),
      timers: z
        .object({
          presets: timerPresetsSchema.optional(),
          autoRepeat: z.boolean().optional(),
          preAlertMs: z
            .number()
            .int()
            .min(5000)
            .max(15 * 60 * 1000)
            .nullable()
            .optional(),
          notifications: z.boolean().optional(),
          soundEnabled: z.boolean().optional(),
        })
        .optional(),
      pomodoro: z
        .object({
          focusDuration: z.number().int().min(60).max(3600).optional(),
          shortBreakDuration: z.number().int().min(60).max(1800).optional(),
          longBreakDuration: z.number().int().min(300).max(5400).optional(),
          longBreakInterval: z.number().int().min(1).max(8).optional(),
          autoStartBreak: z.boolean().optional(),
          autoStartFocus: z.boolean().optional(),
          soundEnabled: z.boolean().optional(),
          soundVolume: z.number().int().min(0).max(100).optional(),
          notificationEnabled: z.boolean().optional(),
        })
        .optional(),
      stopwatch: z
        .object({
          defaultGoalTime: z
            .number()
            .int()
            .min(1000)
            .max(6 * 60 * 60 * 1000)
            .nullable()
            .optional(),
          notificationsEnabled: z.boolean().optional(),
        })
        .optional(),
      notifications: z
        .object({
          transactions: z.boolean().optional(),
          monthlyReport: z.boolean().optional(),
          checklist: z.boolean().optional(),
        })
        .optional(),
    })
    .strict(),
});
