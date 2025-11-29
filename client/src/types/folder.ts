export interface Folder {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    notes: number;
  };
}

export interface CreateFolderDto {
  name: string;
  color?: string;
  icon?: string;
}

export interface UpdateFolderDto {
  name?: string;
  color?: string;
  icon?: string;
}
