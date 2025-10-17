import { Request, Response, NextFunction } from 'express';
import {
  createUser,
  findUserByEmail,
  findUserById,
  findUserByIdWithPassword,
  updateUser,
  verifyPassword,
  isEmailTaken,
} from '../services/userService';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';

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

    // JWT 토큰 생성
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
    });
    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
    });

    // 리프레시 토큰을 HttpOnly 쿠키로 설정
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
    });

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
    if (!user) {
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

    // JWT 토큰 생성
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
    });
    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
    });

    // 리프레시 토큰을 HttpOnly 쿠키로 설정
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
    });

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
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 쿠키 삭제
    res.clearCookie('refreshToken');

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
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      res.status(401).json({
        success: false,
        message: '리프레시 토큰이 없습니다',
      });
      return;
    }

    // 리프레시 토큰 검증은 미들웨어에서 처리됨
    // @ts-ignore
    const { userId, email } = req.user;

    // 새로운 액세스 토큰 생성
    const newAccessToken = generateAccessToken({ userId, email });

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

      const isPasswordValid = await verifyPassword(currentPassword, user.password);
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

    res.status(200).json({
      success: true,
      message: '프로필이 업데이트되었습니다',
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};
