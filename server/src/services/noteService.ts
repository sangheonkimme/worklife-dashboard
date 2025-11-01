import { prisma } from '../lib/prisma';
import { NoteType, NoteVisibility, Prisma } from '@prisma/client';

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
  folderId?: string;
  tagIds?: string[];
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
  tagIds?: string[];
}

// 메모 조회 필터
export interface NoteFilters {
  page?: number;
  limit?: number;
  type?: NoteType;
  folderId?: string;
  tagId?: string;
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
      tagId,
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
      ...(tagId && {
        noteTags: {
          some: {
            tagId,
          },
        },
      }),
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
              icon: true,
            },
          },
          noteTags: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  color: true,
                },
              },
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

    // noteTags를 tags로 변환
    const notesWithTags = notes.map((note) => ({
      ...note,
      tags: note.noteTags.map((nt) => nt.tag),
      noteTags: undefined,
    }));

    return {
      notes: notesWithTags,
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
            icon: true,
          },
        },
        noteTags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
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

    // noteTags를 tags로 변환
    const noteWithTags = {
      ...note,
      tags: note.noteTags.map((nt) => nt.tag),
      noteTags: undefined,
    };

    return noteWithTags;
  },

  // 메모 생성
  async createNote(userId: string, data: CreateNoteDto) {
    const { tagIds, ...noteData } = data;

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

    // 메모 생성
    const note = await prisma.note.create({
      data: {
        title: noteData.title,
        content: noteData.content || '',
        type: noteData.type || 'TEXT',
        visibility: noteData.visibility || 'PRIVATE',
        password: noteData.password,
        isPinned: noteData.isPinned || false,
        isFavorite: noteData.isFavorite || false,
        isArchived: noteData.isArchived || false,
        folderId: noteData.folderId,
        userId,
        ...(tagIds &&
          tagIds.length > 0 && {
            noteTags: {
              create: tagIds.map((tagId) => ({
                tagId,
              })),
            },
          }),
      },
      include: {
        folder: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
        },
        noteTags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
          },
        },
      },
    });

    // noteTags를 tags로 변환
    const noteWithTags = {
      ...note,
      tags: note.noteTags.map((nt) => nt.tag),
      noteTags: undefined,
    };

    return noteWithTags;
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

    const { tagIds, ...noteData } = data;

    // 태그 업데이트가 필요한 경우
    if (tagIds !== undefined) {
      // 기존 태그 연결 삭제
      await prisma.noteTag.deleteMany({
        where: { noteId: id },
      });

      // 새로운 태그 연결 생성
      if (tagIds.length > 0) {
        await prisma.noteTag.createMany({
          data: tagIds.map((tagId) => ({
            noteId: id,
            tagId,
          })),
        });
      }
    }

    // 메모 업데이트
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
      },
      include: {
        folder: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
        },
        noteTags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
          },
        },
      },
    });

    // noteTags를 tags로 변환
    const noteWithTags = {
      ...note,
      tags: note.noteTags.map((nt) => nt.tag),
      noteTags: undefined,
    };

    return noteWithTags;
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
              icon: true,
            },
          },
          noteTags: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  color: true,
                },
              },
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

    const notesWithTags = notes.map((note) => ({
      ...note,
      tags: note.noteTags.map((nt) => nt.tag),
      noteTags: undefined,
    }));

    return {
      notes: notesWithTags,
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
