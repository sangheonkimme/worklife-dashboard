import type { NoteType } from './note';

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

export interface CreateTemplateDto {
  name: string;
  description?: string;
  content: string;
  type?: NoteType;
}

export interface UpdateTemplateDto {
  name?: string;
  description?: string | null;
  content?: string;
  type?: NoteType;
}
