import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth';
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
  updateLastLoginAt,
} from '../services/userService';

/**
 * 회원가입 — 사용자만 생성. 세션은 NextAuth 가 별도로 처리
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    const emailExists = await isEmailTaken(email);
    if (emailExists) {
      res.status(409).json({
        success: false,
        message: '이미 사용 중인 이메일입니다',
      });
      return;
    }

    const user = await createUser({ email, password, name });

    res.status(201).json({
      success: true,
      message: '회원가입이 완료되었습니다',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 현재 사용자 정보 조회 (NextAuth Route Handler 프록시 경유)
 */
export const me = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const user = await findUserById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다',
      });
      return;
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

/**
 * 프로필 업데이트
 */
export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { name, currentPassword, newPassword } = req.body;

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

      const isPasswordValid = await verifyPassword(
        currentPassword,
        user.password!,
      );
      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          message: '현재 비밀번호가 올바르지 않습니다',
        });
        return;
      }
    }

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

/**
 * NextAuth Credentials provider 전용 비밀번호 검증
 */
export const verifyCredentials = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'email/password 필수' });
      return;
    }

    const user = await findUserByEmail(email);
    if (!user || !user.password) {
      res.status(401).json({ success: false, message: '인증 실패' });
      return;
    }

    const ok = await verifyPassword(password, user.password);
    if (!ok) {
      res.status(401).json({ success: false, message: '인증 실패' });
      return;
    }

    await updateLastLoginAt(user.id);

    const { password: _pw, ...safeUser } = user;
    res.status(200).json({ success: true, data: { user: safeUser } });
  } catch (error) {
    next(error);
  }
};

/**
 * NextAuth Google OAuth 로그인 후 사용자 동기화
 */
export const syncOAuthUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, name, googleId, picture } = req.body;

    if (!email || !googleId) {
      res.status(400).json({ success: false, message: 'email/googleId 필수' });
      return;
    }

    let user = await findUserByGoogleId(googleId);

    if (!user) {
      const existingByEmail = await findUserByEmail(email);
      if (existingByEmail) {
        res.status(409).json({
          success: false,
          message: '이미 등록된 이메일입니다. 일반 로그인을 사용해주세요',
        });
        return;
      }

      user = await createGoogleUser({
        email,
        name: name || email.split('@')[0],
        googleId,
        picture,
      });
    }

    await updateLastLoginAt(user.id);

    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};
