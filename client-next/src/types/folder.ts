export interface Folder {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  parentId?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    notes: number;
    children?: number;
  };
  parent?: {
    id: string;
    name: string;
  };
  children?: Folder[];
}

export interface CreateFolderDto {
  name: string;
  color?: string;
  icon?: string;
  parentId?: string;
}

export interface UpdateFolderDto {
  name?: string;
  color?: string;
  icon?: string;
  parentId?: string | null;
}

export interface MoveFolderDto {
  parentId: string | null;
}
