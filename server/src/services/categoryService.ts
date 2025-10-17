import { prisma } from '../lib/prisma';
import { CategoryType } from '@prisma/client';

// 카테고리 생성 DTO
export interface CreateCategoryDto {
  name: string;
  type: CategoryType;
  color?: string;
  icon?: string;
}

// 카테고리 수정 DTO
export interface UpdateCategoryDto {
  name?: string;
  color?: string;
  icon?: string;
}

// 카테고리 조회 필터
export interface CategoryFilters {
  type?: CategoryType;
  includeDefault?: boolean;
}

export const categoryService = {
  // 카테고리 목록 조회
  async getCategories(userId: string, filters: CategoryFilters = {}) {
    const { type, includeDefault = true } = filters;

    // 사용자의 카테고리와 기본 카테고리 조회
    const categories = await prisma.category.findMany({
      where: {
        AND: [
          {
            OR: [{ userId }, ...(includeDefault ? [{ isDefault: true }] : [])],
          },
          ...(type ? [{ type }] : []),
        ],
      },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        type: true,
        color: true,
        icon: true,
        isDefault: true,
        userId: true,
      },
    });

    return categories;
  },

  // 단일 카테고리 조회
  async getCategoryById(id: string, userId: string) {
    const category = await prisma.category.findFirst({
      where: {
        id,
        OR: [{ userId }, { isDefault: true }],
      },
      select: {
        id: true,
        name: true,
        type: true,
        color: true,
        icon: true,
        isDefault: true,
        userId: true,
      },
    });

    return category;
  },

  // 카테고리 생성
  async createCategory(userId: string, data: CreateCategoryDto) {
    // 동일한 이름의 카테고리가 있는지 확인
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: data.name,
        type: data.type,
        userId,
      },
    });

    if (existingCategory) {
      throw new Error('이미 동일한 이름의 카테고리가 존재합니다');
    }

    const category = await prisma.category.create({
      data: {
        name: data.name,
        type: data.type,
        color: data.color,
        icon: data.icon,
        userId,
        isDefault: false,
      },
      select: {
        id: true,
        name: true,
        type: true,
        color: true,
        icon: true,
        isDefault: true,
        userId: true,
      },
    });

    return category;
  },

  // 카테고리 수정
  async updateCategory(id: string, userId: string, data: UpdateCategoryDto) {
    // 카테고리 존재 및 권한 확인
    const existingCategory = await prisma.category.findFirst({
      where: { id, userId },
    });

    if (!existingCategory) {
      throw new Error('카테고리를 찾을 수 없거나 수정 권한이 없습니다');
    }

    // 기본 카테고리는 수정 불가
    if (existingCategory.isDefault) {
      throw new Error('기본 카테고리는 수정할 수 없습니다');
    }

    // 이름 중복 확인
    if (data.name) {
      const duplicateCategory = await prisma.category.findFirst({
        where: {
          name: data.name,
          type: existingCategory.type,
          userId,
          id: { not: id },
        },
      });

      if (duplicateCategory) {
        throw new Error('이미 동일한 이름의 카테고리가 존재합니다');
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.color !== undefined && { color: data.color }),
        ...(data.icon !== undefined && { icon: data.icon }),
      },
      select: {
        id: true,
        name: true,
        type: true,
        color: true,
        icon: true,
        isDefault: true,
        userId: true,
      },
    });

    return category;
  },

  // 카테고리 삭제
  async deleteCategory(id: string, userId: string, reassignTo?: string) {
    // 카테고리 존재 및 권한 확인
    const category = await prisma.category.findFirst({
      where: { id, userId },
    });

    if (!category) {
      throw new Error('카테고리를 찾을 수 없거나 삭제 권한이 없습니다');
    }

    // 기본 카테고리는 삭제 불가
    if (category.isDefault) {
      throw new Error('기본 카테고리는 삭제할 수 없습니다');
    }

    // 카테고리를 사용하는 거래 확인
    const transactionCount = await prisma.transaction.count({
      where: { categoryId: id, userId },
    });

    if (transactionCount > 0) {
      if (!reassignTo) {
        throw new Error(
          `이 카테고리를 사용하는 거래가 ${transactionCount}개 있습니다. 거래를 재할당할 카테고리를 지정해주세요.`
        );
      }

      // 재할당 카테고리 유효성 검증
      const reassignCategory = await prisma.category.findFirst({
        where: {
          id: reassignTo,
          type: category.type, // 같은 타입의 카테고리여야 함
          OR: [{ userId }, { isDefault: true }],
        },
      });

      if (!reassignCategory) {
        throw new Error('유효하지 않은 재할당 카테고리입니다');
      }

      // 트랜잭션으로 거래 재할당 및 카테고리 삭제
      await prisma.$transaction([
        prisma.transaction.updateMany({
          where: { categoryId: id, userId },
          data: { categoryId: reassignTo },
        }),
        prisma.category.delete({
          where: { id },
        }),
      ]);

      return {
        message: '카테고리가 삭제되었습니다',
        reassignedCount: transactionCount,
      };
    }

    // 사용 중인 거래가 없으면 바로 삭제
    await prisma.category.delete({
      where: { id },
    });

    return {
      message: '카테고리가 삭제되었습니다',
      reassignedCount: 0,
    };
  },

  // 카테고리 사용 현황 조회
  async getCategoryUsage(id: string, userId: string) {
    const category = await prisma.category.findFirst({
      where: {
        id,
        OR: [{ userId }, { isDefault: true }],
      },
    });

    if (!category) {
      throw new Error('카테고리를 찾을 수 없습니다');
    }

    // 거래 수와 총액 계산
    const transactions = await prisma.transaction.groupBy({
      by: ['type'],
      where: {
        categoryId: id,
        userId,
      },
      _count: {
        id: true,
      },
      _sum: {
        amount: true,
      },
    });

    const stats = transactions[0] || { _count: { id: 0 }, _sum: { amount: 0 } };

    return {
      category,
      transactionCount: stats._count.id,
      totalAmount: stats._sum.amount || 0,
    };
  },
};
