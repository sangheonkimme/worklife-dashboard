import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { templateApi } from '@/services/api/templateApi';
import type { CreateTemplateDto, UpdateTemplateDto } from '@/types/template';
import { notifications } from '@mantine/notifications';
import { getApiErrorMessage } from '@/utils/error';

export const useTemplates = () => {
  return useQuery({
    queryKey: ['templates'],
    queryFn: templateApi.getTemplates,
  });
};

export const useTemplate = (id: string) => {
  return useQuery({
    queryKey: ['templates', id],
    queryFn: () => templateApi.getTemplateById(id),
    enabled: !!id,
  });
};

export const useCreateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTemplateDto) => templateApi.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      notifications.show({
        title: '성공',
        message: '템플릿이 생성되었습니다',
        color: 'green',
      });
    },
    onError: (error: unknown) => {
      notifications.show({
        title: '오류',
        message: getApiErrorMessage(error, '템플릿 생성에 실패했습니다'),
        color: 'red',
      });
    },
  });
};

export const useUpdateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTemplateDto }) =>
      templateApi.updateTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      notifications.show({
        title: '성공',
        message: '템플릿이 수정되었습니다',
        color: 'green',
      });
    },
    onError: (error: unknown) => {
      notifications.show({
        title: '오류',
        message: getApiErrorMessage(error, '템플릿 수정에 실패했습니다'),
        color: 'red',
      });
    },
  });
};

export const useDeleteTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => templateApi.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      notifications.show({
        title: '성공',
        message: '템플릿이 삭제되었습니다',
        color: 'green',
      });
    },
    onError: (error: unknown) => {
      notifications.show({
        title: '오류',
        message: getApiErrorMessage(error, '템플릿 삭제에 실패했습니다'),
        color: 'red',
      });
    },
  });
};
