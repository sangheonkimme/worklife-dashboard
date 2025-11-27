import { Request, Response, NextFunction, CookieOptions } from 'express';
import {
  createUser,
  findUserByEmail,
  findUserById,
  findUserByIdWithPassword,
  updateUser,
  verifyPassword,
  isEmailTaken,
  findUserByGoogleId,
  createGoogleUser,
} from '../services/userService';
import { generateAccessToken } from '../utils/jwt';
import { OAuth2Client } from 'google-auth-library';
import {
  createRefreshSession,
  rotateRefreshSession,
  revokeAllSessionsForUser,
  revokeSessionById,
  validateRefreshToken,
} from '../services/refreshTokenService';

const isProduction = process.env.NODE_ENV === 'production';
const refreshTokenMaxAgeMs =
  Number(process.env.JWT_REFRESH_EXPIRES_IN_MS) || 7 * 24 * 60 * 60 * 1000;
const refreshTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  maxAge: refreshTokenMaxAgeMs,
  domain: process.env.COOKIE_DOMAIN || undefined,
};

const allowedOrigins = Array.from(
  new Set(
    (process.env.CLIENT_URL || '')
      .split(',')
      .map((url) => url.trim().replace(/\/$/, ''))
      .filter(Boolean)
  )
);

const isOriginAllowed = (originHeader?: string | null) => {
  if (!originHeader) return false;
  try {
    const origin = new URL(originHeader).origin;
    return (
      allowedOrigins.includes(origin) ||
      origin === 'http://localhost:3000' ||
      origin === 'http://localhost:5173' ||
      origin === 'https://worklife-dashboard.com' ||
      origin === 'https://www.worklife-dashboard.com' ||
      origin === 'https://worklife-dashboard.vercel.app'
    );
  } catch (error) {
    return false;
  }
};

const getClientContext = (req: Request) => ({
  ipAddress:
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket.remoteAddress ||
    null,
  userAgent: req.headers['user-agent'] || null,
});

/**
 * 회원가입
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    // 이메일 중복 확인
    const emailExists = await isEmailTaken(email);
    if (emailExists) {
      res.status(409).json({
        success: false,
        message: '이미 사용 중인 이메일입니다',
      });
      return;
    }

    // 사용자 생성
    const user = await createUser({ email, password, name });

    // 세션/토큰 생성
    const { session, refreshToken } = await createRefreshSession({
      userId: user.id,
      ...getClientContext(req),
    });
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      sessionId: session.id,
    });

    // 리프레시 토큰을 HttpOnly 쿠키로 설정
    res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);

    res.status(201).json({
      success: true,
      message: '회원가입이 완료되었습니다',
      data: {
        user,
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 로그인
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // 사용자 조회
    const user = await findUserByEmail(email);
    if (!user || !user.password) {
      res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 올바르지 않습니다',
      });
      return;
    }

    // 비밀번호 검증
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 올바르지 않습니다',
      });
      return;
    }

    // 세션/토큰 생성
    const { session, refreshToken } = await createRefreshSession({
      userId: user.id,
      ...getClientContext(req),
    });
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      sessionId: session.id,
    });

    // 리프레시 토큰을 HttpOnly 쿠키로 설정
    res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);

    // 비밀번호 제외한 사용자 정보
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      message: '로그인이 완료되었습니다',
      data: {
        user: userWithoutPassword,
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 로그아웃
 */
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const rawRefreshToken = req.cookies.refreshToken;
    if (rawRefreshToken) {
      const validation = await validateRefreshToken(rawRefreshToken);
      if (validation.status === 'VALID' && validation.sessionId) {
        await revokeSessionById(validation.sessionId);
      }
    }

    // 쿠키 삭제
    res.clearCookie('refreshToken', refreshTokenCookieOptions);

    res.status(200).json({
      success: true,
      message: '로그아웃이 완료되었습니다',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 현재 사용자 정보 조회
 */
export const me = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // @ts-ignore - authenticateToken 미들웨어에서 설정됨
    const userId = req.user.userId;

    const user = await findUserById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 토큰 갱신
 */
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const rawRefreshToken = req.cookies.refreshToken;

    if (!rawRefreshToken) {
      res.status(401).json({
        success: false,
        message: '리프레시 토큰이 없습니다',
        code: 'REFRESH_TOKEN_MISSING',
      });
      return;
    }

    if (isProduction) {
      const originHeader = req.headers.origin || req.headers.referer;
      if (!isOriginAllowed(originHeader)) {
        res.status(403).json({
          success: false,
          message: '허용되지 않은 요청 출처입니다',
          code: 'CSRF_CHECK_FAILED',
        });
        return;
      }
    }

    const validation = await validateRefreshToken(rawRefreshToken);

    if ((validation.status === 'REVOKED' || validation.status === 'INVALID') && validation.userId) {
      await revokeAllSessionsForUser(validation.userId);
    }

    if (validation.status !== 'VALID' || !validation.userId || !validation.sessionId) {
      res.status(401).json({
        success: false,
        message: '유효하지 않은 리프레시 토큰입니다',
        code: validation.status,
      });
      return;
    }

    const user = await findUserById(validation.userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다',
      });
      return;
    }

    const { session, refreshToken: rotatedToken } = await rotateRefreshSession(rawRefreshToken, {
      ...getClientContext(req),
    });

    // 새로운 액세스 토큰 생성
    const newAccessToken = generateAccessToken({
      userId: validation.userId,
      email: user.email,
      sessionId: session.id,
    });

    // 회전된 리프레시 토큰을 쿠키로 다시 설정
    res.cookie('refreshToken', rotatedToken, refreshTokenCookieOptions);

    res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 프로필 업데이트
 */
