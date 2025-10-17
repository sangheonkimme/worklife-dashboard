import { Response, NextFunction } from 'express';
import { budgetService } from '../services/budgetService';
import { AuthRequest } from '../middlewares/auth';

export const budgetController = {
  // 예산 목록 조회
  async getBudgets(req: AuthRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = req.user!.userId;
      const filters = req.query as any;

      const budgets = await budgetService.getBudgets(userId, filters);

      res.json(budgets);
    } catch (error) {
      next(error);
    }
  },

  // 단일 예산 조회
  async getBudgetById(req: AuthRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const budget = await budgetService.getBudgetById(id, userId);

      if (!budget) {
        return res.status(404).json({ message: '예산을 찾을 수 없습니다' });
      }

      res.json(budget);
    } catch (error) {
      next(error);
    }
  },

  // 예산 생성
  async createBudget(req: AuthRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = req.user!.userId;
      const data = req.body;

      const budget = await budgetService.createBudget(userId, data);

      res.status(201).json(budget);
    } catch (error) {
      next(error);
    }
  },

  // 예산 수정
  async updateBudget(req: AuthRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const data = req.body;

      const budget = await budgetService.updateBudget(id, userId, data);

      res.json(budget);
    } catch (error) {
      next(error);
    }
  },

  // 예산 삭제
  async deleteBudget(req: AuthRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const result = await budgetService.deleteBudget(id, userId);

      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  // 예산 사용 현황
  async getBudgetStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = req.user!.userId;
      const { month } = req.query as { month?: string };

      const status = await budgetService.getBudgetStatus(userId, month);

      res.json(status);
    } catch (error) {
      next(error);
    }
  },
};
