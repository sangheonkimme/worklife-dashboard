import { Response } from 'express';
import { tagService } from '../services/tagService';
import { AuthRequest } from '../middlewares/auth';

export const tagController = {
  /**
   * GET /api/tags - 태그 목록 조회
   */
  async getTags(req: AuthRequest, res: Response): Promise<any> {
    try {
      const userId = req.user!.userId;
      const includeCount = req.query.includeCount === 'true';

      const tags = await tagService.getTags(userId, includeCount);

      res.json(tags);
    } catch (error) {
      console.error('태그 목록 조회 실패:', error);
      res.status(500).json({ message: '태그 목록 조회에 실패했습니다' });
    }
  },

  /**
   * GET /api/tags/:id - 특정 태그 조회
   */
  async getTagById(req: AuthRequest, res: Response): Promise<any> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const tag = await tagService.getTagById(id, userId);

      res.json(tag);
    } catch (error: any) {
      console.error('태그 조회 실패:', error);

      if (error.message === '태그를 찾을 수 없습니다') {
        return res.status(404).json({ message: error.message });
      }

      res.status(500).json({ message: '태그 조회에 실패했습니다' });
    }
  },

  /**
   * POST /api/tags - 태그 생성
   */
  async createTag(req: AuthRequest, res: Response): Promise<any> {
    try {
      const userId = req.user!.userId;
      const tagData = req.body;

      const tag = await tagService.createTag(tagData, userId);

      res.status(201).json(tag);
    } catch (error: any) {
      console.error('태그 생성 실패:', error);

      if (error.message === '이미 존재하는 태그입니다') {
        return res.status(400).json({ message: error.message });
      }

      res.status(500).json({ message: '태그 생성에 실패했습니다' });
    }
  },

  /**
   * PUT /api/tags/:id - 태그 수정
   */
  async updateTag(req: AuthRequest, res: Response): Promise<any> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const tagData = req.body;

      const tag = await tagService.updateTag(id, tagData, userId);

      res.json(tag);
    } catch (error: any) {
      console.error('태그 수정 실패:', error);

      if (error.message === '태그를 찾을 수 없습니다') {
        return res.status(404).json({ message: error.message });
      }

      if (error.message === '이미 존재하는 태그 이름입니다') {
        return res.status(400).json({ message: error.message });
      }

      res.status(500).json({ message: '태그 수정에 실패했습니다' });
    }
  },

  /**
   * DELETE /api/tags/:id - 태그 삭제
   */
  async deleteTag(req: AuthRequest, res: Response): Promise<any> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      await tagService.deleteTag(id, userId);

      res.json({ message: '태그가 삭제되었습니다' });
    } catch (error: any) {
      console.error('태그 삭제 실패:', error);

      if (error.message === '태그를 찾을 수 없습니다') {
        return res.status(404).json({ message: error.message });
      }

      res.status(500).json({ message: '태그 삭제에 실패했습니다' });
    }
  },

  /**
   * GET /api/tags/suggest - 태그 자동완성
   */
  async suggestTags(req: AuthRequest, res: Response): Promise<any> {
    try {
      const userId = req.user!.userId;
      const query = req.query.q as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      const tags = await tagService.suggestTags(userId, query, limit);

      res.json(tags);
    } catch (error) {
      console.error('태그 자동완성 실패:', error);
      res.status(500).json({ message: '태그 자동완성에 실패했습니다' });
    }
  },
};
