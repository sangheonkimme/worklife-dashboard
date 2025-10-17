import { Response, NextFunction } from 'express';
import { categoryService } from '../services/categoryService';
import { AuthRequest } from '../middlewares/auth';

export const categoryController = {
  // 카테고리 목록 조회
  async getCategories(req: AuthRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = req.user!.userId;
      const filters = req.query as any;

      const categories = await categoryService.getCategories(userId, filters);

      res.json(categories);
    } catch (error) {
      next(error);
    }
  },

  // 단일 카테고리 조회
  async getCategoryById(req: AuthRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const category = await categoryService.getCategoryById(id, userId);

      if (!category) {
        return res.status(404).json({ message: '카테고리를 찾을 수 없습니다' });
      }

      res.json(category);
    } catch (error) {
      next(error);
    }
  },

  // 카테고리 생성
  async createCategory(req: AuthRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = req.user!.userId;
      const data = req.body;

      const category = await categoryService.createCategory(userId, data);

      res.status(201).json(category);
    } catch (error) {
      next(error);
    }
  },

  // 카테고리 수정
  async updateCategory(req: AuthRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const data = req.body;

      const category = await categoryService.updateCategory(id, userId, data);

      res.json(category);
    } catch (error) {
      next(error);
    }
  },

  // 카테고리 삭제
  async deleteCategory(req: AuthRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const { reassignTo } = req.query as { reassignTo?: string };

      const result = await categoryService.deleteCategory(id, userId, reassignTo);

      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  // 카테고리 사용 현황
  async getCategoryUsage(req: AuthRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const usage = await categoryService.getCategoryUsage(id, userId);

      res.json(usage);
    } catch (error) {
      next(error);
    }
  },
};
