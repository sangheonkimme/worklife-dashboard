import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { checklistApi } from '@/services/api/checklistApi';
import type {
  CreateChecklistItemDto,
  UpdateChecklistItemDto,
  ReorderChecklistItemDto,
} from '@/types/checklist';
import { notifications } from '@mantine/notifications';

export const useChecklistItems = (noteId: string) => {
  return useQuery({
    queryKey: ['checklist', noteId],
    queryFn: () => checklistApi.getItems(noteId),
    enabled: !!noteId,
  });
};

export const useChecklistProgress = (noteId: string) => {
  return useQuery({
    queryKey: ['checklist', noteId, 'progress'],
    queryFn: () => checklistApi.getProgress(noteId),
    enabled: !!noteId,
  });
};

export const useCreateChecklistItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noteId, data }: { noteId: string; data: CreateChecklistItemDto }) =>
      checklistApi.createItem(noteId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['checklist', variables.noteId] });
      queryClient.invalidateQueries({ queryKey: ['checklist', variables.noteId, 'progress'] });
      notifications.show({
        title: '성공',
        message: '체크리스트 항목이 추가되었습니다',
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: '오류',
        message: error.response?.data?.message || '체크리스트 항목 추가에 실패했습니다',
        color: 'red',
      });
    },
  });
};

export const useUpdateChecklistItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateChecklistItemDto }) =>
      checklistApi.updateItem(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['checklist', data.noteId] });
      queryClient.invalidateQueries({ queryKey: ['checklist', data.noteId, 'progress'] });
    },
    onError: (error: any) => {
      notifications.show({
        title: '오류',
        message: error.response?.data?.message || '체크리스트 항목 수정에 실패했습니다',
        color: 'red',
      });
    },
  });
};

export const useToggleChecklistItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isCompleted }: { id: string; isCompleted: boolean }) =>
      checklistApi.toggleItem(id, isCompleted),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['checklist', data.noteId] });
      queryClient.invalidateQueries({ queryKey: ['checklist', data.noteId, 'progress'] });
    },
    onError: (error: any) => {
      notifications.show({
        title: '오류',
        message: error.response?.data?.message || '체크리스트 항목 토글에 실패했습니다',
        color: 'red',
      });
    },
  });
};

export const useDeleteChecklistItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; noteId: string }) =>
      checklistApi.deleteItem(id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['checklist', variables.noteId] });
      queryClient.invalidateQueries({ queryKey: ['checklist', variables.noteId, 'progress'] });
      notifications.show({
        title: '성공',
        message: '체크리스트 항목이 삭제되었습니다',
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: '오류',
        message: error.response?.data?.message || '체크리스트 항목 삭제에 실패했습니다',
        color: 'red',
      });
    },
  });
};

export const useReorderChecklistItems = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noteId, items }: { noteId: string; items: ReorderChecklistItemDto[] }) =>
      checklistApi.reorderItems(noteId, items),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['checklist', variables.noteId] });
    },
    onError: (error: any) => {
      notifications.show({
        title: '오류',
        message: error.response?.data?.message || '체크리스트 순서 변경에 실패했습니다',
        color: 'red',
      });
    },
  });
};
