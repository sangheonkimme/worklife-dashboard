import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { noteTransactionService } from '../services/noteTransactionService';

export const noteTransactionController = {
  // 메모에 거래 연결
  async linkTransaction(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { noteId } = req.params;
      const { transactionId } = req.body;

      const result = await noteTransactionService.linkTransaction(noteId, transactionId, userId);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('찾을 수 없습니다')) {
          res.status(404).json({ message: error.message });
        } else if (error.message.includes('이미 연결된')) {
          res.status(409).json({ message: error.message });
        } else {
          console.error('거래 연결 실패:', error);
          res.status(500).json({ message: '거래 연결에 실패했습니다' });
        }
      } else {
        console.error('거래 연결 실패:', error);
        res.status(500).json({ message: '거래 연결에 실패했습니다' });
      }
    }
  },

  // 메모에서 거래 연결 해제
  async unlinkTransaction(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { noteId, transactionId } = req.params;

      const result = await noteTransactionService.unlinkTransaction(
        noteId,
        transactionId,
        userId
      );
      res.json(result);
    } catch (error) {
      if (error instanceof Error && error.message.includes('찾을 수 없습니다')) {
        res.status(404).json({ message: error.message });
      } else {
        console.error('거래 연결 해제 실패:', error);
        res.status(500).json({ message: '거래 연결 해제에 실패했습니다' });
      }
    }
  },

  // 메모에 연결된 거래 목록 조회
  async getLinkedTransactions(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { noteId } = req.params;

      const transactions = await noteTransactionService.getLinkedTransactions(noteId, userId);
      res.json(transactions);
    } catch (error) {
      if (error instanceof Error && error.message === '메모를 찾을 수 없습니다') {
        res.status(404).json({ message: error.message });
      } else {
        console.error('연결된 거래 조회 실패:', error);
        res.status(500).json({ message: '연결된 거래 조회에 실패했습니다' });
      }
    }
  },

  // 거래에 연결된 메모 목록 조회
  async getNotesForTransaction(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { transactionId } = req.params;

      const notes = await noteTransactionService.getNotesForTransaction(transactionId, userId);
      res.json(notes);
    } catch (error) {
      if (error instanceof Error && error.message === '거래를 찾을 수 없습니다') {
        res.status(404).json({ message: error.message });
      } else {
        console.error('연결된 메모 조회 실패:', error);
        res.status(500).json({ message: '연결된 메모 조회에 실패했습니다' });
      }
    }
  },
};
