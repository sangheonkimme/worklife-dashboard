import { Router } from 'express';
import {
  register,
  me,
  updateProfile,
  verifyCredentials,
  syncOAuthUser,
} from '../controllers/authController';
import { authenticateToken } from '../middlewares/auth';
import { requireInternalApiKey } from '../middlewares/internalApiKey';
import { authLimiter } from '../middlewares/rateLimiter';
import { validate } from '../middlewares/validate';
import {
  registerSchema,
  updateProfileSchema,
} from '../validators/authValidator';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    회원가입 (사용자만 생성, 세션은 NextAuth 가 별도 처리)
 * @access  Public
 */
router.post('/register', authLimiter, validate(registerSchema), register);

/**
 * @route   GET /api/auth/me
 * @desc    현재 사용자 정보 조회
 * @access  Private (PROXY_JWT)
 */
router.get('/me', authenticateToken, me);

/**
 * @route   PUT /api/auth/profile
 * @desc    프로필 업데이트
 * @access  Private (PROXY_JWT)
 */
router.put(
  '/profile',
  authenticateToken,
  validate(updateProfileSchema),
  updateProfile
);

/**
 * @route   POST /api/auth/credentials/verify
 * @desc    NextAuth Credentials provider 전용 비밀번호 검증
 * @access  Internal (INTERNAL_API_KEY)
 */
router.post(
  '/credentials/verify',
  requireInternalApiKey,
  authLimiter,
  verifyCredentials
);

/**
 * @route   POST /api/auth/oauth/sync
 * @desc    NextAuth OAuth 콜백에서 호출 — DB 사용자 동기화
 * @access  Internal (INTERNAL_API_KEY)
 */
router.post('/oauth/sync', requireInternalApiKey, syncOAuthUser);

export default router;
