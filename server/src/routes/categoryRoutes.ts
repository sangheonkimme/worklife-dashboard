import { Router } from 'express';
import { categoryController } from '../controllers/categoryController';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  createCategorySchema,
  updateCategorySchema,
  deleteCategorySchema,
  getCategoriesSchema,
  getCategoryByIdSchema,
} from '../validators/categoryValidator';

const router = Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(authenticate);

// 카테고리 목록 조회
router.get('/', validate(getCategoriesSchema), categoryController.getCategories);

// 단일 카테고리 조회
router.get('/:id', validate(getCategoryByIdSchema), categoryController.getCategoryById);

// 카테고리 사용 현황 조회
router.get('/:id/usage', validate(getCategoryByIdSchema), categoryController.getCategoryUsage);

// 카테고리 생성
router.post('/', validate(createCategorySchema), categoryController.createCategory);

// 카테고리 수정
router.put('/:id', validate(updateCategorySchema), categoryController.updateCategory);

// 카테고리 삭제
router.delete('/:id', validate(deleteCategorySchema), categoryController.deleteCategory);

export default router;
