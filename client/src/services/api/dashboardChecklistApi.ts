import api from '@/lib/axios';
import type { ApiResponse } from '@/types';
import type {
  DashboardChecklistResponse,
  DashboardChecklistItem,
  CreateDashboardChecklistItemDto,
  UpdateDashboardChecklistItemDto,
} from '@/types/dashboardChecklist';

export const dashboardChecklistApi = {
  getList: () =>
    api
      .get<ApiResponse<DashboardChecklistResponse>>('/api/dashboard-checklist')
      .then((res) => res.data.data),

  createItem: (data: CreateDashboardChecklistItemDto) =>
    api
      .post<ApiResponse<DashboardChecklistItem>>('/api/dashboard-checklist', data)
      .then((res) => res.data.data),

  updateItem: (id: string, data: UpdateDashboardChecklistItemDto) =>
    api
      .patch<ApiResponse<DashboardChecklistItem>>(`/api/dashboard-checklist/${id}`, data)
      .then((res) => res.data.data),

  deleteItem: (id: string) =>
    api
      .delete<ApiResponse<null>>(`/api/dashboard-checklist/${id}`)
      .then((res) => res.data.data),
};
