import { prisma } from '../lib/prisma';

export interface CreateTagData {
  name: string;
  color?: string;
}

export interface UpdateTagData {
  name?: string;
  color?: string;
}

export const tagService = {
  /**
   * 태그 목록 조회
   */
  async getTags(userId: string, includeCount: boolean = false) {
    const tags = await prisma.tag.findMany({
      where: {
        userId,
      },
      ...(includeCount && {
        include: {
          _count: {
            select: {
              noteTags: true,
            },
          },
        },
      }),
      orderBy: [
        { name: 'asc' },
      ],
    });

    return tags;
  },

  /**
   * 특정 태그 조회
   */
  async getTagById(tagId: string, userId: string) {
    const tag = await prisma.tag.findFirst({
      where: {
        id: tagId,
        userId,
      },
      include: {
        _count: {
          select: {
            noteTags: true,
          },
        },
      },
    });

    if (!tag) {
      throw new Error('태그를 찾을 수 없습니다');
    }

    return tag;
  },

  /**
   * 태그 생성
   */
  async createTag(data: CreateTagData, userId: string) {
    // 중복 태그명 확인
    const existingTag = await prisma.tag.findFirst({
      where: {
        userId,
        name: data.name,
      },
    });

    if (existingTag) {
      throw new Error('이미 존재하는 태그입니다');
    }

    const tag = await prisma.tag.create({
      data: {
        ...data,
        userId,
      },
      include: {
        _count: {
          select: {
            noteTags: true,
          },
        },
      },
    });

    return tag;
  },

  /**
   * 태그 수정
   */
  async updateTag(tagId: string, data: UpdateTagData, userId: string) {
    // 태그 존재 확인
    const existingTag = await prisma.tag.findFirst({
      where: {
        id: tagId,
        userId,
      },
    });

    if (!existingTag) {
      throw new Error('태그를 찾을 수 없습니다');
    }

    // 이름 변경 시 중복 확인
    if (data.name && data.name !== existingTag.name) {
      const duplicateTag = await prisma.tag.findFirst({
        where: {
          userId,
          name: data.name,
          id: { not: tagId },
        },
      });

      if (duplicateTag) {
        throw new Error('이미 존재하는 태그 이름입니다');
      }
    }

    const tag = await prisma.tag.update({
      where: {
        id: tagId,
      },
      data,
      include: {
        _count: {
          select: {
            noteTags: true,
          },
        },
      },
    });

    return tag;
  },

  /**
   * 태그 삭제
   */
  async deleteTag(tagId: string, userId: string) {
    // 태그 존재 확인
    const tag = await prisma.tag.findFirst({
      where: {
        id: tagId,
        userId,
      },
    });

    if (!tag) {
      throw new Error('태그를 찾을 수 없습니다');
    }

    // 태그 삭제 (CASCADE로 인해 note_tags도 함께 삭제됨)
    await prisma.tag.delete({
      where: {
        id: tagId,
      },
    });

    return { success: true };
  },

  /**
   * 태그 자동완성 (검색)
   */
  async suggestTags(userId: string, query: string, limit: number = 10) {
    const tags = await prisma.tag.findMany({
      where: {
        userId,
        name: {
          contains: query,
          mode: 'insensitive', // 대소문자 구분 없이
        },
      },
      take: limit,
      orderBy: [
        { name: 'asc' },
      ],
    });

    return tags;
  },

  /**
   * 메모에 태그 연결
   */
  async addTagsToNote(noteId: string, tagIds: string[], userId: string) {
    // 메모 소유권 확인
    const note = await prisma.note.findFirst({
      where: {
        id: noteId,
        userId,
      },
    });

    if (!note) {
      throw new Error('메모를 찾을 수 없습니다');
    }

    // 태그 소유권 확인
    const tags = await prisma.tag.findMany({
      where: {
        id: { in: tagIds },
        userId,
      },
    });

    if (tags.length !== tagIds.length) {
      throw new Error('일부 태그를 찾을 수 없습니다');
    }

    // 기존 연결 삭제 후 새로 생성
    await prisma.noteTag.deleteMany({
      where: {
        noteId,
      },
    });

    const noteTags = await prisma.noteTag.createMany({
      data: tagIds.map(tagId => ({
        noteId,
        tagId,
      })),
      skipDuplicates: true,
    });

    return noteTags;
  },

  /**
   * 메모에서 태그 제거
   */
  async removeTagFromNote(noteId: string, tagId: string, userId: string) {
    // 메모 소유권 확인
    const note = await prisma.note.findFirst({
      where: {
        id: noteId,
        userId,
      },
    });

    if (!note) {
      throw new Error('메모를 찾을 수 없습니다');
    }

    // 연결 삭제
    await prisma.noteTag.deleteMany({
      where: {
        noteId,
        tagId,
      },
    });

    return { success: true };
  },
};
