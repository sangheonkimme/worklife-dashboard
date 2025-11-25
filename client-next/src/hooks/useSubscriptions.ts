import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionApi } from '@/services/api/subscriptionApi';
import type {
  SubscriptionFilters,
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
} from '@/types/subscription';
import { notifications } from '@mantine/notifications';
import { getApiErrorMessage } from '@/utils/error';

export const subscriptionKeys = {
  all: ['subscriptions'] as const,
  list: (filters?: SubscriptionFilters) => [...subscriptionKeys.all, 'list', filters] as const,
  summary: () => [...subscriptionKeys.all, 'summary'] as const,
};

export function useSubscriptionSummary() {
  return useQuery({
    queryKey: subscriptionKeys.summary(),
    queryFn: subscriptionApi.getSummary,
  });
}

export function useSubscriptions(filters?: SubscriptionFilters) {
  return useQuery({
    queryKey: subscriptionKeys.list(filters),
    queryFn: () => subscriptionApi.list(filters),
  });
}

export function useCreateSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSubscriptionDto) => subscriptionApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
      notifications.show({
        title: '정기구독 추가',
        message: '정기구독이 등록되었습니다.',
        color: 'green',
      });
    },
    onError: (error: unknown) => {
      notifications.show({
        title: '정기구독 추가 실패',
        message: getApiErrorMessage(error, '정기구독 등록에 실패했습니다.'),
        color: 'red',
      });
    },
  });
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSubscriptionDto }) =>
      subscriptionApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
      notifications.show({
        title: '정기구독 수정',
        message: '정기구독 정보가 업데이트되었습니다.',
        color: 'green',
      });
    },
    onError: (error: unknown) => {
      notifications.show({
        title: '정기구독 수정 실패',
        message: getApiErrorMessage(error, '정기구독 수정에 실패했습니다.'),
        color: 'red',
      });
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => subscriptionApi.cancel(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
      notifications.show({
        title: '정기구독 취소',
        message: '취소 상태로 변경되었습니다.',
        color: 'green',
      });
    },
    onError: (error: unknown) => {
      notifications.show({
        title: '정기구독 취소 실패',
        message: getApiErrorMessage(error, '정기구독 취소에 실패했습니다.'),
        color: 'red',
      });
    },
  });
}