export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // @ts-ignore
    const userId = req.user.userId;
    const { name, currentPassword, newPassword } = req.body;

    // 비밀번호 변경 시 현재 비밀번호 확인
    if (newPassword) {
      if (!currentPassword) {
        res.status(400).json({
          success: false,
          message: '현재 비밀번호를 입력해주세요',
        });
        return;
      }

      const user = await findUserByIdWithPassword(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: '사용자를 찾을 수 없습니다',
        });
        return;
      }

      const isPasswordValid = await verifyPassword(currentPassword, user.password!);
      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          message: '현재 비밀번호가 올바르지 않습니다',
        });
        return;
      }
    }

    // 프로필 업데이트 (이메일 변경 불가)
    const updatedUser = await updateUser(userId, {
      name,
      password: newPassword,
    });

    if (newPassword) {
      await revokeAllSessionsForUser(userId);
      res.clearCookie('refreshToken', refreshTokenCookieOptions);
    }

    res.status(200).json({
      success: true,
      message: '프로필이 업데이트되었습니다',
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Google 로그인
 */
export const googleLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { credential } = req.body;

    if (!credential) {
      res.status(400).json({
        success: false,
        message: 'Google credential이 필요합니다',
      });
      return;
    }

    // Google OAuth Client 초기화
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    // Google ID 토큰 검증
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      res.status(401).json({
        success: false,
        message: 'Google 인증에 실패했습니다',
      });
      return;
    }

    const { sub: googleId, email, name, picture, email_verified: emailVerified } = payload as any;

    if (!email || !name) {
      res.status(400).json({
        success: false,
        message: 'Google 계정 정보가 불완전합니다',
      });
      return;
    }

    if (emailVerified === false) {
      res.status(401).json({
        success: false,
        message: '이메일이 검증되지 않은 Google 계정입니다',
      });
      return;
    }

    // Google ID로 기존 사용자 확인
    let user = await findUserByGoogleId(googleId);

    // 기존 사용자가 없으면 이메일로 확인
    if (!user) {
      const existingUser = await findUserByEmail(email);
      if (existingUser) {
        // 이메일은 존재하지만 Google 계정이 연결되지 않은 경우
        res.status(409).json({
          success: false,
          message: '이미 등록된 이메일입니다. 일반 로그인을 사용해주세요.',
        });
        return;
      }

      // 새로운 사용자 생성
      user = await createGoogleUser({
        email,
        name,
        googleId,
        picture,
      });
    }

    // 세션/토큰 생성
    const { session, refreshToken } = await createRefreshSession({
      userId: user.id,
      ...getClientContext(req),
    });
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      sessionId: session.id,
    });

    // 리프레시 토큰을 HttpOnly 쿠키로 설정
    res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);

    res.status(200).json({
      success: true,
      message: '로그인이 완료되었습니다',
      data: {
        user,
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};
