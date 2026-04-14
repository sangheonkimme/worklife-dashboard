import api from '@/lib/axios';
import type { ApiResponse } from '@/types';
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
    api
      .get<ApiResponse<SubscriptionSummary>>('/api/subscriptions/summary')
      .then((res) => res.data.data),

  list: (filters?: SubscriptionFilters) =>
    api
      .get<ApiResponse<SubscriptionListResponse>>('/api/subscriptions', { params: filters })
      .then((res) => res.data.data),

  create: (payload: CreateSubscriptionDto) =>
    api
      .post<ApiResponse<Subscription>>('/api/subscriptions', payload)
      .then((res) => res.data.data),

  update: (id: string, payload: UpdateSubscriptionDto) =>
    api
      .patch<ApiResponse<Subscription>>(`/api/subscriptions/${id}`, payload)
      .then((res) => res.data.data),

  cancel: (id: string, reason?: string) =>
    api
      .post<ApiResponse<Subscription>>(`/api/subscriptions/${id}/cancel`, { reason })
      .then((res) => res.data.data),
};
