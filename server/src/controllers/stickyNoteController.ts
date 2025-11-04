import { Response, NextFunction } from 'express';
import { stickyNoteService } from '../services/stickyNoteService';
import { AuthRequest } from '../middlewares/auth';

export const stickyNoteController = {
  // 모든 스티커 메모 조회
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = req.user!.userId;
      const notes = await stickyNoteService.findAllByUserId(userId);
      res.json(notes);
    } catch (error) {
      next(error);
    }
  },

  // 스티커 메모 생성
  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = req.user!.userId;
      const data = req.body;

      const note = await stickyNoteService.create(userId, data);
      res.status(201).json(note);
    } catch (error: any) {
      if (error.message === '최대 4개의 스티커 메모만 생성할 수 있습니다') {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  },

  // 스티커 메모 수정
  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const data = req.body;

      const note = await stickyNoteService.update(id, userId, data);
      res.json(note);
    } catch (error: any) {
      if (error.message === '스티커 메모를 찾을 수 없습니다') {
        return res.status(404).json({ message: error.message });
      }
      next(error);
    }
  },

  // 스티커 메모 삭제
  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      await stickyNoteService.delete(id, userId);
      res.json({ message: '스티커 메모가 삭제되었습니다' });
    } catch (error: any) {
      if (error.message === '스티커 메모를 찾을 수 없습니다') {
        return res.status(404).json({ message: error.message });
      }
      next(error);
    }
  },
};
