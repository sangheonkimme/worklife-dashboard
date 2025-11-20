import api from '@/lib/axios';
import type { NoteTemplate, CreateTemplateDto, UpdateTemplateDto } from '@/types/template';

export const templateApi = {
  // 템플릿 목록 조회
  getTemplates: () =>
    api.get<NoteTemplate[]>('/api/templates').then((res) => res.data),

  // 단일 템플릿 조회
  getTemplateById: (id: string) =>
    api.get<NoteTemplate>(`/api/templates/${id}`).then((res) => res.data),

  // 템플릿 생성
  createTemplate: (data: CreateTemplateDto) =>
    api.post<NoteTemplate>('/api/templates', data).then((res) => res.data),

  // 템플릿 수정
  updateTemplate: (id: string, data: UpdateTemplateDto) =>
    api.put<NoteTemplate>(`/api/templates/${id}`, data).then((res) => res.data),

  // 템플릿 삭제
  deleteTemplate: (id: string) =>
    api.delete(`/api/templates/${id}`).then((res) => res.data),
};
