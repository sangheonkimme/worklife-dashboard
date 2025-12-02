import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { noteApi } from '@/services/api/noteApi';
import type { CreateNoteDto, UpdateNoteDto, NoteFilters } from '@/types/note';
import { notifications } from '@mantine/notifications';
import { getApiErrorMessage } from '@/utils/error';

// Query keys
export const noteKeys = {
  all: ['notes'] as const,
  lists: () => [...noteKeys.all, 'list'] as const,
  list: (filters?: NoteFilters) => [...noteKeys.lists(), filters] as const,
  details: () => [...noteKeys.all, 'detail'] as const,
  detail: (id: string) => [...noteKeys.details(), id] as const,
  trash: (page?: number, limit?: number) => [...noteKeys.all, 'trash', page, limit] as const,
};

// 메모 목록 조회 훅
export function useNotes(filters?: NoteFilters, enabled = true) {
  return useQuery({
    queryKey: noteKeys.list(filters),
    queryFn: () => noteApi.getNotes(filters),
    enabled,
  });
}

// 단일 메모 조회 훅
export function useNote(id: string, enabled = true) {
  return useQuery({
    queryKey: noteKeys.detail(id),
    queryFn: () => noteApi.getNoteById(id),
    enabled,
  });
}

// 휴지통 메모 목록 조회 훅
export function useTrashNotes(page = 1, limit = 20) {
  return useQuery({
    queryKey: noteKeys.trash(page, limit),
    queryFn: () => noteApi.getTrashNotes(page, limit),
  });
}

// 메모 생성 훅
export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateNoteDto) => noteApi.createNote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
      notifications.show({
        title: '성공',
        message: '메모가 생성되었습니다.',
        color: 'green',
      });
    },
    onError: (error: unknown) => {
      notifications.show({
        title: '오류',
        message: getApiErrorMessage(error, '메모 생성에 실패했습니다.'),
        color: 'red',
      });
    },
  });
}

// 메모 수정 훅
export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNoteDto }) => noteApi.updateNote(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
      queryClient.invalidateQueries({ queryKey: noteKeys.detail(variables.id) });
      notifications.show({
        title: '성공',
        message: '메모가 수정되었습니다.',
        color: 'green',
      });
    },
    onError: (error: unknown) => {
      notifications.show({
        title: '오류',
        message: getApiErrorMessage(error, '메모 수정에 실패했습니다.'),
        color: 'red',
      });
    },
  });
}

// 메모 삭제 훅 (소프트 삭제)
export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => noteApi.deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
      notifications.show({
        title: '성공',
        message: '메모가 휴지통으로 이동되었습니다.',
        color: 'green',
      });
    },
    onError: (error: unknown) => {
      notifications.show({
        title: '오류',
        message: getApiErrorMessage(error, '메모 삭제에 실패했습니다.'),
        color: 'red',
      });
    },
  });
}

// 메모 복구 훅
export function useRestoreNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => noteApi.restoreNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
      queryClient.invalidateQueries({ queryKey: noteKeys.all });
      notifications.show({
        title: '성공',
        message: '메모가 복구되었습니다.',
        color: 'green',
      });
    },
    onError: (error: unknown) => {
      notifications.show({
        title: '오류',
        message: getApiErrorMessage(error, '메모 복구에 실패했습니다.'),
        color: 'red',
      });
    },
  });
}

// 메모 영구 삭제 훅
export function usePermanentDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => noteApi.permanentDeleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.all });
      notifications.show({
        title: '성공',
        message: '메모가 영구적으로 삭제되었습니다.',
        color: 'green',
      });
    },
    onError: (error: unknown) => {
      notifications.show({
        title: '오류',
        message: getApiErrorMessage(error, '메모 영구 삭제에 실패했습니다.'),
        color: 'red',
      });
    },
  });
}

// 메모 고정 토글 훅
export function useTogglePinned() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, value }: { id: string; value: boolean }) => noteApi.togglePinned(id, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
    },
    onError: (error: unknown) => {
      notifications.show({
        title: '오류',
        message: getApiErrorMessage(error, '메모 고정에 실패했습니다.'),
        color: 'red',
      });
    },
  });
}

// 메모 즐겨찾기 토글 훅
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, value }: { id: string; value: boolean }) =>
      noteApi.toggleFavorite(id, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
    },
    onError: (error: unknown) => {
      notifications.show({
        title: '오류',
        message: getApiErrorMessage(error, '즐겨찾기 설정에 실패했습니다.'),
        color: 'red',
      });
    },
  });
}

// 메모 보관함 토글 훅
export function useToggleArchived() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, value }: { id: string; value: boolean }) =>
      noteApi.toggleArchived(id, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
    },
    onError: (error: unknown) => {
      notifications.show({
        title: '오류',
        message: getApiErrorMessage(error, '보관함 설정에 실패했습니다.'),
        color: 'red',
      });
    },
  });
}
