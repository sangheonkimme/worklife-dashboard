import request from 'supertest';
import app from '../index';
import { prisma } from '../lib/prisma';
import { CategoryType, SpendingType, TransactionSource } from '@prisma/client';

describe('Subscription Summary API', () => {
  const testUser = {
    email: 'subscription-summary@example.com',
    password: 'Summary123!',
    name: 'Subscription Summary',
  };

  let accessToken: string;
  let userId: string;
  let categoryId: string;

  beforeAll(async () => {
    await prisma.user.deleteMany({ where: { email: testUser.email } });

    const res = await request(app).post('/api/auth/register').send(testUser).expect(201);
    accessToken = res.body.data.accessToken;
    userId = res.body.data.user.id;

    const category = await prisma.category.create({
      data: {
        name: 'Subscriptions',
        type: CategoryType.EXPENSE,
        userId,
      },
    });
    categoryId = category.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testUser.email } });
    await prisma.$disconnect();
  });

  it('returns summary with upcoming subscriptions and fixed/variable ratio', async () => {
    const nextBillingDate = new Date();
    nextBillingDate.setDate(nextBillingDate.getDate() + 3);

    await request(app)
      .post('/api/subscriptions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Disney+',
        amount: 12000,
        billingCycle: 'MONTHLY',
        nextBillingDate: nextBillingDate.toISOString(),
        category: 'Entertainment',
      })
      .expect(201);

    // Add fixed/variable spending samples for ratio
    await prisma.transaction.create({
      data: {
        amount: 12000,
        date: new Date(),
        type: CategoryType.EXPENSE,
        spendingType: SpendingType.FIXED,
        source: TransactionSource.SUBSCRIPTION,
        categoryId,
        userId,
      },
    });

    await prisma.transaction.create({
      data: {
        amount: 8000,
        date: new Date(),
        type: CategoryType.EXPENSE,
        spendingType: SpendingType.VARIABLE,
        source: TransactionSource.MANUAL,
        categoryId,
        userId,
      },
    });

    const res = await request(app)
      .get('/api/subscriptions/summary')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    const data = res.body.data;
    expect(data.monthlyFixedTotal).toBeGreaterThan(0);
    expect(data.upcomingMonthTotal).toBeGreaterThan(0);
    expect(data.next7Days.length).toBeGreaterThanOrEqual(1);
    expect(data.fixedVsVariableRatio.fixed).toBe(12000);
    expect(data.fixedVsVariableRatio.variable).toBe(8000);
    expect(data.fixedVsVariableRatio.fixedRatio).toBeCloseTo(12000 / (12000 + 8000));
  });
});
