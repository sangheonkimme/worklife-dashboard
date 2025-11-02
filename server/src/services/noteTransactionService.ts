import { prisma } from '../lib/prisma';

export const noteTransactionService = {
  // 메모에 거래 연결
  async linkTransaction(noteId: string, transactionId: string, userId: string) {
    // 메모 권한 확인
    const note = await prisma.note.findFirst({
      where: { id: noteId, userId, deletedAt: null },
    });

    if (!note) {
      throw new Error('메모를 찾을 수 없습니다');
    }

    // 거래 권한 확인
    const transaction = await prisma.transaction.findFirst({
      where: { id: transactionId, userId },
    });

    if (!transaction) {
      throw new Error('거래를 찾을 수 없습니다');
    }

    // 이미 연결되어 있는지 확인
    const existing = await prisma.noteTransaction.findFirst({
      where: {
        noteId,
        transactionId,
      },
    });

    if (existing) {
      throw new Error('이미 연결된 거래입니다');
    }

    // 연결 생성
    const noteTransaction = await prisma.noteTransaction.create({
      data: {
        noteId,
        transactionId,
      },
      include: {
        transaction: {
          include: {
            category: true,
          },
        },
      },
    });

    return noteTransaction;
  },

  // 메모에서 거래 연결 해제
  async unlinkTransaction(noteId: string, transactionId: string, userId: string) {
    // 메모 권한 확인
    const note = await prisma.note.findFirst({
      where: { id: noteId, userId, deletedAt: null },
    });

    if (!note) {
      throw new Error('메모를 찾을 수 없습니다');
    }

    // 연결 찾기
    const noteTransaction = await prisma.noteTransaction.findFirst({
      where: {
        noteId,
        transactionId,
      },
    });

    if (!noteTransaction) {
      throw new Error('연결된 거래를 찾을 수 없습니다');
    }

    // 연결 삭제
    await prisma.noteTransaction.delete({
      where: { id: noteTransaction.id },
    });

    return { message: '거래 연결이 해제되었습니다' };
  },

  // 메모에 연결된 거래 목록 조회
  async getLinkedTransactions(noteId: string, userId: string) {
    // 메모 권한 확인
    const note = await prisma.note.findFirst({
      where: { id: noteId, userId, deletedAt: null },
    });

    if (!note) {
      throw new Error('메모를 찾을 수 없습니다');
    }

    const noteTransactions = await prisma.noteTransaction.findMany({
      where: { noteId },
      include: {
        transaction: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        transaction: {
          date: 'desc',
        },
      },
    });

    return noteTransactions.map((nt) => nt.transaction);
  },

  // 거래에 연결된 메모 목록 조회
  async getNotesForTransaction(transactionId: string, userId: string) {
    // 거래 권한 확인
    const transaction = await prisma.transaction.findFirst({
      where: { id: transactionId, userId },
    });

    if (!transaction) {
      throw new Error('거래를 찾을 수 없습니다');
    }

    const noteTransactions = await prisma.noteTransaction.findMany({
      where: {
        transactionId,
        note: {
          deletedAt: null,
        },
      },
      include: {
        note: {
          select: {
            id: true,
            title: true,
            content: true,
            type: true,
            isPinned: true,
            isFavorite: true,
            isArchived: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    return noteTransactions.map((nt) => nt.note);
  },
};
