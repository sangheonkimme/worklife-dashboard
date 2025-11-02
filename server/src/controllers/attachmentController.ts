import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { attachmentService } from '../services/attachmentService';

export const attachmentController = {
  // 단일 파일 업로드
  async uploadFile(req: AuthRequest, res: Response): Promise<any> {
    try {
      const userId = req.user!.userId;
      const { noteId } = req.params;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ message: '파일이 업로드되지 않았습니다' });
      }

      const attachment = await attachmentService.uploadAttachment(noteId, userId, file);
      return res.status(201).json(attachment);
    } catch (error) {
      if (error instanceof Error && error.message === '메모를 찾을 수 없습니다') {
        return res.status(404).json({ message: error.message });
      } else {
        console.error('파일 업로드 실패:', error);
        return res.status(500).json({ message: '파일 업로드에 실패했습니다' });
      }
    }
  },

  // 여러 파일 업로드
  async uploadMultipleFiles(req: AuthRequest, res: Response): Promise<any> {
    try {
      const userId = req.user!.userId;
      const { noteId } = req.params;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({ message: '파일이 업로드되지 않았습니다' });
      }

      const attachments = await attachmentService.uploadMultipleAttachments(
        noteId,
        userId,
        files
      );
      return res.status(201).json(attachments);
    } catch (error) {
      if (error instanceof Error && error.message === '메모를 찾을 수 없습니다') {
        return res.status(404).json({ message: error.message });
      } else {
        console.error('파일 업로드 실패:', error);
        return res.status(500).json({ message: '파일 업로드에 실패했습니다' });
      }
    }
  },

  // 첨부파일 목록 조회
  async getAttachments(req: AuthRequest, res: Response): Promise<any> {
    try {
      const userId = req.user!.userId;
      const { noteId } = req.params;

      const attachments = await attachmentService.getAttachments(noteId, userId);
      return res.json(attachments);
    } catch (error) {
      if (error instanceof Error && error.message === '메모를 찾을 수 없습니다') {
        return res.status(404).json({ message: error.message });
      } else {
        console.error('첨부파일 조회 실패:', error);
        return res.status(500).json({ message: '첨부파일 조회에 실패했습니다' });
      }
    }
  },

  // 첨부파일 삭제
  async deleteAttachment(req: AuthRequest, res: Response): Promise<any> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const result = await attachmentService.deleteAttachment(id, userId);
      return res.json(result);
    } catch (error) {
      if (error instanceof Error && error.message === '첨부파일을 찾을 수 없습니다') {
        return res.status(404).json({ message: error.message });
      } else {
        console.error('첨부파일 삭제 실패:', error);
        return res.status(500).json({ message: '첨부파일 삭제에 실패했습니다' });
      }
    }
  },
};
