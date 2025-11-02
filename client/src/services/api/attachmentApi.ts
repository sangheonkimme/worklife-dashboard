import api from '@/lib/axios';
import type { Attachment } from '@/types/attachment';

export const attachmentApi = {
  // 첨부파일 목록 조회
  getAttachments: (noteId: string) =>
    api.get<Attachment[]>(`/api/notes/${noteId}/attachments`).then((res) => res.data),

  // 단일 파일 업로드
  uploadFile: (noteId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    return api.post<Attachment>(`/api/notes/${noteId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then((res) => res.data);
  },

  // 여러 파일 업로드
  uploadMultipleFiles: (noteId: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    return api.post<Attachment[]>(`/api/notes/${noteId}/attachments/multiple`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then((res) => res.data);
  },

  // 첨부파일 삭제
  deleteAttachment: (id: string) =>
    api.delete(`/api/attachments/${id}`).then((res) => res.data),
};
