import type { NoteType } from './note';
import type { Folder } from './folder';

export interface SearchOptions {
  q: string;
  type?: NoteType;
  folderId?: string;
  dateFrom?: string;
  dateTo?: string;
  isPinned?: boolean;
  isFavorite?: boolean;
  isArchived?: boolean;
  page?: number;
  limit?: number;
}

export interface SearchSuggestions {
  folders: Folder[];
  notes: Array<{
    id: string;
    title: string;
    type: NoteType;
  }>;
}
