import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tagApi } from '@/services/api/tagApi';
import type { CreateTagDto, UpdateTagDto } from '@/types/tag';
import { notifications } from '@mantine/notifications';
import { getApiErrorMessage } from '@/utils/error';

export const useTags = (includeCount: boolean = false) => {
  return useQuery({
    queryKey: ['tags', includeCount],
    queryFn: () => tagApi.getTags(includeCount),
  });
};

export const useTag = (id: string) => {
  return useQuery({
    queryKey: ['tags', id],
    queryFn: () => tagApi.getTagById(id),
    enabled: !!id,
  });
};

export const useCreateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTagDto) => tagApi.createTag(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      notifications.show({
        title: '성공',
        message: '태그가 생성되었습니다',
        color: 'green',
      });
    },
    onError: (error: unknown) => {
      notifications.show({
        title: '오류',
        message: getApiErrorMessage(error, '태그 생성에 실패했습니다'),
        color: 'red',
      });
    },
  });
};

export const useUpdateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTagDto }) => tagApi.updateTag(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      notifications.show({
        title: '성공',
        message: '태그가 수정되었습니다',
        color: 'green',
      });
    },
    onError: (error: unknown) => {
      notifications.show({
        title: '오류',
        message: getApiErrorMessage(error, '태그 수정에 실패했습니다'),
        color: 'red',
      });
    },
  });
};

export const useDeleteTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tagApi.deleteTag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      notifications.show({
        title: '성공',
        message: '태그가 삭제되었습니다',
        color: 'green',
      });
    },
    onError: (error: unknown) => {
      notifications.show({
        title: '오류',
        message: getApiErrorMessage(error, '태그 삭제에 실패했습니다'),
        color: 'red',
      });
    },
  });
};

export const useSuggestTags = (query: string, limit: number = 10) => {
  return useQuery({
    queryKey: ['tags', 'suggest', query, limit],
    queryFn: () => tagApi.suggestTags(query, limit),
    enabled: query.length > 0,
  });
};
