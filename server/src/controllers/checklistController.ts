import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { checklistService } from '../services/checklistService';

export const checklistController = {
  // 체크리스트 항목 생성
  async createItem(req: AuthRequest, res: Response) {
    try {
      const { noteId } = req.params;
      const userId = req.user!.userId;
      const data = req.body;

      const item = await checklistService.createItem(noteId, userId, data);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof Error && error.message === '메모를 찾을 수 없습니다') {
        res.status(404).json({ message: error.message });
      } else {
        console.error('체크리스트 항목 생성 실패:', error);
        res.status(500).json({ message: '체크리스트 항목 생성에 실패했습니다' });
      }
    }
  },

  // 체크리스트 항목 목록 조회
  async getItems(req: AuthRequest, res: Response) {
    try {
      const { noteId } = req.params;
      const userId = req.user!.userId;

      const items = await checklistService.getItemsByNoteId(noteId, userId);
      res.json(items);
    } catch (error) {
      if (error instanceof Error && error.message === '메모를 찾을 수 없습니다') {
        res.status(404).json({ message: error.message });
      } else {
        console.error('체크리스트 항목 조회 실패:', error);
        res.status(500).json({ message: '체크리스트 항목 조회에 실패했습니다' });
      }
    }
  },

  // 체크리스트 항목 수정
  async updateItem(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const data = req.body;

      const item = await checklistService.updateItem(id, userId, data);
      res.json(item);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === '체크리스트 항목을 찾을 수 없습니다'
      ) {
        res.status(404).json({ message: error.message });
      } else {
        console.error('체크리스트 항목 수정 실패:', error);
        res.status(500).json({ message: '체크리스트 항목 수정에 실패했습니다' });
      }
    }
  },

  // 체크리스트 항목 완료 토글
  async toggleItem(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const { isCompleted } = req.body;

      const item = await checklistService.toggleItem(id, userId, isCompleted);
      res.json(item);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === '체크리스트 항목을 찾을 수 없습니다'
      ) {
        res.status(404).json({ message: error.message });
      } else {
        console.error('체크리스트 항목 토글 실패:', error);
        res.status(500).json({ message: '체크리스트 항목 토글에 실패했습니다' });
      }
    }
  },

  // 체크리스트 항목 삭제
  async deleteItem(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      await checklistService.deleteItem(id, userId);
      res.status(204).send();
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === '체크리스트 항목을 찾을 수 없습니다'
      ) {
        res.status(404).json({ message: error.message });
      } else {
        console.error('체크리스트 항목 삭제 실패:', error);
        res.status(500).json({ message: '체크리스트 항목 삭제에 실패했습니다' });
      }
    }
  },

  // 체크리스트 항목 순서 변경
  async reorderItems(req: AuthRequest, res: Response) {
    try {
      const { noteId } = req.params;
      const userId = req.user!.userId;
      const { items } = req.body;

      const reorderedItems = await checklistService.reorderItems(noteId, userId, items);
      res.json(reorderedItems);
    } catch (error) {
      if (error instanceof Error && error.message === '메모를 찾을 수 없습니다') {
        res.status(404).json({ message: error.message });
      } else {
        console.error('체크리스트 순서 변경 실패:', error);
        res.status(500).json({ message: '체크리스트 순서 변경에 실패했습니다' });
      }
    }
  },

  // 체크리스트 진행률 조회
  async getProgress(req: AuthRequest, res: Response) {
    try {
      const { noteId } = req.params;
      const userId = req.user!.userId;

      const progress = await checklistService.getProgress(noteId, userId);
      res.json(progress);
    } catch (error) {
      if (error instanceof Error && error.message === '메모를 찾을 수 없습니다') {
        res.status(404).json({ message: error.message });
      } else {
        console.error('체크리스트 진행률 조회 실패:', error);
        res.status(500).json({ message: '체크리스트 진행률 조회에 실패했습니다' });
      }
    }
  },
};
