import { Router } from 'express';
import { noteTransactionController } from '../controllers/noteTransactionController';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  linkTransactionSchema,
  unlinkTransactionSchema,
  getLinkedTransactionsSchema,
  getNotesForTransactionSchema,
} from '../validators/noteTransactionValidator';

const router = Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(authenticate);

// 메모에 거래 연결
router.post(
  '/notes/:noteId/link-transaction',
  validate(linkTransactionSchema),
  noteTransactionController.linkTransaction
);

// 메모에서 거래 연결 해제
router.delete(
  '/notes/:noteId/unlink/:transactionId',
  validate(unlinkTransactionSchema),
  noteTransactionController.unlinkTransaction
);

// 메모에 연결된 거래 목록 조회
router.get(
  '/notes/:noteId/transactions',
  validate(getLinkedTransactionsSchema),
  noteTransactionController.getLinkedTransactions
);

// 거래에 연결된 메모 목록 조회
router.get(
  '/transactions/:transactionId/notes',
  validate(getNotesForTransactionSchema),
  noteTransactionController.getNotesForTransaction
);

export default router;
