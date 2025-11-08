/**
 * @openapi
 * components:
 *   schemas:
 *     FinanceSettings:
 *       type: object
 *       properties:
 *         payday:
 *           type: integer
 *           minimum: 1
 *           maximum: 31
 *           example: 25
 *         currency:
 *           type: string
 *           example: KRW
 *         weekStartsOn:
 *           type: integer
 *           minimum: 0
 *           maximum: 6
 *           example: 1
 *     AppearanceSettings:
 *       type: object
 *       properties:
 *         colorScheme:
 *           type: string
 *           enum: [light, dark, system]
 *           example: dark
 *         sidebarPinned:
 *           type: boolean
 *         widgetDockPosition:
 *           type: string
 *           enum: [left, right]
 *         widgetAutoClose:
 *           type: boolean
 *     TimerSettings:
 *       type: object
 *       properties:
 *         presets:
 *           type: array
 *           items:
 *             type: integer
 *             description: milliseconds
 *         autoRepeat:
 *           type: boolean
 *         preAlertMs:
 *           type: integer
 *           nullable: true
 *         notifications:
 *           type: boolean
 *         soundEnabled:
 *           type: boolean
 *     PomodoroSettings:
 *       type: object
 *       properties:
 *         focusDuration:
 *           type: integer
 *         shortBreakDuration:
 *           type: integer
 *         longBreakDuration:
 *           type: integer
 *         longBreakInterval:
 *           type: integer
 *         autoStartBreak:
 *           type: boolean
 *         autoStartFocus:
 *           type: boolean
 *         soundEnabled:
 *           type: boolean
 *         soundVolume:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *         notificationEnabled:
 *           type: boolean
 *     StopwatchSettings:
 *       type: object
 *       properties:
 *         defaultGoalTime:
 *           type: integer
 *           nullable: true
 *         notificationsEnabled:
 *           type: boolean
 *     NotificationSettings:
 *       type: object
 *       properties:
 *         transactions:
 *           type: boolean
 *         monthlyReport:
 *           type: boolean
 *         checklist:
 *           type: boolean
 *     UserSettingsResponse:
 *       type: object
 *       properties:
 *         locale:
 *           type: string
 *           example: ko-KR
 *         timezone:
 *           type: string
 *           example: Asia/Seoul
 *         finance:
 *           $ref: '#/components/schemas/FinanceSettings'
 *         appearance:
 *           $ref: '#/components/schemas/AppearanceSettings'
 *         timers:
 *           $ref: '#/components/schemas/TimerSettings'
 *         pomodoro:
 *           $ref: '#/components/schemas/PomodoroSettings'
 *         stopwatch:
 *           $ref: '#/components/schemas/StopwatchSettings'
 *         notifications:
 *           $ref: '#/components/schemas/NotificationSettings'
 */

/**
 * @openapi
 * /api/user-settings:
 *   get:
 *     tags: [User Settings]
 *     summary: Get current user settings
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns the current settings for the authenticated user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/UserSettingsResponse'
 *       401:
 *         description: Unauthorized
 *   put:
 *     tags: [User Settings]
 *     summary: Update user settings
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserSettingsResponse'
 *     responses:
 *       200:
 *         description: Returns updated settings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/UserSettingsResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
export {}; // only used for JSDoc references
