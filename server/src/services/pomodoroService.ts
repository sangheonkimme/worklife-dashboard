import { prisma } from '../lib/prisma';
import type { PomodoroSessionType } from '@prisma/client';
import type {
  CreateSessionInput,
  StatsQueryInput,
  SessionsQueryInput,
  UpdateSettingsInput,
} from '../validators/pomodoroValidator';

/**
 * 포모도로 세션 생성
 */
export const createSession = async (userId: string, data: CreateSessionInput) => {
  return await prisma.pomodoroSession.create({
    data: {
      userId,
      type: data.type as PomodoroSessionType,
      duration: data.duration,
      completed: data.completed,
      startedAt: new Date(data.startedAt),
      completedAt: data.completedAt ? new Date(data.completedAt) : null,
      taskName: data.taskName,
      tags: data.tags,
      notes: data.notes,
    },
  });
};

/**
 * 세션 목록 조회
 */
export const getSessions = async (userId: string, query: SessionsQueryInput) => {
  const { limit, offset, startDate, endDate } = query;

  const where: any = {
    userId,
  };

  // 날짜 범위 필터
  if (startDate || endDate) {
    where.startedAt = {};
    if (startDate) {
      where.startedAt.gte = new Date(startDate);
    }
    if (endDate) {
      where.startedAt.lte = new Date(endDate);
    }
  }

  const [sessions, total] = await Promise.all([
    prisma.pomodoroSession.findMany({
      where,
      orderBy: { startedAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.pomodoroSession.count({ where }),
  ]);

  return {
    sessions,
    total,
    hasMore: offset + limit < total,
  };
};

/**
 * 통계 조회
 */
export const getStats = async (userId: string, query: StatsQueryInput) => {
  const { period } = query;

  // 기간 계산
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      const dayOfWeek = now.getDay();
      startDate = new Date(now);
      startDate.setDate(now.getDate() - dayOfWeek);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'all':
    default:
      startDate = new Date(0); // 모든 기간
      break;
  }

  // 전체 세션 조회
  const sessions = await prisma.pomodoroSession.findMany({
    where: {
      userId,
      startedAt: {
        gte: startDate,
      },
    },
    orderBy: { startedAt: 'desc' },
  });

  // 통계 계산
  const totalSessions = sessions.length;
  const completedSessions = sessions.filter((s: any) => s.completed).length;
  const totalFocusTime = sessions
    .filter((s: any) => s.type === 'FOCUS' && s.completed)
    .reduce((sum: number, s: any) => sum + s.duration, 0);

  // 오늘 완료한 세션 수
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayCompleted = sessions.filter(
    (s: any) => s.completed && s.startedAt >= todayStart
  ).length;

  // 연속 달성 일수 계산
  const currentStreak = await calculateStreak(userId);
  const longestStreak = await calculateLongestStreak(userId);

  return {
    totalSessions,
    completedSessions,
    totalFocusTime,
    todayCompleted,
    currentStreak,
    longestStreak,
  };
};

/**
 * 현재 연속 달성 일수 계산
 */
const calculateStreak = async (userId: string): Promise<number> => {
  const sessions = await prisma.pomodoroSession.findMany({
    where: {
      userId,
      completed: true,
      type: 'FOCUS',
    },
    orderBy: { startedAt: 'desc' },
    select: { startedAt: true },
  });

  if (sessions.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let currentDate = new Date(today);

  // 세션을 날짜별로 그룹화
  const dateSet = new Set(
    sessions.map((s: any) => {
      const date = new Date(s.startedAt);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    })
  );

  // 오늘부터 거꾸로 확인
  while (dateSet.has(currentDate.getTime())) {
    streak++;
    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
};

/**
 * 최장 연속 달성 일수 계산
 */
const calculateLongestStreak = async (userId: string): Promise<number> => {
  const sessions = await prisma.pomodoroSession.findMany({
    where: {
      userId,
      completed: true,
      type: 'FOCUS',
    },
    orderBy: { startedAt: 'asc' },
    select: { startedAt: true },
  });

  if (sessions.length === 0) return 0;

  // 세션을 날짜별로 그룹화
  const dateTimestamps = Array.from(
    new Set(
      sessions.map((s: any) => {
        const date = new Date(s.startedAt);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      })
    )
  );
  const dates = (dateTimestamps as number[]).sort((a, b) => a - b);

  let maxStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < dates.length; i++) {
    const prevDate = new Date(dates[i - 1]);
    const currDate = new Date(dates[i]);

    // 하루 차이인지 확인
    const diffDays = Math.floor(
      (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return maxStreak;
};

/**
 * 사용자 설정 조회 (없으면 기본값 생성)
 */
export const getSettings = async (userId: string) => {
  let settings = await prisma.pomodoroSettings.findUnique({
    where: { userId },
  });

  // 설정이 없으면 기본값 생성
  if (!settings) {
    settings = await createDefaultSettings(userId);
  }

  return settings;
};

/**
 * 기본 설정 생성
 */
export const createDefaultSettings = async (userId: string) => {
  return await prisma.pomodoroSettings.create({
    data: {
      userId,
      focusDuration: 1500, // 25분
      shortBreakDuration: 300, // 5분
      longBreakDuration: 900, // 15분
      longBreakInterval: 4,
      autoStartBreak: false,
      autoStartFocus: false,
      soundEnabled: true,
      soundVolume: 50,
      notificationEnabled: true,
    },
  });
};

/**
 * 설정 업데이트
 */
export const updateSettings = async (
  userId: string,
  data: UpdateSettingsInput
) => {
  // 설정이 없으면 먼저 생성
  await getSettings(userId);

  return await prisma.pomodoroSettings.update({
    where: { userId },
    data,
  });
};
