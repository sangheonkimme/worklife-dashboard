import { Router } from 'express';
import { noteController } from '../controllers/noteController';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  createNoteSchema,
  updateNoteSchema,
  deleteNoteSchema,
  getNoteByIdSchema,
  getNotesSchema,
  getTrashNotesSchema,
  restoreNoteSchema,
  permanentDeleteNoteSchema,
  toggleNoteFlagSchema,
} from '../validators/noteValidator';

const router = Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(authenticate);

// 휴지통 관련 라우트 (특정 라우트는 먼저 정의)
router.get('/trash', validate(getTrashNotesSchema), noteController.getTrashNotes);

router.post('/:id/restore', validate(restoreNoteSchema), noteController.restoreNote);

router.delete(
  '/:id/permanent',
  validate(permanentDeleteNoteSchema),
  noteController.permanentDeleteNote
);

// 메모 플래그 토글 (고정/즐겨찾기/보관함)
router.post('/:id/toggle', validate(toggleNoteFlagSchema), noteController.toggleNoteFlag);

// 메모 목록 조회
router.get('/', validate(getNotesSchema), noteController.getNotes);

// 단일 메모 조회
router.get('/:id', validate(getNoteByIdSchema), noteController.getNoteById);

// 메모 생성
router.post('/', validate(createNoteSchema), noteController.createNote);

// 메모 수정
router.put('/:id', validate(updateNoteSchema), noteController.updateNote);

// 메모 삭제 (소프트 삭제)
router.delete('/:id', validate(deleteNoteSchema), noteController.deleteNote);

export default router;
