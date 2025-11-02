import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { noteTransactionApi } from '@/services/api/noteTransactionApi';
import { notifications } from '@mantine/notifications';

export const useTransactionsForNote = (noteId: string) => {
  return useQuery({
    queryKey: ['note-transactions', noteId],
    queryFn: () => noteTransactionApi.getTransactionsForNote(noteId),
    enabled: !!noteId,
  });
};

export const useNotesForTransaction = (transactionId: string) => {
  return useQuery({
    queryKey: ['transaction-notes', transactionId],
    queryFn: () => noteTransactionApi.getNotesForTransaction(transactionId),
    enabled: !!transactionId,
  });
};

export const useLinkTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noteId, transactionId }: { noteId: string; transactionId: string }) =>
      noteTransactionApi.linkTransaction(noteId, transactionId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['note-transactions', variables.noteId] });
      queryClient.invalidateQueries({ queryKey: ['transaction-notes', variables.transactionId] });
      notifications.show({
        title: '성공',
        message: '거래가 연결되었습니다',
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: '오류',
        message: error.response?.data?.message || '거래 연결에 실패했습니다',
        color: 'red',
      });
    },
  });
};

export const useUnlinkTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noteId, transactionId }: { noteId: string; transactionId: string }) =>
      noteTransactionApi.unlinkTransaction(noteId, transactionId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['note-transactions', variables.noteId] });
      queryClient.invalidateQueries({ queryKey: ['transaction-notes', variables.transactionId] });
      notifications.show({
        title: '성공',
        message: '거래 연결이 해제되었습니다',
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: '오류',
        message: error.response?.data?.message || '거래 연결 해제에 실패했습니다',
        color: 'red',
      });
    },
  });
};
