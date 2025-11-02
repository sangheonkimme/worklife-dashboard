import { prisma } from '../lib/prisma';

export interface CreateFolderData {
  name: string;
  color?: string;
  icon?: string;
  parentId?: string;
}

export interface UpdateFolderData {
  name?: string;
  color?: string;
  icon?: string;
  parentId?: string | null;
}

export const folderService = {
  /**
   * 폴더 목록 조회 (트리 구조)
   */
  async getFolders(userId: string, includeChildren: boolean = true) {
    const folders = await prisma.folder.findMany({
      where: {
        userId,
      },
      include: {
        _count: {
          select: {
            notes: true,
          },
        },
        ...(includeChildren && {
          children: {
            include: {
              _count: {
                select: {
                  notes: true,
                },
              },
            },
          },
        }),
      },
      orderBy: [
        { createdAt: 'asc' },
      ],
    });

    return folders;
  },

  /**
   * 특정 폴더 조회
   */
  async getFolderById(folderId: string, userId: string) {
    const folder = await prisma.folder.findFirst({
      where: {
        id: folderId,
        userId,
      },
      include: {
        _count: {
          select: {
            notes: true,
            children: true,
          },
        },
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
            _count: {
              select: {
                notes: true,
              },
            },
          },
        },
      },
    });

    if (!folder) {
      throw new Error('폴더를 찾을 수 없습니다');
    }

    return folder;
  },

  /**
   * 폴더 생성
   */
  async createFolder(data: CreateFolderData, userId: string) {
    // parentId가 있으면 부모 폴더 확인 및 깊이 검증
    if (data.parentId) {
      const parent = await prisma.folder.findFirst({
        where: {
          id: data.parentId,
          userId,
        },
      });

      if (!parent) {
        throw new Error('부모 폴더를 찾을 수 없습니다');
      }

      // 깊이 계산 (최대 3단계)
      const depth = await this.calculateFolderDepth(data.parentId, userId);
      if (depth >= 2) {
        throw new Error('폴더는 최대 3단계까지만 생성할 수 있습니다');
      }
    }

    const folder = await prisma.folder.create({
      data: {
        ...data,
        userId,
      },
      include: {
        _count: {
          select: {
            notes: true,
          },
        },
      },
    });

    return folder;
  },

  /**
   * 폴더 수정
   */
  async updateFolder(folderId: string, data: UpdateFolderData, userId: string) {
    // 폴더 존재 확인
    const existingFolder = await prisma.folder.findFirst({
      where: {
        id: folderId,
        userId,
      },
    });

    if (!existingFolder) {
      throw new Error('폴더를 찾을 수 없습니다');
    }

    // parentId 변경 시 순환 참조 및 깊이 검증
    if (data.parentId !== undefined) {
      if (data.parentId === folderId) {
        throw new Error('자기 자신을 부모 폴더로 설정할 수 없습니다');
      }

      if (data.parentId) {
        // 순환 참조 검증
        const isCircular = await this.checkCircularReference(folderId, data.parentId, userId);
        if (isCircular) {
          throw new Error('순환 참조가 발생합니다');
        }

        // 깊이 검증
        const depth = await this.calculateFolderDepth(data.parentId, userId);
        if (depth >= 2) {
          throw new Error('폴더는 최대 3단계까지만 생성할 수 있습니다');
        }
      }
    }

    const folder = await prisma.folder.update({
      where: {
        id: folderId,
      },
      data,
      include: {
        _count: {
          select: {
            notes: true,
          },
        },
      },
    });

    return folder;
  },

  /**
   * 폴더 이동
   */
  async moveFolder(folderId: string, parentId: string | null, userId: string) {
    return this.updateFolder(folderId, { parentId }, userId);
  },

  /**
   * 폴더 삭제
   */
  async deleteFolder(folderId: string, userId: string) {
    // 폴더 존재 확인
    const folder = await prisma.folder.findFirst({
      where: {
        id: folderId,
        userId,
      },
      include: {
        _count: {
          select: {
            children: true,
          },
        },
      },
    });

    if (!folder) {
      throw new Error('폴더를 찾을 수 없습니다');
    }

    // 하위 폴더가 있으면 삭제 불가
    if (folder._count.children > 0) {
      throw new Error('하위 폴더가 있는 폴더는 삭제할 수 없습니다');
    }

    // 폴더 삭제 (CASCADE로 인해 메모의 folderId는 null이 됨)
    await prisma.folder.delete({
      where: {
        id: folderId,
      },
    });

    return { success: true };
  },

  /**
   * 폴더 깊이 계산 (재귀)
   */
  async calculateFolderDepth(folderId: string, userId: string): Promise<number> {
    const folder = await prisma.folder.findFirst({
      where: {
        id: folderId,
        userId,
      },
      select: {
        parentId: true,
      },
    });

    if (!folder || !folder.parentId) {
      return 0;
    }

    return 1 + await this.calculateFolderDepth(folder.parentId, userId);
  },

  /**
   * 순환 참조 검증
   */
  async checkCircularReference(folderId: string, targetParentId: string, userId: string): Promise<boolean> {
    let currentId: string | null = targetParentId;

    while (currentId) {
      if (currentId === folderId) {
        return true;
      }

      const folder: { parentId: string | null } | null = await prisma.folder.findFirst({
        where: {
          id: currentId,
          userId,
        },
        select: {
          parentId: true,
        },
      });

      if (!folder) {
        break;
      }

      currentId = folder.parentId;
    }

    return false;
  },
};
