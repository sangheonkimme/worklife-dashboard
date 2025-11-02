import { prisma } from '../lib/prisma';
import { NoteType, Prisma } from '@prisma/client';

export interface SearchOptions {
  query: string;
  type?: NoteType;
  folderId?: string;
  tagIds?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  isPinned?: boolean;
  isFavorite?: boolean;
  isArchived?: boolean;
  page?: number;
  limit?: number;
}

export const searchService = {
  /**
   * 메모 전문 검색
   */
  async searchNotes(userId: string, options: SearchOptions) {
    const {
      query,
      type,
      folderId,
      tagIds,
      dateFrom,
      dateTo,
      isPinned,
      isFavorite,
      isArchived,
      page = 1,
      limit = 20,
    } = options;

    const skip = (page - 1) * limit;

    // WHERE 조건 구성
    const where: Prisma.NoteWhereInput = {
      userId,
      deletedAt: null,
      // 검색어 조건
      ...(query && {
        OR: [
          {
            title: {
              contains: query,
              mode: 'insensitive' as Prisma.QueryMode,
            },
          },
          {
            content: {
              contains: query,
              mode: 'insensitive' as Prisma.QueryMode,
            },
          },
        ],
      }),
      // 타입 필터
      ...(type && { type }),
      // 폴더 필터
      ...(folderId && { folderId }),
      // 태그 필터 (여러 태그 AND 조건)
      ...(tagIds &&
        tagIds.length > 0 && {
          AND: tagIds.map((tagId) => ({
            noteTags: {
              some: { tagId },
            },
          })),
        }),
      // 날짜 범위 필터
      ...(dateFrom && {
        createdAt: {
          gte: dateFrom,
        },
      }),
      ...(dateTo && {
        createdAt: {
          lte: dateTo,
        },
      }),
      // 상태 필터
      ...(isPinned !== undefined && { isPinned }),
      ...(isFavorite !== undefined && { isFavorite }),
      ...(isArchived !== undefined && { isArchived }),
    };

    // 검색 실행
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
        orderBy: [
          { isPinned: 'desc' }, // 고정된 메모 우선
          { updatedAt: 'desc' }, // 최신 순
        ],
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

  /**
   * 최근 검색어 관리 (클라이언트에서 localStorage 사용 권장)
   * 서버 측에서 저장이 필요한 경우를 위한 예시 메서드
   */
  async saveSearchHistory(_userId: string, _query: string) {
    // 필요시 검색 히스토리 테이블을 만들어 관리
    // 현재는 클라이언트에서 localStorage로 관리하므로 생략
    return { success: true };
  },

  /**
   * 인기 검색어 조회
   */
  async getPopularSearches(_userId: string, _limit: number = 10) {
    // 필요시 검색 히스토리 테이블을 만들어 관리
    // 현재는 클라이언트에서 localStorage로 관리하므로 생략
    return [];
  },

  /**
   * 검색 제안 (태그 기반)
   */
  async getSearchSuggestions(userId: string, query: string, limit: number = 5) {
    // 태그 이름으로 제안
    const tagSuggestions = await prisma.tag.findMany({
      where: {
        userId,
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },
      take: limit,
      select: {
        id: true,
        name: true,
        color: true,
      },
    });

    // 폴더 이름으로 제안
    const folderSuggestions = await prisma.folder.findMany({
      where: {
        userId,
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },
      take: limit,
      select: {
        id: true,
        name: true,
        color: true,
        icon: true,
      },
    });

    // 메모 제목으로 제안
    const noteSuggestions = await prisma.note.findMany({
      where: {
        userId,
        deletedAt: null,
        title: {
          contains: query,
          mode: 'insensitive',
        },
      },
      take: limit,
      select: {
        id: true,
        title: true,
        type: true,
      },
    });

    return {
      tags: tagSuggestions,
      folders: folderSuggestions,
      notes: noteSuggestions,
    };
  },
};
