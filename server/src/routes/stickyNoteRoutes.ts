import { Router } from 'express';
import { stickyNoteController } from '../controllers/stickyNoteController';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  createStickyNoteSchema,
  updateStickyNoteSchema,
  deleteStickyNoteSchema,
} from '../validators/stickyNoteValidator';

const router = Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(authenticate);

// GET /api/sticky-notes - 모든 스티커 메모 조회
router.get('/', stickyNoteController.getAll);

// POST /api/sticky-notes - 스티커 메모 생성
router.post('/', validate(createStickyNoteSchema), stickyNoteController.create);

// PUT /api/sticky-notes/:id - 스티커 메모 수정
router.put('/:id', validate(updateStickyNoteSchema), stickyNoteController.update);

// DELETE /api/sticky-notes/:id - 스티커 메모 삭제
router.delete('/:id', validate(deleteStickyNoteSchema), stickyNoteController.delete);

export default router;
