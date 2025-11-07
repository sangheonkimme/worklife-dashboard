export interface DashboardChecklistItem {
  id: string;
  content: string;
  isCompleted: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardChecklistResponse {
  activeItems: DashboardChecklistItem[];
  completedItems: DashboardChecklistItem[];
  maxItems: number;
}

export interface CreateDashboardChecklistItemDto {
  content: string;
}

export interface UpdateDashboardChecklistItemDto {
  content?: string;
  isCompleted?: boolean;
  order?: number;
}
