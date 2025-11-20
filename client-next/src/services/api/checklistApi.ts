import api from '@/lib/axios';
import type {
  ChecklistItem,
  CreateChecklistItemDto,
  UpdateChecklistItemDto,
  ChecklistProgress,
  ReorderChecklistItemDto,
} from '@/types/checklist';

export const checklistApi = {
  // 체크리스트 항목 목록 조회
  getItems: (noteId: string) =>
    api.get<ChecklistItem[]>(`/api/notes/${noteId}/checklist`).then((res) => res.data),

  // 체크리스트 진행률 조회
  getProgress: (noteId: string) =>
    api.get<ChecklistProgress>(`/api/notes/${noteId}/checklist/progress`).then((res) => res.data),

  // 체크리스트 항목 생성
  createItem: (noteId: string, data: CreateChecklistItemDto) =>
    api.post<ChecklistItem>(`/api/notes/${noteId}/checklist`, data).then((res) => res.data),

  // 체크리스트 항목 수정
  updateItem: (id: string, data: UpdateChecklistItemDto) =>
    api.put<ChecklistItem>(`/api/checklist/${id}`, data).then((res) => res.data),

  // 체크리스트 항목 토글
  toggleItem: (id: string, isCompleted: boolean) =>
    api.post<ChecklistItem>(`/api/checklist/${id}/toggle`, { isCompleted }).then((res) => res.data),

  // 체크리스트 항목 삭제
  deleteItem: (id: string) =>
    api.delete(`/api/checklist/${id}`).then((res) => res.data),

  // 체크리스트 항목 순서 변경
  reorderItems: (noteId: string, items: ReorderChecklistItemDto[]) =>
    api.post<ChecklistItem[]>(`/api/notes/${noteId}/checklist/reorder`, { items }).then((res) => res.data),
};
