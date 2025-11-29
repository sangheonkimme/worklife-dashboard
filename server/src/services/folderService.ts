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

const DEFAULT_FOLDER_NAME = '기타';

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
    const result = await prisma.$transaction(async (tx) => {
      const folder = await tx.folder.findFirst({
        where: {
          id: folderId,
          userId,
          deletedAt: null,
        },
      });

      if (!folder) {
        throw new Error('폴더를 찾을 수 없습니다');
      }

      // 삭제되는 폴더의 노트를 옮길 기본 폴더 확보
      let fallbackFolder = await tx.folder.findFirst({
        where: {
          userId,
          name: DEFAULT_FOLDER_NAME,
          deletedAt: null,
          NOT: { id: folderId },
        },
      });

      if (!fallbackFolder) {
        fallbackFolder = await tx.folder.create({
          data: {
            name: DEFAULT_FOLDER_NAME,
            userId,
          },
        });
      }

      const movedNotes = await tx.note.updateMany({
        where: { folderId, userId },
        data: { folderId: fallbackFolder.id },
      });

      await tx.folder.update({
        where: {
          id: folderId,
        },
        data: {
          deletedAt: new Date(),
        },
      });

      return {
        success: true,
        fallbackFolderId: fallbackFolder.id,
        movedNoteCount: movedNotes.count,
      };
    });

    return result;
  },
};
