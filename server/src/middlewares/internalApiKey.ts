import { Request, Response, NextFunction } from "express";

/**
 * Next.js Route Handler 등 내부 호출 전용 엔드포인트를 보호하는 미들웨어.
 * `x-internal-key` 헤더가 환경변수 INTERNAL_API_KEY 와 일치할 때만 통과.
 */
export const requireInternalApiKey = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const expected = process.env.INTERNAL_API_KEY;

  if (!expected) {
    res.status(500).json({
      success: false,
      message: "INTERNAL_API_KEY 환경변수가 설정되지 않았습니다",
    });
    return;
  }

  const provided = req.headers["x-internal-key"];
  if (typeof provided !== "string" || provided !== expected) {
    res.status(401).json({
      success: false,
      message: "내부 API 인증에 실패했습니다",
    });
    return;
  }

  next();
};
