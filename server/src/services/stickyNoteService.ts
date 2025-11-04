import { prisma } from '../lib/prisma';

// 스티커 메모 생성 DTO
export interface CreateStickyNoteDto {
  content?: string;
  color?: string;
  position?: number;
}

// 스티커 메모 수정 DTO
export interface UpdateStickyNoteDto {
  content?: string;
  color?: string;
  position?: number;
}

export const stickyNoteService = {
  // 사용자의 모든 스티커 메모 조회
  async findAllByUserId(userId: string) {
    return await prisma.stickyNote.findMany({
      where: { userId },
      orderBy: { position: 'asc' },
    });
  },

  // 특정 스티커 메모 조회 (권한 확인용)
  async findById(id: string, userId: string) {
    return await prisma.stickyNote.findFirst({
      where: {
        id,
        userId,
      },
    });
  },

  // 스티커 메모 생성
  async create(userId: string, data: CreateStickyNoteDto) {
    // 사용자가 이미 가지고 있는 메모 개수 확인
    const count = await prisma.stickyNote.count({
      where: { userId },
    });

    // 최대 4개까지만 생성 가능
    if (count >= 4) {
      throw new Error('최대 4개의 스티커 메모만 생성할 수 있습니다');
    }

    // position이 지정되지 않았으면 다음 사용 가능한 position 찾기
    if (data.position === undefined) {
      const existingNotes = await prisma.stickyNote.findMany({
        where: { userId },
        select: { position: true },
        orderBy: { position: 'asc' },
      });

      const usedPositions = new Set(existingNotes.map((n) => n.position));
      for (let i = 0; i < 4; i++) {
        if (!usedPositions.has(i)) {
          data.position = i;
          break;
        }
      }
    }

    return await prisma.stickyNote.create({
      data: {
        content: data.content || '',
        color: data.color || '#FFF9C4',
        position: data.position || 0,
        userId,
      },
    });
  },

  // 스티커 메모 수정
  async update(id: string, userId: string, data: UpdateStickyNoteDto) {
    // 권한 확인
    const note = await this.findById(id, userId);
    if (!note) {
      throw new Error('스티커 메모를 찾을 수 없습니다');
    }

    return await prisma.stickyNote.update({
      where: { id },
      data,
    });
  },

  // 스티커 메모 삭제
  async delete(id: string, userId: string) {
    // 권한 확인
    const note = await this.findById(id, userId);
    if (!note) {
      throw new Error('스티커 메모를 찾을 수 없습니다');
    }

    return await prisma.stickyNote.delete({
      where: { id },
    });
  },
};
