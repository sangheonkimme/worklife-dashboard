import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

/**
 * Zod 스키마를 사용하여 요청을 검증하는 미들웨어
 * @param schema Zod 스키마 객체
 */
export const validate = (schema: z.ZodTypeAny) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        }));

        res.status(400).json({
          success: false,
          message: "입력 데이터가 올바르지 않습니다",
          errors,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "검증 중 오류가 발생했습니다",
      });
    }
  };
};
