export type AttachmentType = 'IMAGE' | 'AUDIO' | 'FILE';

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
