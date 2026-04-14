import api from '@/lib/axios';
import type { ApiResponse } from '@/types';
import type {
  StickyNote,
  CreateStickyNoteDto,
  UpdateStickyNoteDto,
} from '@/types/stickyNote';

// Sticky Notes API
export const stickyNotesApi = {
  // 모든 스티커 메모 조회
  getAll: () =>
    api.get<ApiResponse<StickyNote[]>>('/api/sticky-notes').then((res) => res.data.data),

  // 스티커 메모 생성
  create: (data: CreateStickyNoteDto) =>
    api.post<ApiResponse<StickyNote>>('/api/sticky-notes', data).then((res) => res.data.data),

  // 스티커 메모 수정
  update: (id: string, data: UpdateStickyNoteDto) =>
    api
      .put<ApiResponse<StickyNote>>(`/api/sticky-notes/${id}`, data)
      .then((res) => res.data.data),

  // 스티커 메모 삭제
  deleteById: (id: string) =>
    api.delete<ApiResponse<null>>(`/api/sticky-notes/${id}`).then((res) => res.data.data),
};
