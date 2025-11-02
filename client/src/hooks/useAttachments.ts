import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attachmentApi } from '@/services/api/attachmentApi';
import { notifications } from '@mantine/notifications';

export const useAttachments = (noteId: string) => {
  return useQuery({
    queryKey: ['attachments', noteId],
    queryFn: () => attachmentApi.getAttachments(noteId),
    enabled: !!noteId,
  });
};

export const useUploadFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noteId, file }: { noteId: string; file: File }) =>
      attachmentApi.uploadFile(noteId, file),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['attachments', data.noteId] });
      notifications.show({
        title: '성공',
        message: '파일이 업로드되었습니다',
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: '오류',
        message: error.response?.data?.message || '파일 업로드에 실패했습니다',
        color: 'red',
      });
    },
  });
};

export const useUploadMultipleFiles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noteId, files }: { noteId: string; files: File[] }) =>
      attachmentApi.uploadMultipleFiles(noteId, files),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['attachments', variables.noteId] });
      notifications.show({
        title: '성공',
        message: `${variables.files.length}개의 파일이 업로드되었습니다`,
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: '오류',
        message: error.response?.data?.message || '파일 업로드에 실패했습니다',
        color: 'red',
      });
    },
  });
};

export const useDeleteAttachment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; noteId: string }) =>
      attachmentApi.deleteAttachment(id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['attachments', variables.noteId] });
      notifications.show({
        title: '성공',
        message: '첨부파일이 삭제되었습니다',
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: '오류',
        message: error.response?.data?.message || '첨부파일 삭제에 실패했습니다',
        color: 'red',
      });
    },
  });
};
