import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { subscriptionService } from '../services/subscriptionService';

export const subscriptionController = {
  async summary(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const summary = await subscriptionService.summary(userId);
      res.json({ success: true, data: summary });
    } catch (error) {
      next(error);
    }
  },

  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const filters = {
        ...req.query,
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
      } as any;

      const result = await subscriptionService.list(userId, filters);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const subscription = await subscriptionService.create(userId, req.body);
      res.status(201).json({ success: true, data: subscription });
    } catch (error) {
      next(error);
    }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const subscription = await subscriptionService.update(userId, id, req.body);
      res.json({ success: true, data: subscription });
    } catch (error) {
      next(error);
    }
  },

  async cancel(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const reason = req.body?.reason;
      const subscription = await subscriptionService.cancel(userId, id, reason);
      res.json({ success: true, data: subscription });
    } catch (error) {
      next(error);
    }
  },
};
