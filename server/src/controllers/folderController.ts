import { Response } from 'express';
import { folderService } from '../services/folderService';
import { AuthRequest } from '../middlewares/auth';

export const folderController = {
  /**
   * GET /api/folders - 폴더 목록 조회
   */
  async getFolders(req: AuthRequest, res: Response): Promise<any> {
    try {
      const userId = req.user!.userId;

      const folders = await folderService.getFolders(userId);

      res.json(folders);
    } catch (error) {
      console.error('폴더 목록 조회 실패:', error);
      res.status(500).json({ message: '폴더 목록 조회에 실패했습니다' });
    }
  },

  /**
   * GET /api/folders/:id - 특정 폴더 조회
   */
  async getFolderById(req: AuthRequest, res: Response): Promise<any> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const folder = await folderService.getFolderById(id, userId);

      res.json(folder);
    } catch (error: any) {
      console.error('폴더 조회 실패:', error);

      if (error.message === '폴더를 찾을 수 없습니다') {
        return res.status(404).json({ message: error.message });
      }

      res.status(500).json({ message: '폴더 조회에 실패했습니다' });
    }
  },

  /**
   * POST /api/folders - 폴더 생성
   */
  async createFolder(req: AuthRequest, res: Response): Promise<any> {
    try {
      const userId = req.user!.userId;
      const folderData = req.body;

      const folder = await folderService.createFolder(folderData, userId);

      res.status(201).json(folder);
    } catch (error: any) {
      console.error('폴더 생성 실패:', error);

      if (error.message.includes('부모 폴더') || error.message.includes('최대 3단계')) {
        return res.status(400).json({ message: error.message });
      }

      res.status(500).json({ message: '폴더 생성에 실패했습니다' });
    }
  },

  /**
   * PUT /api/folders/:id - 폴더 수정
   */
  async updateFolder(req: AuthRequest, res: Response): Promise<any> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const folderData = req.body;

      const folder = await folderService.updateFolder(id, folderData, userId);

      res.json(folder);
    } catch (error: any) {
      console.error('폴더 수정 실패:', error);

      if (error.message === '폴더를 찾을 수 없습니다') {
        return res.status(404).json({ message: error.message });
      }

      if (
        error.message.includes('자기 자신') ||
        error.message.includes('순환 참조') ||
        error.message.includes('최대 3단계')
      ) {
        return res.status(400).json({ message: error.message });
      }

      res.status(500).json({ message: '폴더 수정에 실패했습니다' });
    }
  },

  /**
   * DELETE /api/folders/:id - 폴더 삭제
   */
  async deleteFolder(req: AuthRequest, res: Response): Promise<any> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      await folderService.deleteFolder(id, userId);

      res.json({ message: '폴더가 삭제되었습니다' });
    } catch (error: any) {
      console.error('폴더 삭제 실패:', error);

      if (error.message === '폴더를 찾을 수 없습니다') {
        return res.status(404).json({ message: error.message });
      }

      if (error.message.includes('하위 폴더')) {
        return res.status(400).json({ message: error.message });
      }

      res.status(500).json({ message: '폴더 삭제에 실패했습니다' });
    }
  },
};
