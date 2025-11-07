import api from '@/lib/axios';
import type {
  DashboardChecklistResponse,
  DashboardChecklistItem,
  CreateDashboardChecklistItemDto,
  UpdateDashboardChecklistItemDto,
} from '@/types/dashboardChecklist';

export const dashboardChecklistApi = {
  getList: () =>
    api.get<DashboardChecklistResponse>('/api/dashboard-checklist').then((res) => res.data),

  createItem: (data: CreateDashboardChecklistItemDto) =>
    api.post<DashboardChecklistItem>('/api/dashboard-checklist', data).then((res) => res.data),

  updateItem: (id: string, data: UpdateDashboardChecklistItemDto) =>
    api
      .patch<DashboardChecklistItem>(`/api/dashboard-checklist/${id}`, data)
      .then((res) => res.data),

  deleteItem: (id: string) =>
    api.delete<{ message: string }>(`/api/dashboard-checklist/${id}`).then((res) => res.data),
};
