import { CategoryType } from '@prisma/client';
import { subscriptionService } from '../services/subscriptionService';
import { prisma } from '../lib/prisma';

describe('Subscription billing → transaction mapping', () => {
  const testUser = {
    email: 'subscription-billing@example.com',
    password: 'Billing123!',
    name: 'Subscription Billing',
  };

  let userId: string;
  let categoryId: string;
  let subscriptionId: string;

  beforeAll(async () => {
    await prisma.user.deleteMany({ where: { email: testUser.email } });

    const user = await prisma.user.create({
      data: { email: testUser.email, password: null, name: testUser.name },
    });
    userId = user.id;

    const category = await prisma.category.create({
      data: { name: 'Subscriptions', type: CategoryType.EXPENSE, userId },
    });
    categoryId = category.id;

    const subscription = await prisma.subscription.create({
      data: {
        userId,
        name: 'Prime Video',
        amount: 9900,
        billingCycle: 'MONTHLY',
        nextBillingDate: new Date(),
        status: 'ACTIVE',
      },
    });
    subscriptionId = subscription.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testUser.email } });
    await prisma.$disconnect();
  });

  it('creates idempotent transaction for a billing date', async () => {
    const billingDate = new Date().toISOString();

    const first = await subscriptionService.recordBillingTransaction(userId, subscriptionId, billingDate, categoryId);
    const second = await subscriptionService.recordBillingTransaction(userId, subscriptionId, billingDate, categoryId);

    expect(first.id).toBe(second.id);
    expect(first.externalId).toContain(subscriptionId);
  });
});
