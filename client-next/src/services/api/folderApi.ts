import api from '@/lib/axios';
import type { Folder, CreateFolderDto, UpdateFolderDto, MoveFolderDto } from '@/types/folder';

export const folderApi = {
  /**
   * 폴더 목록 조회
   */
  getFolders: (includeChildren: boolean = true): Promise<Folder[]> => {
    return api
      .get('/api/folders', {
        params: { includeChildren },
      })
      .then((res) => res.data);
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
  moveFolder: (id: string, data: MoveFolderDto): Promise<Folder> => {
    return api.post(`/api/folders/${id}/move`, data).then((res) => res.data);
  },

  /**
   * 폴더 삭제
   */
  deleteFolder: (id: string): Promise<void> => {
    return api.delete(`/api/folders/${id}`).then((res) => res.data);
  },
};
