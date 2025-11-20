import api from '@/lib/axios';
import type { Note } from '@/types/note';
import type { Transaction } from '@/types/transaction';

export const noteTransactionApi = {
  // 메모에 거래 연결
  linkTransaction: (noteId: string, transactionId: string) =>
    api.post(`/api/notes/${noteId}/link-transaction`, { transactionId }).then((res) => res.data),

  // 메모에서 거래 연결 해제
  unlinkTransaction: (noteId: string, transactionId: string) =>
    api.delete(`/api/notes/${noteId}/unlink/${transactionId}`).then((res) => res.data),

  // 메모에 연결된 거래 목록 조회
  getTransactionsForNote: (noteId: string) =>
    api.get<Transaction[]>(`/api/notes/${noteId}/transactions`).then((res) => res.data),

  // 거래에 연결된 메모 목록 조회
  getNotesForTransaction: (transactionId: string) =>
    api.get<Note[]>(`/api/transactions/${transactionId}/notes`).then((res) => res.data),
};
