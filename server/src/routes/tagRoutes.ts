import { Router } from 'express';
import { tagController } from '../controllers/tagController';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  createTagSchema,
  updateTagSchema,
  deleteTagSchema,
  suggestTagsSchema,
  getTagsSchema,
} from '../validators/tagValidator';

const router = Router();

// 모든 라우트에 인증 적용
router.use(authenticate);

// GET /api/tags/suggest - 태그 자동완성 (반드시 /:id 보다 먼저 와야 함)
router.get('/suggest', validate(suggestTagsSchema), tagController.suggestTags);

// GET /api/tags - 태그 목록 조회
router.get('/', validate(getTagsSchema), tagController.getTags);

// GET /api/tags/:id - 특정 태그 조회
router.get('/:id', tagController.getTagById);

// POST /api/tags - 태그 생성
router.post('/', validate(createTagSchema), tagController.createTag);

// PUT /api/tags/:id - 태그 수정
router.put('/:id', validate(updateTagSchema), tagController.updateTag);

// DELETE /api/tags/:id - 태그 삭제
router.delete('/:id', validate(deleteTagSchema), tagController.deleteTag);

export default router;
