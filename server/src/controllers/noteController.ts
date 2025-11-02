import { Response, NextFunction } from 'express';
import { noteService } from '../services/noteService';
import { searchService } from '../services/searchService';
import { AuthRequest } from '../middlewares/auth';

export const noteController = {
  // 메모 목록 조회
  async getNotes(req: AuthRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = req.user!.userId;

      // 쿼리 파라미터는 이미 validate 미들웨어에서 파싱됨
      const filters = req.query;

      const result = await noteService.getNotes(userId, filters);

      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  // 단일 메모 조회
  async getNoteById(req: AuthRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const note = await noteService.getNoteById(id, userId);

      if (!note) {
        return res.status(404).json({ message: '메모를 찾을 수 없습니다' });
      }

      res.json(note);
    } catch (error) {
      next(error);
    }
  },

  // 메모 생성
  async createNote(req: AuthRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = req.user!.userId;
      const data = req.body;

      const note = await noteService.createNote(userId, data);

      res.status(201).json(note);
    } catch (error) {
      next(error);
    }
  },

  // 메모 수정
  async updateNote(req: AuthRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const data = req.body;

      const note = await noteService.updateNote(id, userId, data);

      res.json(note);
    } catch (error) {
      next(error);
    }
  },

  // 메모 삭제 (소프트 삭제)
  async deleteNote(req: AuthRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const result = await noteService.deleteNote(id, userId);

      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  // 휴지통 목록 조회
  async getTrashNotes(req: AuthRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = req.user!.userId;
      const { page, limit } = req.query;

      const pageNum = page ? Number(page) : 1;
      const limitNum = limit ? Number(limit) : 20;

      const result = await noteService.getTrashNotes(userId, pageNum, limitNum);

      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  // 메모 복구
  async restoreNote(req: AuthRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const result = await noteService.restoreNote(id, userId);

      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  // 메모 영구 삭제
  async permanentDeleteNote(req: AuthRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const result = await noteService.permanentDeleteNote(id, userId);

      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  // 메모 고정/즐겨찾기/보관함 토글
  async toggleNoteFlag(req: AuthRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const { flag, value } = req.body;

      const result = await noteService.toggleNoteFlag(id, userId, flag, value);

      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  // 메모 검색
  async searchNotes(req: AuthRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = req.user!.userId;
      const options = req.query;

      const result = await searchService.searchNotes(userId, options as any);

      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  // 검색 제안
  async getSearchSuggestions(req: AuthRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = req.user!.userId;
      const { q, limit } = req.query;

      const result = await searchService.getSearchSuggestions(
        userId,
        q as string,
        limit ? Number(limit) : 5
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  },
};
