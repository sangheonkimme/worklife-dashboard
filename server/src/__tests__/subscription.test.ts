import request from 'supertest';
import app from '../index';
import { prisma } from '../lib/prisma';
import { SubscriptionStatus } from '@prisma/client';

describe('Subscription API', () => {
  const testUser = {
    email: 'subscription-api-test@example.com',
    password: 'SubApi123!',
    name: 'Subscription API',
  };

  let accessToken: string;
  let subscriptionId: string;

  beforeAll(async () => {
    await prisma.subscription.deleteMany({
      where: { user: { email: testUser.email } },
    });
    await prisma.user.deleteMany({ where: { email: testUser.email } });

    const res = await request(app).post('/api/auth/register').send(testUser).expect(201);
    accessToken = res.body.data.accessToken;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testUser.email } });
    await prisma.$disconnect();
  });

  it('POST /api/subscriptions 생성', async () => {
    const payload = {
      name: 'Netflix',
      amount: 15000,
      billingCycle: 'MONTHLY',
      nextBillingDate: new Date().toISOString(),
      paymentMethod: 'card_1234',
      notifyDaysBefore: 3,
    };

    const res = await request(app)
      .post('/api/subscriptions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(payload)
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe(payload.name);
    expect(res.body.data.status).toBe(SubscriptionStatus.ACTIVE);
    subscriptionId = res.body.data.id;
  });

  it('GET /api/subscriptions 목록 필터', async () => {
    const res = await request(app)
      .get('/api/subscriptions?status=ACTIVE&limit=10')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('PATCH /api/subscriptions/:id 금액 업데이트', async () => {
    const res = await request(app)
      .patch(`/api/subscriptions/${subscriptionId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ amount: 20000 })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.amount).toBe('20000');
  });

  it('POST /api/subscriptions/:id/cancel 취소 처리', async () => {
    const res = await request(app)
      .post(`/api/subscriptions/${subscriptionId}/cancel`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ reason: '테스트 취소' })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe(SubscriptionStatus.CANCELLED);
  });
});
