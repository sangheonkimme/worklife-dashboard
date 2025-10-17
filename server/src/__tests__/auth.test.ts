import request from 'supertest';
import app from '../index';
import { prisma } from '../lib/prisma';

describe('인증 API 테스트', () => {
  // 테스트용 사용자 데이터
  const testUser = {
    email: 'test@example.com',
    password: 'Test1234!',
    name: 'Test User',
  };

  let accessToken: string;
  let userId: string;

  // 모든 테스트 전에 테스트 데이터 정리
  beforeAll(async () => {
    await prisma.user.deleteMany({
      where: { email: testUser.email },
    });
  });

  // 모든 테스트 후 정리
  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: testUser.email },
    });
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('유효한 데이터로 회원가입 성공', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('회원가입이 완료되었습니다');
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user.name).toBe(testUser.name);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data.user).not.toHaveProperty('password');

      // 나중에 사용할 userId 저장
      userId = response.body.data.user.id;
      accessToken = response.body.data.accessToken;
    });

    it('중복된 이메일로 회원가입 실패', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('이미 사용 중인 이메일입니다');
    });

    it('잘못된 이메일 형식으로 회원가입 실패', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'Test1234!',
          name: 'Test',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('입력 데이터가 올바르지 않습니다');
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'body.email',
            message: '올바른 이메일 형식이 아닙니다',
          }),
        ])
      );
    });

    it('약한 비밀번호로 회원가입 실패', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test2@example.com',
          password: 'weak',
          name: 'Test',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'body.password',
          }),
        ])
      );
    });

    it('필수 필드 누락으로 회원가입 실패', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test3@example.com',
          // password와 name 누락
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('입력 데이터가 올바르지 않습니다');
    });
  });

  describe('POST /api/auth/login', () => {
    it('유효한 자격증명으로 로그인 성공', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('로그인이 완료되었습니다');
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data.user).not.toHaveProperty('password');

      // 나중에 사용할 토큰 저장
      accessToken = response.body.data.accessToken;
    });

    it('존재하지 않는 이메일로 로그인 실패', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Test1234!',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('이메일 또는 비밀번호가 올바르지 않습니다');
    });

    it('잘못된 비밀번호로 로그인 실패', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('이메일 또는 비밀번호가 올바르지 않습니다');
    });

    it('필수 필드 누락으로 로그인 실패', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          // password 누락
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    it('유효한 토큰으로 사용자 정보 조회 성공', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(userId);
      expect(response.body.data.email).toBe(testUser.email);
      expect(response.body.data.name).toBe(testUser.name);
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('토큰 없이 사용자 정보 조회 실패', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('인증 토큰이 필요합니다');
    });

    it('잘못된 토큰으로 사용자 정보 조회 실패', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('유효하지 않은 토큰입니다');
    });

    it('Bearer 없이 토큰 전송 시 실패', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', accessToken)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('인증 토큰이 필요합니다');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('로그아웃 성공', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('로그아웃이 완료되었습니다');
    });
  });

  describe('헬스 체크', () => {
    it('GET /health - 서버 상태 확인', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('404 핸들러', () => {
    it('존재하지 않는 라우트 접근 시 404 반환', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.statusCode).toBe(404);
      expect(response.body.message).toContain('not found');
    });
  });
});
