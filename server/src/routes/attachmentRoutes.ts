import { Router } from 'express';
import { attachmentController } from '../controllers/attachmentController';
import { authenticate } from '../middlewares/auth';
import { upload } from '../middlewares/upload';

const router = Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(authenticate);

// 단일 파일 업로드
router.post(
  '/notes/:noteId/attachments',
  upload.single('file'),
  attachmentController.uploadFile
);

// 여러 파일 업로드
router.post(
  '/notes/:noteId/attachments/multiple',
  upload.array('files', 10), // 최대 10개 파일
  attachmentController.uploadMultipleFiles
);

// 첨부파일 목록 조회
router.get('/notes/:noteId/attachments', attachmentController.getAttachments);

// 첨부파일 삭제
router.delete('/attachments/:id', attachmentController.deleteAttachment);

export default router;
