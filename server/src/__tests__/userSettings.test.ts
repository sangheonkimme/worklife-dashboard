import request from 'supertest';
import app from '../index';
import { prisma } from '../lib/prisma';

describe('사용자 설정 API', () => {
  const testUser = {
    email: 'user-settings-test@example.com',
    password: 'Settings123!',
    name: 'Settings User',
  };

  let accessToken: string;

  beforeAll(async () => {
    await prisma.user.deleteMany({ where: { email: testUser.email } });

    const response = await request(app)
      .post('/api/auth/register')
      .send(testUser)
      .expect(201);

    accessToken = response.body.data.accessToken;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testUser.email } });
    await prisma.$disconnect();
  });

  it('GET /api/user-settings 기본값 조회', async () => {
    const response = await request(app)
      .get('/api/user-settings')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.finance.payday).toBe(1);
    expect(response.body.data.timers.presets).toBeInstanceOf(Array);
  });

  it('PUT /api/user-settings 설정 업데이트', async () => {
    const payload = {
      finance: { payday: 25 },
      timers: { presets: [600000, 900000] },
      stopwatch: { defaultGoalTime: 120000, notificationsEnabled: false },
    };

    const response = await request(app)
      .put('/api/user-settings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(payload)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.finance.payday).toBe(25);
    expect(response.body.data.timers.presets[0]).toBe(600000);
    expect(response.body.data.stopwatch.notificationsEnabled).toBe(false);

    const verify = await request(app)
      .get('/api/user-settings')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(verify.body.data.finance.payday).toBe(25);
  });

  it('PUT /api/user-settings 검증 실패', async () => {
    const response = await request(app)
      .put('/api/user-settings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ finance: { payday: 40 } })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('입력 데이터가 올바르지 않습니다');
  });

  it('인증 없이 접근 시 401', async () => {
    await request(app).get('/api/user-settings').expect(401);
  });
});
