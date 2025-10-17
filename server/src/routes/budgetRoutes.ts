import { Router } from 'express';
import { budgetController } from '../controllers/budgetController';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  createBudgetSchema,
  updateBudgetSchema,
  deleteBudgetSchema,
  getBudgetsSchema,
  getBudgetByIdSchema,
  getBudgetStatusSchema,
} from '../validators/budgetValidator';

const router = Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(authenticate);

// 예산 사용 현황 조회 (특정 라우트는 먼저 정의)
router.get('/status', validate(getBudgetStatusSchema), budgetController.getBudgetStatus);

// 예산 목록 조회
router.get('/', validate(getBudgetsSchema), budgetController.getBudgets);

// 단일 예산 조회
router.get('/:id', validate(getBudgetByIdSchema), budgetController.getBudgetById);

// 예산 생성
router.post('/', validate(createBudgetSchema), budgetController.createBudget);

// 예산 수정
router.put('/:id', validate(updateBudgetSchema), budgetController.updateBudget);

// 예산 삭제
router.delete('/:id', validate(deleteBudgetSchema), budgetController.deleteBudget);

export default router;
