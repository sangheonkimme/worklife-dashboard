import { Response, NextFunction } from 'express';
import { syncService } from '../services/syncService';
import { AuthRequest } from '../middlewares/auth';

export const syncController = {
  async getChanges(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { since, limit } = req.query as { since: string; limit?: string };

      const sinceDate = new Date(since);
      const numericLimit = limit ? Number(limit) : 200;

      const result = await syncService.getChangesSince(userId, {
        since: sinceDate,
        limit: Number.isFinite(numericLimit) ? numericLimit : 200,
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getMeta(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;

      const latestTimestamp = await syncService.getLatestTimestamp(userId);

      res.json({ latestTimestamp });
    } catch (error) {
      next(error);
    }
  },
};
