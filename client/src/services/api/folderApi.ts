import api from '@/lib/axios';
import type { ApiResponse } from '@/types';
import type { Folder, CreateFolderDto, UpdateFolderDto } from '@/types/folder';

export const folderApi = {
  /**
   * 폴더 목록 조회
   */
  getFolders: (): Promise<Folder[]> =>
    api.get<ApiResponse<Folder[]>>('/api/folders').then((res) => res.data.data),

  /**
   * 특정 폴더 조회
   */
  getFolderById: (id: string): Promise<Folder> =>
    api.get<ApiResponse<Folder>>(`/api/folders/${id}`).then((res) => res.data.data),

  /**
   * 폴더 생성
   */
  createFolder: (data: CreateFolderDto): Promise<Folder> =>
    api.post<ApiResponse<Folder>>('/api/folders', data).then((res) => res.data.data),

  /**
   * 폴더 수정
   */
  updateFolder: (id: string, data: UpdateFolderDto): Promise<Folder> =>
    api.put<ApiResponse<Folder>>(`/api/folders/${id}`, data).then((res) => res.data.data),

  /**
   * 폴더 이동
   */
  // 이동 기능은 1-depth 제한으로 비활성화

  /**
   * 폴더 삭제
   */
  deleteFolder: (id: string): Promise<void> => {
    return api.delete<ApiResponse<null>>(`/api/folders/${id}`).then(() => undefined);
  },
};
