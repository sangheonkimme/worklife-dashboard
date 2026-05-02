import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email?: string;
    iat?: number;
    exp?: number;
  };
}

/**
 * Next.js Route Handler 프록시가 발급한 PROXY_JWT 를 검증.
 * Authorization: Bearer <jwt> 헤더 필수.
 */
export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: '인증 토큰이 필요합니다',
      });
      return;
    }

    const secret = process.env.PROXY_JWT_SECRET;
    if (!secret) {
      res.status(500).json({
        success: false,
        message: 'PROXY_JWT_SECRET 환경변수가 설정되지 않았습니다',
      });
      return;
    }

    const decoded = jwt.verify(token, secret) as {
      userId: string;
      email?: string;
      iat?: number;
      exp?: number;
    };

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

// 가계부 API 등에서 import 한 alias 유지
export const authenticate = authenticateToken;
