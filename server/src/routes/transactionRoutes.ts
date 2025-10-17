import { Router } from "express";
import { transactionController } from "../controllers/transactionController";
import { authenticate } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import {
  createTransactionSchema,
  updateTransactionSchema,
  deleteTransactionSchema,
  getTransactionByIdSchema,
  getTransactionsSchema,
  getStatisticsSchema,
  bulkCreateTransactionsSchema,
} from "../validators/transactionValidator";

const router = Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(authenticate);

// 통계 조회 (특정 라우트는 먼저 정의)
router.get(
  "/statistics",
  validate(getStatisticsSchema),
  transactionController.getStatistics
);

// CSV 내보내기
router.get(
  "/export",
  validate(getTransactionsSchema),
  transactionController.exportTransactions
);

// 대량 거래 입력
router.post(
  "/bulk",
  validate(bulkCreateTransactionsSchema),
  transactionController.bulkCreateTransactions
);

// 거래 목록 조회
router.get(
  "/",
  validate(getTransactionsSchema),
  transactionController.getTransactions
);

// 단일 거래 조회
router.get(
  "/:id",
  validate(getTransactionByIdSchema),
  transactionController.getTransactionById
);

// 거래 생성
router.post(
  "/",
  validate(createTransactionSchema),
  transactionController.createTransaction
);

// 거래 수정
router.put(
  "/:id",
  validate(updateTransactionSchema),
  transactionController.updateTransaction
);

// 거래 삭제
router.delete(
  "/:id",
  validate(deleteTransactionSchema),
  transactionController.deleteTransaction
);

export default router;
