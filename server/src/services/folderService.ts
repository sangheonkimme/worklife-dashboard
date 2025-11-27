import { prisma } from '../lib/prisma';

export interface CreateFolderData {
  name: string;
  color?: string;
  icon?: string;
}

export interface UpdateFolderData {
  name?: string;
  color?: string;
  icon?: string;
}

export const folderService = {
  /**
   * 폴더 목록 조회 (트리 구조)
   */
  async getFolders(userId: string, _includeChildren: boolean = true) {
    const folders = await prisma.folder.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      include: {
        _count: {
          select: {
            notes: true,
          },
        },
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
        deletedAt: null,
      },
      include: {
        _count: {
          select: {
            notes: true,
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
    const folder = await prisma.folder.create({
      data: {
        ...data,
        userId,
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
        deletedAt: null,
      },
    });

    if (!existingFolder) {
      throw new Error('폴더를 찾을 수 없습니다');
    }

    const folder = await prisma.folder.update({
      where: {
        id: folderId,
      },
      data,
    });

    return folder;
  },

  /**
   * 폴더 이동
   */
  async moveFolder(folderId: string, parentId: string | null, userId: string) {
    if (parentId !== null) {
      throw new Error('폴더는 1 depth만 지원합니다');
    }
    return this.updateFolder(folderId, {}, userId);
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
        deletedAt: null,
      },
    });

    if (!folder) {
      throw new Error('폴더를 찾을 수 없습니다');
    }

    // 폴더에 속한 노트의 폴더 참조 제거
    await prisma.note.updateMany({
      where: { folderId, userId },
      data: { folderId: null },
    });

    // 폴더 소프트 삭제
    await prisma.folder.update({
      where: {
        id: folderId,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return { success: true };
  },
};
