import { Router } from 'express';
import {
  register,
  login,
  logout,
  me,
  refreshToken,
  updateProfile,
} from '../controllers/authController';
import { authenticateToken, authenticateRefreshToken } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
} from '../validators/authValidator';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    회원가입
 * @access  Public
 */
router.post('/register', validate(registerSchema), register);

/**
 * @route   POST /api/auth/login
 * @desc    로그인
 * @access  Public
 */
router.post('/login', validate(loginSchema), login);

/**
 * @route   POST /api/auth/logout
 * @desc    로그아웃
 * @access  Public
 */
router.post('/logout', logout);

/**
 * @route   GET /api/auth/me
 * @desc    현재 사용자 정보 조회
 * @access  Private
 */
router.get('/me', authenticateToken, me);

/**
 * @route   POST /api/auth/refresh
 * @desc    액세스 토큰 갱신
 * @access  Private (리프레시 토큰 필요)
 */
router.post('/refresh', authenticateRefreshToken, refreshToken);

/**
 * @route   PUT /api/auth/profile
 * @desc    프로필 업데이트
 * @access  Private
 */
router.put('/profile', authenticateToken, validate(updateProfileSchema), updateProfile);

export default router;
