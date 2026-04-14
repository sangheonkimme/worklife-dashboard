import api from '@/lib/axios';
import type { ApiResponse } from '@/types';
import type { NoteTemplate, CreateTemplateDto, UpdateTemplateDto } from '@/types/template';

export const templateApi = {
  // 템플릿 목록 조회
  getTemplates: () =>
    api.get<ApiResponse<NoteTemplate[]>>('/api/templates').then((res) => res.data.data),

  // 단일 템플릿 조회
  getTemplateById: (id: string) =>
    api.get<ApiResponse<NoteTemplate>>(`/api/templates/${id}`).then((res) => res.data.data),

  // 템플릿 생성
  createTemplate: (data: CreateTemplateDto) =>
    api.post<ApiResponse<NoteTemplate>>('/api/templates', data).then((res) => res.data.data),

  // 템플릿 수정
  updateTemplate: (id: string, data: UpdateTemplateDto) =>
    api
      .put<ApiResponse<NoteTemplate>>(`/api/templates/${id}`, data)
      .then((res) => res.data.data),

  // 템플릿 삭제
  deleteTemplate: (id: string) =>
    api.delete<ApiResponse<unknown>>(`/api/templates/${id}`).then((res) => res.data.data),
};
