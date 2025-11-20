import api from '@/lib/axios';
import type { Tag, CreateTagDto, UpdateTagDto } from '@/types/tag';

export const tagApi = {
  /**
   * 태그 목록 조회
   */
  getTags: (includeCount: boolean = false): Promise<Tag[]> => {
    return api
      .get('/api/tags', {
        params: { includeCount },
      })
      .then((res) => res.data);
  },

  /**
   * 특정 태그 조회
   */
  getTagById: (id: string): Promise<Tag> => {
    return api.get(`/api/tags/${id}`).then((res) => res.data);
  },

  /**
   * 태그 생성
   */
  createTag: (data: CreateTagDto): Promise<Tag> => {
    return api.post('/api/tags', data).then((res) => res.data);
  },

  /**
   * 태그 수정
   */
  updateTag: (id: string, data: UpdateTagDto): Promise<Tag> => {
    return api.put(`/api/tags/${id}`, data).then((res) => res.data);
  },

  /**
   * 태그 삭제
   */
  deleteTag: (id: string): Promise<void> => {
    return api.delete(`/api/tags/${id}`).then((res) => res.data);
  },

  /**
   * 태그 자동완성
   */
  suggestTags: (query: string, limit: number = 10): Promise<Tag[]> => {
    return api
      .get('/api/tags/suggest', {
        params: { q: query, limit },
      })
      .then((res) => res.data);
  },
};
