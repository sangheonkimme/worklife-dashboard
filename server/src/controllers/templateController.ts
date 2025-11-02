import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { templateService } from '../services/templateService';

export const templateController = {
  // 템플릿 목록 조회
  async getTemplates(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;

      const templates = await templateService.getTemplates(userId);
      res.json(templates);
    } catch (error) {
      console.error('템플릿 목록 조회 실패:', error);
      res.status(500).json({ message: '템플릿 목록 조회에 실패했습니다' });
    }
  },

  // 단일 템플릿 조회
  async getTemplateById(req: AuthRequest, res: Response): Promise<any> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const template = await templateService.getTemplateById(id, userId);

      if (!template) {
        return res.status(404).json({ message: '템플릿을 찾을 수 없습니다' });
      }

      return res.json(template);
    } catch (error) {
      console.error('템플릿 조회 실패:', error);
      return res.status(500).json({ message: '템플릿 조회에 실패했습니다' });
    }
  },

  // 템플릿 생성
  async createTemplate(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const data = req.body;

      const template = await templateService.createTemplate(userId, data);
      res.status(201).json(template);
    } catch (error) {
      console.error('템플릿 생성 실패:', error);
      res.status(500).json({ message: '템플릿 생성에 실패했습니다' });
    }
  },

  // 템플릿 수정
  async updateTemplate(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const data = req.body;

      const template = await templateService.updateTemplate(id, userId, data);
      res.json(template);
    } catch (error) {
      if (error instanceof Error && error.message.includes('찾을 수 없거나')) {
        res.status(404).json({ message: error.message });
      } else {
        console.error('템플릿 수정 실패:', error);
        res.status(500).json({ message: '템플릿 수정에 실패했습니다' });
      }
    }
  },

  // 템플릿 삭제
  async deleteTemplate(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const result = await templateService.deleteTemplate(id, userId);
      res.json(result);
    } catch (error) {
      if (error instanceof Error && error.message.includes('찾을 수 없거나')) {
        res.status(404).json({ message: error.message });
      } else {
        console.error('템플릿 삭제 실패:', error);
        res.status(500).json({ message: '템플릿 삭제에 실패했습니다' });
      }
    }
  },
};
