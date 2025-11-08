import type { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { userSettingsService } from '../services/userSettingsService';

export const userSettingsController = {
  async getSettings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const settings = await userSettingsService.getUserSettings(userId);
      res.json({ success: true, data: settings });
    } catch (error) {
      next(error);
    }
  },

  async updateSettings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const updated = await userSettingsService.updateUserSettings(userId, req.body);
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  },
};
