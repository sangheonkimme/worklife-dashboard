import api from '@/lib/axios';
import type {
  Subscription,
  SubscriptionSummary,
  SubscriptionFilters,
  SubscriptionListResponse,
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
} from '@/types/subscription';

export const subscriptionApi = {
  getSummary: () =>
    api.get<{ success: boolean; data: SubscriptionSummary }>('/api/subscriptions/summary').then((res) => res.data.data),

  list: (filters?: SubscriptionFilters) =>
    api
      .get<{ success: boolean; data: Subscription[]; pagination: SubscriptionListResponse['pagination'] }>(
        '/api/subscriptions',
        { params: filters }
      )
      .then((res) => ({
        data: res.data.data,
        pagination: res.data.pagination,
      })),

  create: (payload: CreateSubscriptionDto) =>
    api.post<{ success: boolean; data: Subscription }>('/api/subscriptions', payload).then((res) => res.data.data),

  update: (id: string, payload: UpdateSubscriptionDto) =>
    api.patch<{ success: boolean; data: Subscription }>(`/api/subscriptions/${id}`, payload).then((res) => res.data.data),

  cancel: (id: string, reason?: string) =>
    api
      .post<{ success: boolean; data: Subscription }>(`/api/subscriptions/${id}/cancel`, { reason })
      .then((res) => res.data.data),
};
