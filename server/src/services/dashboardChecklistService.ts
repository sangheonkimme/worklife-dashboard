import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';

const MAX_CHECKLIST_ITEMS = 7;

const normalizeActiveOrders = async (userId: string, tx: Prisma.TransactionClient | typeof prisma = prisma) => {
  const activeItems = await tx.dashboardChecklistItem.findMany({
    where: { userId, isCompleted: false },
    orderBy: [
      { order: 'asc' },
      { updatedAt: 'asc' },
    ],
  });

  await Promise.all(
    activeItems.map((item, index) => {
      if (item.order !== index) {
        return tx.dashboardChecklistItem.update({
          where: { id: item.id },
          data: { order: index },
        });
      }
      return Promise.resolve();
    })
  );
};

const getNextOrder = async (userId: string) => {
  const { _max } = await prisma.dashboardChecklistItem.aggregate({
    where: { userId, isCompleted: false },
    _max: { order: true },
  });

  return (_max.order ?? -1) + 1;
};

export const dashboardChecklistService = {
  async list(userId: string) {
    const [activeItems, completedItems] = await Promise.all([
      prisma.dashboardChecklistItem.findMany({
        where: { userId, isCompleted: false },
        orderBy: [
          { order: 'asc' },
          { updatedAt: 'asc' },
        ],
      }),
      prisma.dashboardChecklistItem.findMany({
        where: { userId, isCompleted: true },
        orderBy: [
          { updatedAt: 'desc' },
        ],
      }),
    ]);

    return {
      activeItems,
      completedItems,
      maxItems: MAX_CHECKLIST_ITEMS,
    };
  },

  async create(userId: string, content: string) {
    const count = await prisma.dashboardChecklistItem.count({ where: { userId } });
    if (count >= MAX_CHECKLIST_ITEMS) {
      throw new Error('체크리스트 항목은 최대 7개까지 추가할 수 있습니다');
    }

    const order = await getNextOrder(userId);

    const item = await prisma.dashboardChecklistItem.create({
      data: {
        content,
        order,
        userId,
      },
    });

    await normalizeActiveOrders(userId);

    return item;
  },

  async update(id: string, userId: string, data: { content?: string; isCompleted?: boolean; order?: number }) {
    const existing = await prisma.dashboardChecklistItem.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new Error('체크리스트 항목을 찾을 수 없습니다');
    }

    const updatePayload: typeof data = { ...data };

    if (data.isCompleted !== undefined && data.isCompleted !== existing.isCompleted) {
      if (data.isCompleted === false) {
        updatePayload.order = await getNextOrder(userId);
      }
    }

    if (data.order === undefined && existing.isCompleted === false && data.isCompleted !== true) {
      // keep order stable for active items
      updatePayload.order = existing.order;
    }

    const item = await prisma.dashboardChecklistItem.update({
      where: { id },
      data: updatePayload,
    });

    await normalizeActiveOrders(userId);

    return item;
  },

  async delete(id: string, userId: string) {
    const existing = await prisma.dashboardChecklistItem.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new Error('체크리스트 항목을 찾을 수 없습니다');
    }

    await prisma.dashboardChecklistItem.delete({ where: { id } });
    await normalizeActiveOrders(userId);
  },
};
