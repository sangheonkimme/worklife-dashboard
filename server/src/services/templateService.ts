import { prisma } from '../lib/prisma';
import { NoteType } from '@prisma/client';

export interface CreateTemplateDto {
  name: string;
  description?: string;
  content: string;
  type?: NoteType;
}

export interface UpdateTemplateDto {
  name?: string;
  description?: string | null;
  content?: string;
  type?: NoteType;
}

export const templateService = {
  // 템플릿 목록 조회 (사용자 템플릿 + 기본 템플릿)
  async getTemplates(userId: string) {
    // 사용자 템플릿과 기본 템플릿 모두 조회
    const templates = await prisma.noteTemplate.findMany({
      where: {
        OR: [
          { userId, isDefault: false }, // 사용자의 커스텀 템플릿
          { isDefault: true }, // 기본 제공 템플릿
        ],
      },
      orderBy: [
        { isDefault: 'desc' }, // 기본 템플릿 먼저
        { createdAt: 'desc' },
      ],
    });

    return templates;
  },

  // 단일 템플릿 조회
  async getTemplateById(id: string, userId: string) {
    const template = await prisma.noteTemplate.findFirst({
      where: {
        id,
        OR: [
          { userId, isDefault: false },
          { isDefault: true },
        ],
      },
    });

    return template;
  },

  // 템플릿 생성 (사용자 커스텀)
  async createTemplate(userId: string, data: CreateTemplateDto) {
    const template = await prisma.noteTemplate.create({
      data: {
        name: data.name,
        description: data.description,
        content: data.content,
        type: data.type || 'TEXT',
        isDefault: false,
        userId,
      },
    });

    return template;
  },

  // 템플릿 수정
  async updateTemplate(id: string, userId: string, data: UpdateTemplateDto) {
    // 기본 템플릿은 수정 불가
    const existingTemplate = await prisma.noteTemplate.findFirst({
      where: {
        id,
        userId,
        isDefault: false, // 사용자가 만든 템플릿만 수정 가능
      },
    });

    if (!existingTemplate) {
      throw new Error('템플릿을 찾을 수 없거나 수정 권한이 없습니다');
    }

    const template = await prisma.noteTemplate.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.content && { content: data.content }),
        ...(data.type && { type: data.type }),
      },
    });

    return template;
  },

  // 템플릿 삭제
  async deleteTemplate(id: string, userId: string) {
    // 기본 템플릿은 삭제 불가
    const template = await prisma.noteTemplate.findFirst({
      where: {
        id,
        userId,
        isDefault: false,
      },
    });

    if (!template) {
      throw new Error('템플릿을 찾을 수 없거나 삭제 권한이 없습니다');
    }

    await prisma.noteTemplate.delete({
      where: { id },
    });

    return { message: '템플릿이 삭제되었습니다' };
  },

  // 템플릿으로 노트 생성 (헬퍼 메서드)
  async createNoteFromTemplate(templateId: string, userId: string, noteData?: Partial<any>) {
    const template = await this.getTemplateById(templateId, userId);

    if (!template) {
      throw new Error('템플릿을 찾을 수 없습니다');
    }

    // 템플릿 내용을 기반으로 노트 생성 데이터 준비
    return {
      title: noteData?.title || `${template.name} - ${new Date().toLocaleDateString()}`,
      content: template.content,
      type: template.type,
      ...noteData,
    };
  },
};
