import { Router } from 'express';
import { checklistController } from '../controllers/checklistController';
import { validate } from '../middlewares/validate';
import {
  createChecklistItemSchema,
  updateChecklistItemSchema,
  toggleChecklistItemSchema,
  reorderChecklistItemsSchema,
} from '../validators/checklistValidator';

const router = Router();

// 노트의 체크리스트 항목 목록 조회
router.get('/notes/:noteId/checklist', checklistController.getItems);

// 노트의 체크리스트 진행률 조회
router.get('/notes/:noteId/checklist/progress', checklistController.getProgress);

// 체크리스트 항목 생성
router.post(
  '/notes/:noteId/checklist',
  validate(createChecklistItemSchema),
  checklistController.createItem
);

// 체크리스트 항목 순서 변경
router.post(
  '/notes/:noteId/checklist/reorder',
  validate(reorderChecklistItemsSchema),
  checklistController.reorderItems
);

// 체크리스트 항목 수정
router.put(
  '/checklist/:id',
  validate(updateChecklistItemSchema),
  checklistController.updateItem
);

// 체크리스트 항목 완료 토글
router.post(
  '/checklist/:id/toggle',
  validate(toggleChecklistItemSchema),
  checklistController.toggleItem
);

// 체크리스트 항목 삭제
router.delete('/checklist/:id', checklistController.deleteItem);

export default router;
