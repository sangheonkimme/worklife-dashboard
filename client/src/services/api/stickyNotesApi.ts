import api from '@/lib/axios';
import type {
  StickyNote,
  CreateStickyNoteDto,
  UpdateStickyNoteDto,
} from '@/types/stickyNote';

// Sticky Notes API
export const stickyNotesApi = {
  // 모든 스티커 메모 조회
  getAll: () => api.get<StickyNote[]>('/api/sticky-notes').then((res) => res.data),

  // 스티커 메모 생성
  create: (data: CreateStickyNoteDto) =>
    api.post<StickyNote>('/api/sticky-notes', data).then((res) => res.data),

  // 스티커 메모 수정
  update: (id: string, data: UpdateStickyNoteDto) =>
    api.put<StickyNote>(`/api/sticky-notes/${id}`, data).then((res) => res.data),

  // 스티커 메모 삭제
  deleteById: (id: string) =>
    api.delete<{ message: string }>(`/api/sticky-notes/${id}`).then((res) => res.data),
};
