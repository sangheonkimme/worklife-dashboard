import api from '@/lib/axios';
import type { Folder, CreateFolderDto, UpdateFolderDto } from '@/types/folder';

export const folderApi = {
  /**
   * 폴더 목록 조회
   */
  getFolders: (): Promise<Folder[]> => {
    return api.get('/api/folders').then((res) => res.data);
  },

  /**
   * 특정 폴더 조회
   */
  getFolderById: (id: string): Promise<Folder> => {
    return api.get(`/api/folders/${id}`).then((res) => res.data);
  },

  /**
   * 폴더 생성
   */
  createFolder: (data: CreateFolderDto): Promise<Folder> => {
    return api.post('/api/folders', data).then((res) => res.data);
  },

  /**
   * 폴더 수정
   */
  updateFolder: (id: string, data: UpdateFolderDto): Promise<Folder> => {
    return api.put(`/api/folders/${id}`, data).then((res) => res.data);
  },

  /**
   * 폴더 이동
   */
  // 이동 기능은 1-depth 제한으로 비활성화

  /**
   * 폴더 삭제
   */
  deleteFolder: (id: string): Promise<void> => {
    return api.delete(`/api/folders/${id}`).then((res) => res.data);
  },
};
