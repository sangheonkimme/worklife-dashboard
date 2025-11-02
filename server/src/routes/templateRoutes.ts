import { Router } from 'express';
import { templateController } from '../controllers/templateController';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  createTemplateSchema,
  updateTemplateSchema,
  getTemplateByIdSchema,
  deleteTemplateSchema,
} from '../validators/templateValidator';

const router = Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(authenticate);

// 템플릿 목록 조회
router.get('/', templateController.getTemplates);

// 단일 템플릿 조회
router.get('/:id', validate(getTemplateByIdSchema), templateController.getTemplateById);

// 템플릿 생성
router.post('/', validate(createTemplateSchema), templateController.createTemplate);

// 템플릿 수정
router.put('/:id', validate(updateTemplateSchema), templateController.updateTemplate);

// 템플릿 삭제
router.delete('/:id', validate(deleteTemplateSchema), templateController.deleteTemplate);

export default router;
