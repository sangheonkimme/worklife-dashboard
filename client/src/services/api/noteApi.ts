import api from '@/lib/axios';
import type { ApiResponse } from '@/types';
import type {
  Note,
  CreateNoteDto,
  UpdateNoteDto,
  NoteFilters,
  NoteListResponse,
} from '@/types/note';
import type { SearchOptions, SearchSuggestions } from '@/types/search';

// Note API
export const noteApi = {
  // 메모 목록 조회
  getNotes: (filters?: NoteFilters) =>
    api
      .get<ApiResponse<NoteListResponse>>('/api/notes', { params: filters })
      .then((res) => res.data.data),

  // 단일 메모 조회
  getNoteById: (id: string) =>
    api.get<ApiResponse<Note>>(`/api/notes/${id}`).then((res) => res.data.data),

  // 메모 생성
  createNote: (data: CreateNoteDto) =>
    api.post<ApiResponse<Note>>('/api/notes', data).then((res) => res.data.data),

  // 메모 수정
  updateNote: (id: string, data: UpdateNoteDto) =>
    api.put<ApiResponse<Note>>(`/api/notes/${id}`, data).then((res) => res.data.data),

  // 메모 삭제 (소프트 삭제)
  deleteNote: (id: string) =>
    api
      .delete<ApiResponse<{ message: string }>>(`/api/notes/${id}`)
      .then((res) => res.data.data),

  // 휴지통 목록 조회
  getTrashNotes: (page = 1, limit = 20) =>
    api
      .get<ApiResponse<NoteListResponse>>('/api/notes/trash', { params: { page, limit } })
      .then((res) => res.data.data),

  // 메모 복구
  restoreNote: (id: string) =>
    api
      .post<ApiResponse<{ message: string }>>(`/api/notes/${id}/restore`)
      .then((res) => res.data.data),

  // 메모 영구 삭제
  permanentDeleteNote: (id: string) =>
    api
      .delete<ApiResponse<{ message: string }>>(`/api/notes/${id}/permanent`)
      .then((res) => res.data.data),

  // 메모 고정 토글
  togglePinned: (id: string, value: boolean) =>
    api
      .post<ApiResponse<{ message: string }>>(`/api/notes/${id}/toggle`, {
        flag: 'pinned',
        value,
      })
      .then((res) => res.data.data),

  // 메모 즐겨찾기 토글
  toggleFavorite: (id: string, value: boolean) =>
    api
      .post<ApiResponse<{ message: string }>>(`/api/notes/${id}/toggle`, {
        flag: 'favorite',
        value,
      })
      .then((res) => res.data.data),

  // 메모 보관함 토글
  toggleArchived: (id: string, value: boolean) =>
    api
      .post<ApiResponse<{ message: string }>>(`/api/notes/${id}/toggle`, {
        flag: 'archived',
        value,
      })
      .then((res) => res.data.data),

  // 메모 검색
  searchNotes: (options: SearchOptions) =>
    api
      .get<ApiResponse<NoteListResponse>>('/api/notes/search', { params: options })
      .then((res) => res.data.data),

  // 검색 제안
  getSearchSuggestions: (query: string, limit = 5) =>
    api
      .get<ApiResponse<SearchSuggestions>>('/api/notes/search/suggestions', {
        params: { q: query, limit },
      })
      .then((res) => res.data.data),
};
