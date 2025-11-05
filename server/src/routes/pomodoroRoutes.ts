import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  createSessionSchema,
  statsQuerySchema,
  sessionsQuerySchema,
  updateSettingsSchema,
} from '../validators/pomodoroValidator';
import * as pomodoroController from '../controllers/pomodoroController';

const router = Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(authenticate);

// GET /api/pomodoro/stats - 통계 조회
router.get('/stats', validate(statsQuerySchema), pomodoroController.getStats);

// GET /api/pomodoro/sessions - 세션 목록 조회
router.get(
  '/sessions',
  validate(sessionsQuerySchema),
  pomodoroController.getSessions
);

// POST /api/pomodoro/sessions - 세션 생성
router.post(
  '/sessions',
  validate(createSessionSchema),
  pomodoroController.createSession
);

// GET /api/pomodoro/settings - 설정 조회
router.get('/settings', pomodoroController.getSettings);

// PUT /api/pomodoro/settings - 설정 업데이트
router.put(
  '/settings',
  validate(updateSettingsSchema),
  pomodoroController.updateSettings
);

export default router;
