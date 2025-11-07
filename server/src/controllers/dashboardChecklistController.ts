import { Response, NextFunction } from 'express';
import { dashboardChecklistService } from '../services/dashboardChecklistService';
import { AuthRequest } from '../middlewares/auth';

export const dashboardChecklistController = {
  async list(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const data = await dashboardChecklistService.list(userId);
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { content } = req.body;
      const item = await dashboardChecklistService.create(userId, content);
      res.status(201).json(item);
    } catch (error: any) {
      if (error.message?.includes('최대 7개')) {
        res.status(400).json({ message: error.message });
        return;
      }
      next(error);
    }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const item = await dashboardChecklistService.update(id, userId, req.body);
      res.json(item);
    } catch (error: any) {
      if (error.message === '체크리스트 항목을 찾을 수 없습니다') {
        res.status(404).json({ message: error.message });
        return;
      }
      next(error);
    }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      await dashboardChecklistService.delete(id, userId);
      res.json({ message: '체크리스트 항목이 삭제되었습니다' });
    } catch (error: any) {
      if (error.message === '체크리스트 항목을 찾을 수 없습니다') {
        res.status(404).json({ message: error.message });
        return;
      }
      next(error);
    }
  },
};
