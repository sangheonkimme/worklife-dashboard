import type { Transaction } from './transaction';

// 메모 타입 enum
export type NoteType = 'TEXT' | 'CHECKLIST' | 'MARKDOWN' | 'QUICK';

// 공개 설정 enum
export type NoteVisibility = 'PRIVATE' | 'PUBLIC' | 'PROTECTED';

// 첨부파일 타입 enum
export type AttachmentType = 'IMAGE' | 'AUDIO' | 'FILE';

// 폴더 인터페이스
export interface Folder {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// 태그 인터페이스
export interface Tag {
  id: string;
  name: string;
  color?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// 체크리스트 항목 인터페이스
export interface ChecklistItem {
  id: string;
  content: string;
  isCompleted: boolean;
  order: number;
  noteId: string;
  createdAt: string;
  updatedAt: string;
}

// 첨부파일 인터페이스
export interface Attachment {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  type: AttachmentType;
  url: string;
  hash?: string;
  thumbnailUrl?: string;
  noteId: string;
  createdAt: string;
}

// 메모 템플릿 인터페이스
export interface NoteTemplate {
  id: string;
  name: string;
  description?: string;
  content: string;
  type: NoteType;
  isDefault: boolean;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

// 메모 인터페이스
export interface Note {
  id: string;
  title: string;
  content: string;
  type: NoteType;
  visibility: NoteVisibility;
  password?: string;
  isPinned: boolean;
  isFavorite: boolean;
  isArchived: boolean;
  deletedAt?: string;
  publishedUrl?: string;
  deviceRevision: number;
  folderId?: string;
  folder?: Folder;
  userId: string;
  createdAt: string;
  updatedAt: string;
  tags?: Tag[];
  checklistItems?: ChecklistItem[];
  attachments?: Attachment[];
  noteTransactions?: Array<{
    id: string;
    noteId: string;
    transactionId: string;
    transaction: Transaction;
    createdAt: string;
  }>;
}

// 메모 생성 DTO
export interface CreateNoteDto {
  title: string;
  content?: string;
  type?: NoteType;
  visibility?: NoteVisibility;
  password?: string;
  isPinned?: boolean;
  isFavorite?: boolean;
  isArchived?: boolean;
  folderId?: string;
  tagIds?: string[];
}

// 메모 수정 DTO
export interface UpdateNoteDto {
  title?: string;
  content?: string;
  type?: NoteType;
  visibility?: NoteVisibility;
  password?: string | null;
  isPinned?: boolean;
  isFavorite?: boolean;
  isArchived?: boolean;
  folderId?: string | null;
  tagIds?: string[];
}

// 메모 필터
export interface NoteFilters {
  page?: number;
  limit?: number;
  type?: NoteType;
  folderId?: string;
  tagId?: string;
  isPinned?: boolean;
  isFavorite?: boolean;
  isArchived?: boolean;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}

// 메모 목록 응답
export interface NoteListResponse {
  notes: Note[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 폴더 생성 DTO
export interface CreateFolderDto {
  name: string;
  color?: string;
  icon?: string;
}

// 폴더 수정 DTO
export interface UpdateFolderDto {
  name?: string;
  color?: string;
  icon?: string;
}

// 태그 생성 DTO
export interface CreateTagDto {
  name: string;
  color?: string;
}

// 태그 수정 DTO
export interface UpdateTagDto {
  name?: string;
  color?: string;
}
