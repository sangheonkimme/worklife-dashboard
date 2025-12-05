import type { Response, NextFunction } from 'express';
import { syncService } from '../services/syncService';
import type { AuthRequest } from '../middlewares/auth';

export const syncController = {
  /**
   * GET /api/sync - Flutter 앱 동기화 데이터 조회
   */
  async getSync(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { since, limit } = req.query as { since?: string; limit?: number };

      const result = await syncService.getSyncData(userId, { since, limit });

      res.json(result);
    } catch (error) {
      next(error);
    }
  },
};
