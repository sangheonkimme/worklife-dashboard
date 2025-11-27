export type BillingCycle = 'WEEKLY' | 'MONTHLY' | 'YEARLY';
export type SubscriptionStatus = 'ACTIVE' | 'PAUSED' | 'CANCELLED';

export interface Subscription {
  id: string;
  userId: string;
  name: string;
  amount: number | string;
  currency: string;
  billingCycle: BillingCycle;
  nextBillingDate: string;
  paymentMethod?: string | null;
  category?: string | null;
  status: SubscriptionStatus;
  trialEndDate?: string | null;
  notifyDaysBefore?: number | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionSummary {
  monthlyFixedTotal: number;
  upcomingMonthTotal: number;
  next7Days: Array<{
    id: string;
    name: string;
    amount: number;
    billingCycle: BillingCycle;
    nextBillingDate: string;
    status: SubscriptionStatus;
    category?: string | null;
    paymentMethod?: string | null;
  }>;
  categoryShare: Record<string, number>;
  fixedVsVariableRatio: {
    fixed: number;
    variable: number;
    fixedRatio: number;
  };
}

export interface SubscriptionListResponse {
  data: Subscription[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SubscriptionFilters {
  status?: SubscriptionStatus;
  category?: string;
  paymentMethod?: string;
  search?: string;
  sort?: 'nextBillingDate' | 'amount' | 'createdAt';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CreateSubscriptionDto {
  name: string;
  amount: number;
  currency?: string;
  billingCycle: BillingCycle;
  nextBillingDate: string;
  paymentMethod?: string;
  category?: string;
  status?: SubscriptionStatus;
  trialEndDate?: string;
  notifyDaysBefore?: number;
  notes?: string;
}

export type UpdateSubscriptionDto = Partial<CreateSubscriptionDto>;
