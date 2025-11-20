export interface ChecklistItem {
  id: string;
  content: string;
  isCompleted: boolean;
  order: number;
  noteId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateChecklistItemDto {
  content: string;
  order?: number;
}

export interface UpdateChecklistItemDto {
  content?: string;
  isCompleted?: boolean;
  order?: number;
}

export interface ChecklistProgress {
  total: number;
  completed: number;
  percentage: number;
}

export interface ReorderChecklistItemDto {
  id: string;
  order: number;
}
