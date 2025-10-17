import { Response, NextFunction } from 'express';
import { transactionService } from '../services/transactionService';
import { AuthRequest } from '../middlewares/auth';

export const transactionController = {
  // 거래 목록 조회
  async getTransactions(req: AuthRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = req.user!.userId;
      const filters = req.query;

      const result = await transactionService.getTransactions(userId, filters);

      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  // 단일 거래 조회
  async getTransactionById(req: AuthRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const transaction = await transactionService.getTransactionById(id, userId);

      if (!transaction) {
        return res.status(404).json({ message: '거래를 찾을 수 없습니다' });
      }

      res.json(transaction);
    } catch (error) {
      next(error);
    }
  },

  // 거래 생성
  async createTransaction(req: AuthRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = req.user!.userId;
      const data = req.body;

      const transaction = await transactionService.createTransaction(userId, data);

      res.status(201).json(transaction);
    } catch (error) {
      next(error);
    }
  },

  // 거래 수정
  async updateTransaction(req: AuthRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const data = req.body;

      const transaction = await transactionService.updateTransaction(id, userId, data);

      res.json(transaction);
    } catch (error) {
      next(error);
    }
  },

  // 거래 삭제
  async deleteTransaction(req: AuthRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const result = await transactionService.deleteTransaction(id, userId);

      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  // 대량 거래 입력
  async bulkCreateTransactions(req: AuthRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = req.user!.userId;
      const { transactions } = req.body;

      const result = await transactionService.bulkCreateTransactions(userId, transactions);

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  // 통계 조회
  async getStatistics(req: AuthRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = req.user!.userId;
      const filters = req.query as any;

      const statistics = await transactionService.getStatistics(userId, filters);

      res.json(statistics);
    } catch (error) {
      next(error);
    }
  },

  // CSV 내보내기
  async exportTransactions(req: AuthRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = req.user!.userId;
      const filters = req.query;

      const transactions = await transactionService.getTransactionsForExport(userId, filters);

      // CSV 형식으로 변환
      const csvHeader = '날짜,유형,카테고리,금액,설명\n';
      const csvRows = transactions.map((t) => {
        const date = new Date(t.date).toISOString().split('T')[0];
        const type = t.type === 'INCOME' ? '수입' : '지출';
        const category = t.category.name;
        const amount = t.amount;
        const description = (t.description || '').replace(/,/g, ' ');
        return `${date},${type},${category},${amount},${description}`;
      });

      const csv = csvHeader + csvRows.join('\n');

      // UTF-8 BOM 추가 (엑셀에서 한글 깨짐 방지)
      const bom = '\uFEFF';
      const csvWithBom = bom + csv;

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="transactions-${Date.now()}.csv"`);
      res.send(csvWithBom);
    } catch (error) {
      next(error);
    }
  },
};
