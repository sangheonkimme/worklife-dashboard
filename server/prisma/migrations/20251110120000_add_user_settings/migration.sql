-- CreateTable
CREATE TABLE "user_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'ko-KR',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Seoul',
    "payday" INTEGER NOT NULL DEFAULT 1,
    "currency" TEXT NOT NULL DEFAULT 'KRW',
    "weekStartsOn" INTEGER NOT NULL DEFAULT 1,
    "colorScheme" TEXT NOT NULL DEFAULT 'dark',
    "sidebarPinned" BOOLEAN NOT NULL DEFAULT false,
    "widgetDockPosition" TEXT NOT NULL DEFAULT 'right',
    "widgetAutoClose" BOOLEAN NOT NULL DEFAULT false,
    "timerPresets" JSONB NOT NULL DEFAULT '[300000,600000,900000,1800000]'::jsonb,
    "timerAutoRepeat" BOOLEAN NOT NULL DEFAULT false,
    "timerPreAlertMs" INTEGER,
    "timerNotifications" BOOLEAN NOT NULL DEFAULT true,
    "timerSoundEnabled" BOOLEAN NOT NULL DEFAULT true,
    "pomodoroFocusDuration" INTEGER NOT NULL DEFAULT 1500,
    "pomodoroShortBreakDuration" INTEGER NOT NULL DEFAULT 300,
    "pomodoroLongBreakDuration" INTEGER NOT NULL DEFAULT 900,
    "pomodoroLongBreakInterval" INTEGER NOT NULL DEFAULT 4,
    "pomodoroAutoStartBreak" BOOLEAN NOT NULL DEFAULT false,
    "pomodoroAutoStartFocus" BOOLEAN NOT NULL DEFAULT false,
    "pomodoroSoundEnabled" BOOLEAN NOT NULL DEFAULT true,
    "pomodoroSoundVolume" INTEGER NOT NULL DEFAULT 50,
    "pomodoroNotificationEnabled" BOOLEAN NOT NULL DEFAULT true,
    "stopwatchDefaultGoalTime" INTEGER,
    "stopwatchNotificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "notifyTransactions" BOOLEAN NOT NULL DEFAULT true,
    "notifyMonthlyReport" BOOLEAN NOT NULL DEFAULT false,
    "notifyChecklist" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_settings_userId_key" ON "user_settings"("userId");

-- AddForeignKey
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
