import { prisma } from '../lib/prisma';
import { NoteType, NoteVisibility, Prisma } from '@prisma/client';
import crypto from 'crypto';

// 공개 URL 생성 함수
function generatePublishedUrl(): string {
  return crypto.randomBytes(16).toString('hex');
}

// 체크리스트 항목 DTO
export interface ChecklistItemDto {
  content: string;
  isCompleted?: boolean;
  order?: number;
}

// 메모 생성 DTO
export interface CreateNoteDto {
  title: string;
  content?: string;
  type?: NoteType;
  visibility?: NoteVisibility;
  password?: string;
  isPinned?: boolean;
  isFavorite?: boolean;
  isArchived?: boolean;
  folderId?: string | null;
  checklistItems?: ChecklistItemDto[];
}

// 메모 수정 DTO
export interface UpdateNoteDto {
  title?: string;
  content?: string;
  type?: NoteType;
  visibility?: NoteVisibility;
  password?: string | null;
  isPinned?: boolean;
  isFavorite?: boolean;
  isArchived?: boolean;
  folderId?: string | null;
  checklistItems?: ChecklistItemDto[];
}

// 메모 조회 필터
export interface NoteFilters {
  page?: number;
  limit?: number;
  type?: NoteType;
  folderId?: string;
  isPinned?: boolean;
  isFavorite?: boolean;
  isArchived?: boolean;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export const noteService = {
  // 메모 목록 조회 (페이지네이션 및 필터링)
  async getNotes(userId: string, filters: NoteFilters) {
    const {
      page = 1,
      limit = 20,
      type,
      folderId,
      isPinned,
      isFavorite,
      isArchived,
      search,
      sortBy = 'updatedAt',
      sortOrder = 'desc',
    } = filters;

    const skip = (page - 1) * limit;

    // WHERE 조건 구성
    const where: Prisma.NoteWhereInput = {
      userId,
      deletedAt: null, // 소프트 삭제되지 않은 메모만
      ...(type && { type }),
      ...(folderId && { folderId }),
      ...(isPinned !== undefined && { isPinned }),
      ...(isFavorite !== undefined && { isFavorite }),
      ...(isArchived !== undefined && { isArchived }),
      ...(search && {
        OR: [
          {
            title: {
              contains: search,
              mode: 'insensitive' as Prisma.QueryMode,
            },
          },
          {
            content: {
              contains: search,
              mode: 'insensitive' as Prisma.QueryMode,
            },
          },
        ],
      }),
    };

    // 정렬 옵션
    const orderBy: Prisma.NoteOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    // 데이터 조회 및 총 개수 조회
    const [notes, total] = await Promise.all([
      prisma.note.findMany({
        where,
        include: {
          folder: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
          checklistItems: {
            select: {
              id: true,
              content: true,
              isCompleted: true,
              order: true,
            },
            orderBy: {
              order: 'asc',
            },
          },
          attachments: {
            select: {
              id: true,
              fileName: true,
              fileSize: true,
              mimeType: true,
              type: true,
              url: true,
              thumbnailUrl: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.note.count({ where }),
    ]);

    return {
      notes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  // 단일 메모 조회
  async getNoteById(id: string, userId: string) {
    const note = await prisma.note.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
      include: {
        folder: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        checklistItems: {
          select: {
            id: true,
            content: true,
            isCompleted: true,
            order: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
        attachments: {
          select: {
            id: true,
            fileName: true,
            fileSize: true,
            mimeType: true,
            type: true,
            url: true,
            thumbnailUrl: true,
          },
        },
        noteTransactions: {
          include: {
            transaction: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    if (!note) {
      return null;
    }

    return note;
  },

  // 메모 생성
  async createNote(userId: string, data: CreateNoteDto) {
    // 폴더 유효성 검증
    if (data.folderId) {
      const folder = await prisma.folder.findFirst({
        where: {
          id: data.folderId,
          userId,
        },
      });

      if (!folder) {
        throw new Error('유효하지 않은 폴더입니다');
      }
    }

    // PUBLIC 메모인 경우 공개 URL 생성
    const publishedUrl =
      data.visibility === 'PUBLIC' ? generatePublishedUrl() : undefined;

    // 메모 생성 (checklistItems 포함)
    const note = await prisma.note.create({
      data: {
        title: data.title,
        content: data.content || '',
        type: data.type || 'TEXT',
        visibility: data.visibility || 'PRIVATE',
        password: data.password,
        publishedUrl,
        isPinned: data.isPinned || false,
        isFavorite: data.isFavorite || false,
        isArchived: data.isArchived || false,
        folderId: data.folderId,
        userId,
        // checklistItems가 있으면 함께 생성
        ...(data.checklistItems && data.checklistItems.length > 0
          ? {
              checklistItems: {
                create: data.checklistItems.map((item, index) => ({
                  content: item.content,
                  isCompleted: item.isCompleted || false,
                  order: item.order ?? index,
                })),
              },
            }
          : {}),
      },
      include: {
        folder: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        checklistItems: {
          select: {
            content: true,
            isCompleted: true,
            order: true,
          },
          orderBy: { order: 'asc' },
        },
        attachments: {
          select: {
            id: true,
            url: true,
            mimeType: true,
            fileName: true,
            fileSize: true,
            createdAt: true,
          },
        },
      },
    });

    return note;
  },

  // 메모 수정
  async updateNote(id: string, userId: string, data: UpdateNoteDto) {
    // 메모 존재 및 권한 확인
    const existingNote = await prisma.note.findFirst({
      where: { id, userId, deletedAt: null },
    });

    if (!existingNote) {
      throw new Error('메모를 찾을 수 없습니다');
    }

    // 폴더 유효성 검증
    if (data.folderId) {
      const folder = await prisma.folder.findFirst({
        where: {
          id: data.folderId,
          userId,
        },
      });

      if (!folder) {
        throw new Error('유효하지 않은 폴더입니다');
      }
    }

    const noteData = data;

    // visibility가 PUBLIC으로 변경되었고 publishedUrl이 없으면 생성
    let publishedUrlUpdate = {};
    if (noteData.visibility === 'PUBLIC' && !existingNote.publishedUrl) {
      publishedUrlUpdate = { publishedUrl: generatePublishedUrl() };
    }
    // visibility가 PUBLIC이 아니면 publishedUrl 제거
    if (noteData.visibility && noteData.visibility !== 'PUBLIC') {
      publishedUrlUpdate = { publishedUrl: null };
    }

    // checklistItems가 제공된 경우 트랜잭션으로 처리
    if (data.checklistItems !== undefined) {
      const checklistItems = data.checklistItems;
      const result = await prisma.$transaction(async (tx) => {
        // 기존 checklistItems 삭제
        await tx.checklistItem.deleteMany({
          where: { noteId: id },
        });

        // 메모 업데이트 + 새 checklistItems 생성
        const updatedNote = await tx.note.update({
          where: { id },
          data: {
            ...(noteData.title !== undefined && { title: noteData.title }),
            ...(noteData.content !== undefined && { content: noteData.content }),
            ...(noteData.type && { type: noteData.type }),
            ...(noteData.visibility && { visibility: noteData.visibility }),
            ...(noteData.password !== undefined && { password: noteData.password }),
            ...(noteData.isPinned !== undefined && { isPinned: noteData.isPinned }),
            ...(noteData.isFavorite !== undefined && { isFavorite: noteData.isFavorite }),
            ...(noteData.isArchived !== undefined && { isArchived: noteData.isArchived }),
            ...(noteData.folderId !== undefined && { folderId: noteData.folderId }),
            ...publishedUrlUpdate,
            deviceRevision: { increment: 1 },
            ...(checklistItems.length > 0
              ? {
                  checklistItems: {
                    create: checklistItems.map((item, index) => ({
                      content: item.content,
                      isCompleted: item.isCompleted || false,
                      order: item.order ?? index,
                    })),
                  },
                }
              : {}),
          },
          include: {
            folder: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
            checklistItems: {
              select: {
                content: true,
                isCompleted: true,
                order: true,
              },
              orderBy: { order: 'asc' },
            },
            attachments: {
              select: {
                id: true,
                url: true,
                mimeType: true,
                fileName: true,
                fileSize: true,
                createdAt: true,
              },
            },
          },
        });

        return updatedNote;
      });

      return result;
    }

    // checklistItems가 없는 경우 기본 업데이트
    const note = await prisma.note.update({
      where: { id },
      data: {
        ...(noteData.title !== undefined && { title: noteData.title }),
        ...(noteData.content !== undefined && { content: noteData.content }),
        ...(noteData.type && { type: noteData.type }),
        ...(noteData.visibility && { visibility: noteData.visibility }),
        ...(noteData.password !== undefined && { password: noteData.password }),
        ...(noteData.isPinned !== undefined && { isPinned: noteData.isPinned }),
        ...(noteData.isFavorite !== undefined && { isFavorite: noteData.isFavorite }),
        ...(noteData.isArchived !== undefined && { isArchived: noteData.isArchived }),
        ...(noteData.folderId !== undefined && { folderId: noteData.folderId }),
        ...publishedUrlUpdate,
        deviceRevision: { increment: 1 },
      },
      include: {
        folder: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        checklistItems: {
          select: {
            content: true,
            isCompleted: true,
            order: true,
          },
          orderBy: { order: 'asc' },
        },
        attachments: {
          select: {
            id: true,
            url: true,
            mimeType: true,
            fileName: true,
            fileSize: true,
            createdAt: true,
          },
        },
      },
    });

    return note;
  },

  // 메모 삭제 (소프트 삭제)
  async deleteNote(id: string, userId: string) {
    // 메모 존재 및 권한 확인
    const note = await prisma.note.findFirst({
      where: { id, userId, deletedAt: null },
    });

    if (!note) {
      throw new Error('메모를 찾을 수 없습니다');
    }

    // 소프트 삭제
    await prisma.note.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return { message: '메모가 휴지통으로 이동되었습니다' };
  },

  // 휴지통 목록 조회
  async getTrashNotes(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const where: Prisma.NoteWhereInput = {
      userId,
      deletedAt: { not: null },
    };

    const [notes, total] = await Promise.all([
      prisma.note.findMany({
        where,
        include: {
          folder: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
        orderBy: {
          deletedAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.note.count({ where }),
    ]);

    return {
      notes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  // 메모 복구
  async restoreNote(id: string, userId: string) {
    const note = await prisma.note.findFirst({
      where: {
        id,
        userId,
        deletedAt: { not: null },
      },
    });

    if (!note) {
      throw new Error('휴지통에서 메모를 찾을 수 없습니다');
    }

    await prisma.note.update({
      where: { id },
      data: {
        deletedAt: null,
      },
    });

    return { message: '메모가 복구되었습니다' };
  },

  // 메모 영구 삭제
  async permanentDeleteNote(id: string, userId: string) {
    const note = await prisma.note.findFirst({
      where: {
        id,
        userId,
        deletedAt: { not: null },
      },
    });

    if (!note) {
      throw new Error('휴지통에서 메모를 찾을 수 없습니다');
    }

    await prisma.note.delete({
      where: { id },
    });

    return { message: '메모가 영구적으로 삭제되었습니다' };
  },

  // 메모 고정/즐겨찾기/보관함 토글
  async toggleNoteFlag(
    id: string,
    userId: string,
    flag: 'pinned' | 'favorite' | 'archived',
    value: boolean
  ) {
    const note = await prisma.note.findFirst({
      where: { id, userId, deletedAt: null },
    });

    if (!note) {
      throw new Error('메모를 찾을 수 없습니다');
    }

    const fieldMap = {
      pinned: 'isPinned',
      favorite: 'isFavorite',
      archived: 'isArchived',
    };

    await prisma.note.update({
      where: { id },
      data: {
        [fieldMap[flag]]: value,
      },
    });

    return { message: `메모가 업데이트되었습니다` };
  },
};
