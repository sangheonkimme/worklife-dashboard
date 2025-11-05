import type { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import * as pomodoroService from '../services/pomodoroService';
import type {
  CreateSessionInput,
  StatsQueryInput,
  SessionsQueryInput,
  UpdateSettingsInput,
} from '../validators/pomodoroValidator';

/**
 * GET /api/pomodoro/stats
 * 포모도로 통계 조회
 */
export const getStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const query = req.query as unknown as StatsQueryInput;

    const stats = await pomodoroService.getStats(userId, query);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error getting pomodoro stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pomodoro stats',
    });
  }
};

/**
 * GET /api/pomodoro/sessions
 * 포모도로 세션 목록 조회
 */
export const getSessions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const query = req.query as unknown as SessionsQueryInput;

    const result = await pomodoroService.getSessions(userId, query);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error getting pomodoro sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pomodoro sessions',
    });
  }
};

/**
 * POST /api/pomodoro/sessions
 * 포모도로 세션 생성
 */
export const createSession = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const data = req.body as CreateSessionInput;

    const session = await pomodoroService.createSession(userId, data);

    res.status(201).json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error('Error creating pomodoro session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create pomodoro session',
    });
  }
};

/**
 * GET /api/pomodoro/settings
 * 포모도로 설정 조회
 */
export const getSettings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const settings = await pomodoroService.getSettings(userId);

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Error getting pomodoro settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pomodoro settings',
    });
  }
};

/**
 * PUT /api/pomodoro/settings
 * 포모도로 설정 업데이트
 */
export const updateSettings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const data = req.body as UpdateSettingsInput;

    const settings = await pomodoroService.updateSettings(userId, data);

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Error updating pomodoro settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update pomodoro settings',
    });
  }
};
