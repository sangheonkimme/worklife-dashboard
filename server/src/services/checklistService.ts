import { prisma } from '../lib/prisma';

export const checklistService = {
  // 체크리스트 항목 생성
  async createItem(noteId: string, userId: string, data: { content: string; order?: number }) {
    // 노트 존재 및 권한 확인
    const note = await prisma.note.findFirst({
      where: { id: noteId, userId, deletedAt: null },
    });

    if (!note) {
      throw new Error('메모를 찾을 수 없습니다');
    }

    // order가 지정되지 않은 경우 마지막 순서로 설정
    let order = data.order;
    if (order === undefined) {
      const lastItem = await prisma.checklistItem.findFirst({
        where: { noteId },
        orderBy: { order: 'desc' },
      });
      order = lastItem ? lastItem.order + 1 : 0;
    }

    return prisma.checklistItem.create({
      data: {
        content: data.content,
        order,
        noteId,
      },
    });
  },

  // 체크리스트 항목 조회
  async getItemsByNoteId(noteId: string, userId: string) {
    // 노트 권한 확인
    const note = await prisma.note.findFirst({
      where: { id: noteId, userId, deletedAt: null },
    });

    if (!note) {
      throw new Error('메모를 찾을 수 없습니다');
    }

    return prisma.checklistItem.findMany({
      where: { noteId },
      orderBy: { order: 'asc' },
    });
  },

  // 체크리스트 항목 수정
  async updateItem(
    itemId: string,
    userId: string,
    data: { content?: string; isCompleted?: boolean; order?: number }
  ) {
    // 항목 존재 및 권한 확인
    const item = await prisma.checklistItem.findFirst({
      where: {
        id: itemId,
        note: { userId, deletedAt: null },
      },
    });

    if (!item) {
      throw new Error('체크리스트 항목을 찾을 수 없습니다');
    }

    return prisma.checklistItem.update({
      where: { id: itemId },
      data,
    });
  },

  // 체크리스트 항목 토글
  async toggleItem(itemId: string, userId: string, isCompleted: boolean) {
    return this.updateItem(itemId, userId, { isCompleted });
  },

  // 체크리스트 항목 삭제
  async deleteItem(itemId: string, userId: string) {
    // 항목 존재 및 권한 확인
    const item = await prisma.checklistItem.findFirst({
      where: {
        id: itemId,
        note: { userId, deletedAt: null },
      },
    });

    if (!item) {
      throw new Error('체크리스트 항목을 찾을 수 없습니다');
    }

    return prisma.checklistItem.delete({
      where: { id: itemId },
    });
  },

  // 체크리스트 항목 순서 변경
  async reorderItems(
    noteId: string,
    userId: string,
    items: Array<{ id: string; order: number }>
  ) {
    // 노트 권한 확인
    const note = await prisma.note.findFirst({
      where: { id: noteId, userId, deletedAt: null },
    });

    if (!note) {
      throw new Error('메모를 찾을 수 없습니다');
    }

    // 트랜잭션으로 순서 일괄 업데이트
    await prisma.$transaction(
      items.map((item) =>
        prisma.checklistItem.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    );

    // 업데이트된 목록 반환
    return this.getItemsByNoteId(noteId, userId);
  },

  // 체크리스트 진행률 조회
  async getProgress(noteId: string, userId: string) {
    // 노트 권한 확인
    const note = await prisma.note.findFirst({
      where: { id: noteId, userId, deletedAt: null },
    });

    if (!note) {
      throw new Error('메모를 찾을 수 없습니다');
    }

    const total = await prisma.checklistItem.count({
      where: { noteId },
    });

    const completed = await prisma.checklistItem.count({
      where: { noteId, isCompleted: true },
    });

    return {
      total,
      completed,
      percentage: total === 0 ? 0 : Math.round((completed / total) * 100),
    };
  },
};
