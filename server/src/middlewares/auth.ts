import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, verifyRefreshToken } from '../utils/jwt';

/**
 * JWT 액세스 토큰을 검증하는 미들웨어
 */
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        message: '인증 토큰이 필요합니다',
      });
      return;
    }

    const decoded = verifyAccessToken(token);

    // @ts-ignore - Request 객체에 user 속성 추가
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'TokenExpiredError') {
        res.status(401).json({
          success: false,
          message: '토큰이 만료되었습니다',
          code: 'TOKEN_EXPIRED',
        });
        return;
      }
      if (error.name === 'JsonWebTokenError') {
        res.status(401).json({
          success: false,
          message: '유효하지 않은 토큰입니다',
        });
        return;
      }
    }
    res.status(500).json({
      success: false,
      message: '토큰 검증 중 오류가 발생했습니다',
    });
  }
};

/**
 * JWT 리프레시 토큰을 검증하는 미들웨어
 */
export const authenticateRefreshToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      res.status(401).json({
        success: false,
        message: '리프레시 토큰이 필요합니다',
      });
      return;
    }

    const decoded = verifyRefreshToken(refreshToken);

    // @ts-ignore - Request 객체에 user 속성 추가
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'TokenExpiredError') {
        res.status(401).json({
          success: false,
          message: '리프레시 토큰이 만료되었습니다',
          code: 'REFRESH_TOKEN_EXPIRED',
        });
        return;
      }
      if (error.name === 'JsonWebTokenError') {
        res.status(401).json({
          success: false,
          message: '유효하지 않은 리프레시 토큰입니다',
        });
        return;
      }
    }
    res.status(500).json({
      success: false,
      message: '토큰 검증 중 오류가 발생했습니다',
    });
  }
};
