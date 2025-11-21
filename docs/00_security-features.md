# 보안 기능 (Security Features)

## 개요

WorkLife Dashboard는 사용자 데이터와 인증 정보를 보호하기 위해 여러 보안 메커니즘을 구현하고 있습니다. 이 문서는 애플리케이션에 적용된 보안 기능들을 상세히 설명합니다.

---

## 1. 인증 보안

### 1.1 JWT (JSON Web Token)

#### 액세스 토큰 (Access Token)
- **목적**: API 요청 인증
- **저장 위치**: localStorage
- **유효 기간**: 1시간
- **내용**:
  ```json
  {
    "userId": "cmgutbfp500009kiqi0fuaiz6",
    "email": "user@example.com",
    "iat": 1760703355,
    "exp": 1760706955
  }
  ```

#### 리프레시 토큰 (Refresh Token)
- **목적**: 액세스 토큰 갱신
- **저장 위치**: HttpOnly 쿠키
- **유효 기간**: 7일
- **보안 속성**:
  ```typescript
  {
    httpOnly: true,           // JavaScript로 접근 불가 (XSS 방어)
    secure: true,             // HTTPS만 전송 (프로덕션)
    sameSite: 'strict',       // CSRF 공격 방어
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
  ```

#### 토큰 생성
```typescript
// server/src/utils/jwt.ts
import jwt from 'jsonwebtoken';

export const generateAccessToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });
};

export const generateRefreshToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
};
```

#### 토큰 검증
```typescript
export const verifyAccessToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('토큰이 만료되었습니다');
    }
    throw new Error('유효하지 않은 토큰입니다');
  }
};
```

### 1.2 자동 토큰 갱신

#### 클라이언트 측 구현
```typescript
// client/src/lib/axios.ts
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 에러이고 재시도하지 않은 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // 리프레시 토큰으로 새 액세스 토큰 요청
        const response = await axios.post(
          `${API_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);

        // 원래 요청에 새 토큰 추가 후 재시도
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // 리프레시 토큰도 만료된 경우 로그아웃
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

**장점**:
- 사용자가 로그인 상태를 유지하면서도 짧은 액세스 토큰으로 보안 강화
- 토큰 만료 시 자동으로 갱신되어 사용자 경험 개선
- 리프레시 토큰도 만료 시 자동 로그아웃

---

## 2. 비밀번호 보안

### 2.1 비밀번호 요구사항

#### 클라이언트 측 검증
```typescript
// client/src/pages/SignupPage.tsx
validate: {
  password: (value: string) => {
    if (value.length < 8) return '비밀번호는 최소 8자 이상이어야 합니다';
    if (!/[A-Z]/.test(value)) return '대문자를 하나 이상 포함해야 합니다';
    if (!/[a-z]/.test(value)) return '소문자를 하나 이상 포함해야 합니다';
    if (!/[0-9]/.test(value)) return '숫자를 하나 이상 포함해야 합니다';
    return null;
  }
}
```

#### 서버 측 검증
```typescript
// server/src/validators/authValidator.ts
password: z.string()
  .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
  .regex(/[A-Z]/, '대문자를 하나 이상 포함해야 합니다')
  .regex(/[a-z]/, '소문자를 하나 이상 포함해야 합니다')
  .regex(/[0-9]/, '숫자를 하나 이상 포함해야 합니다'),
```

**요구사항**:
- 최소 8자 이상
- 대문자 1개 이상
- 소문자 1개 이상
- 숫자 1개 이상
- 특수문자 권장

### 2.2 비밀번호 해싱 (Bcrypt)

#### 해싱 과정
```typescript
// server/src/utils/password.ts
import bcrypt from 'bcrypt';

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};
```

**보안 특징**:
- Salt Rounds: 10 (2^10 = 1024번 해싱)
- 각 비밀번호마다 고유한 salt 자동 생성
- Rainbow table 공격 방어
- 역산 불가능한 단방향 해싱

#### 비밀번호 검증
```typescript
export const comparePassword = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(plainPassword, hashedPassword);
};
```

### 2.3 비밀번호 강도 표시기

```typescript
// client/src/pages/SignupPage.tsx
function getPasswordStrength(password: string) {
  let strength = 0;

  if (password.length >= 8) strength += 20;
  if (password.length >= 12) strength += 10;
  if (/[a-z]/.test(password)) strength += 20;
  if (/[A-Z]/.test(password)) strength += 20;
  if (/[0-9]/.test(password)) strength += 15;
  if (/[^A-Za-z0-9]/.test(password)) strength += 15;

  // strength: 0-100
  // 0-49: 약함 (빨강)
  // 50-69: 보통 (노랑)
  // 70-100: 강함 (초록)

  return { strength, color, label };
}
```

**시각적 피드백**:
- Progress 바로 강도 표시
- 색상으로 강도 구분 (빨강/노랑/초록)
- 요구사항 체크리스트 실시간 업데이트

---

## 3. XSS (Cross-Site Scripting) 방어

### 3.1 HttpOnly 쿠키

리프레시 토큰을 HttpOnly 쿠키에 저장하여 JavaScript로 접근 불가:

```typescript
res.cookie('refreshToken', refreshToken, {
  httpOnly: true,  // JavaScript 접근 차단
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
```

**방어 효과**:
- XSS 공격으로 토큰 탈취 불가
- `document.cookie`로 읽을 수 없음
- 서버와의 HTTP 요청에만 자동 포함

### 3.2 Content Security Policy (CSP)

```typescript
// server/src/index.ts
import helmet from 'helmet';

app.use(helmet());
```

Helmet 미들웨어가 자동으로 설정하는 보안 헤더:
- `Content-Security-Policy`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

### 3.3 입력 검증 및 이스케이핑

#### Zod를 통한 입력 검증
```typescript
// server/src/validators/authValidator.ts
export const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(1).max(100),
  }),
});
```

#### React의 자동 이스케이핑
React는 JSX에서 자동으로 문자열을 이스케이프:
```tsx
// 자동으로 안전하게 렌더링
<Text>{user.name}</Text>
```

---

## 4. CSRF (Cross-Site Request Forgery) 방어

### 4.1 SameSite 쿠키

```typescript
sameSite: 'strict'
```

**동작**:
- 같은 사이트에서만 쿠키 전송
- 다른 도메인에서의 요청에는 쿠키 미포함
- CSRF 공격 원천 차단

### 4.2 CORS 설정

```typescript
// server/src/index.ts
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
```

**보안 효과**:
- 허용된 도메인에서만 API 접근 가능
- credentials: true로 쿠키 전송 허용
- 다른 도메인의 무단 접근 차단

---

## 5. SQL Injection 방어

### 5.1 Prisma ORM

Prisma는 자동으로 쿼리를 파라미터화하여 SQL Injection 방어:

```typescript
// 안전한 쿼리
const user = await prisma.user.findUnique({
  where: { email: userInput }  // 자동으로 이스케이프됨
});
```

**방어 메커니즘**:
- Prepared Statements 자동 사용
- 사용자 입력이 SQL 코드로 실행되지 않음
- 쿼리와 데이터 분리

---

## 6. Rate Limiting

### 6.1 글로벌 Rate Limiter

```typescript
// server/src/middlewares/rateLimiter.ts
import rateLimit from 'express-rate-limit';

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // IP당 최대 100개 요청
  message: '너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.',
  standardHeaders: true,
  legacyHeaders: false,
});
```

### 6.2 인증 엔드포인트 특별 제한

```typescript
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 5, // IP당 최대 5번의 로그인/회원가입 시도
  message: '로그인 시도 횟수를 초과했습니다. 15분 후 다시 시도해주세요.',
  skipSuccessfulRequests: true, // 성공한 요청은 카운트하지 않음
});
```

**적용**:
```typescript
router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
```

**방어 효과**:
- Brute Force 공격 방어
- DDoS 공격 완화
- 서버 리소스 보호

---

## 7. 입력 검증

### 7.1 클라이언트 측 검증

#### Mantine Form
```typescript
// client/src/pages/LoginPage.tsx
const form = useForm({
  initialValues: {
    email: '',
    password: '',
  },
  validate: {
    email: (value) => {
      if (!value) return '이메일을 입력해주세요';
      if (!/^\S+@\S+$/.test(value)) return '올바른 이메일 형식이 아닙니다';
      return null;
    },
    password: (value) => {
      if (!value) return '비밀번호를 입력해주세요';
      if (value.length < 6) return '비밀번호는 최소 6자 이상이어야 합니다';
      return null;
    },
  },
});
```

### 7.2 서버 측 검증

#### Zod 스키마
```typescript
// server/src/validators/authValidator.ts
import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z.string()
      .email('올바른 이메일 형식이 아닙니다')
      .min(1, '이메일을 입력해주세요'),
    password: z.string()
      .min(1, '비밀번호를 입력해주세요'),
  }),
});
```

#### 검증 미들웨어
```typescript
// server/src/middlewares/validate.ts
export const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));

        res.status(400).json({
          success: false,
          message: '입력 데이터가 올바르지 않습니다',
          errors,
        });
        return;
      }
      next(error);
    }
  };
};
```

**이중 검증의 이점**:
- 클라이언트: 빠른 피드백, UX 개선
- 서버: 보안 강화, 우회 공격 방어

---

## 8. HTTPS (프로덕션)

### 8.1 SSL/TLS 인증서

프로덕션 환경에서는 반드시 HTTPS 사용:
- Let's Encrypt 무료 SSL 인증서
- Cloudflare SSL
- 또는 호스팅 제공업체의 SSL

### 8.2 Secure 쿠키

```typescript
res.cookie('refreshToken', refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // HTTPS에서만 전송
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
```

---

## 9. 에러 처리

### 9.1 최소 정보 노출

#### 에러 응답 표준화
```typescript
// server/src/middlewares/errorHandler.ts
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  const response = {
    status: 'error',
    statusCode,
    message,
  };

  // 개발 환경에서만 스택 트레이스 포함
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};
```

**보안 고려사항**:
- 프로덕션에서는 상세 에러 정보 숨김
- 스택 트레이스 노출 방지
- 일반적인 에러 메시지 제공

### 9.2 로그인 에러 처리

```typescript
// 이메일 또는 비밀번호가 틀린 경우
res.status(401).json({
  success: false,
  message: '이메일 또는 비밀번호가 올바르지 않습니다',
});
```

**이유**: 어느 것이 틀렸는지 명시하지 않아 계정 열거(Account Enumeration) 공격 방어

---

## 10. 환경 변수 보안

### 10.1 .env 파일 관리

```bash
# server/.env
DATABASE_URL="postgresql://..."
JWT_SECRET="강력한-랜덤-문자열"
JWT_REFRESH_SECRET="다른-강력한-랜덤-문자열"
```

**.gitignore**:
```
.env
.env.local
.env.production
```

### 10.2 시크릿 키 생성

```bash
# 강력한 랜덤 키 생성
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**권장사항**:
- 개발/스테이징/프로덕션 환경마다 다른 시크릿 사용
- 정기적으로 시크릿 키 교체
- 버전 관리 시스템에 커밋하지 않음

---

## 11. 의존성 보안

### 11.1 정기적인 업데이트

```bash
# 취약점 확인
npm audit

# 취약점 자동 수정
npm audit fix

# 의존성 업데이트
npm update
```

### 11.2 신뢰할 수 있는 패키지만 사용

현재 사용 중인 주요 보안 관련 패키지:
- `bcrypt` - 비밀번호 해싱
- `jsonwebtoken` - JWT 생성/검증
- `helmet` - 보안 헤더 설정
- `express-rate-limit` - Rate limiting
- `zod` - 입력 검증

---

## 보안 체크리스트

### ✅ 구현 완료
- [x] JWT 기반 인증
- [x] 액세스 토큰 + 리프레시 토큰
- [x] HttpOnly 쿠키
- [x] Bcrypt 비밀번호 해싱
- [x] 비밀번호 강도 검증
- [x] XSS 방어 (HttpOnly, CSP)
- [x] CSRF 방어 (SameSite, CORS)
- [x] SQL Injection 방어 (Prisma ORM)
- [x] Rate Limiting
- [x] 입력 검증 (클라이언트 + 서버)
- [x] 에러 처리 표준화
- [x] 환경 변수 보안

### 📋 추후 고려사항
- [ ] Two-Factor Authentication (2FA)
- [ ] 계정 잠금 (로그인 실패 시)
- [ ] 비밀번호 재설정 기능
- [ ] 이메일 인증
- [ ] 세션 관리 (활성 세션 목록)
- [ ] IP 화이트리스트/블랙리스트
- [ ] 로그인 이력 추적
- [ ] Content Security Policy 세부 설정
- [ ] 보안 감사 로깅

---

## 침해 사고 대응

### 토큰 유출 시

1. **즉시 조치**:
   - JWT_SECRET 변경
   - 모든 사용자 강제 로그아웃
   - 데이터베이스의 리프레시 토큰 무효화

2. **사용자 통지**:
   - 비밀번호 변경 권고
   - 보안 사고 내용 공지

### 데이터베이스 침해 시

1. **즉시 조치**:
   - 데이터베이스 접근 차단
   - 백업에서 복구
   - 모든 비밀번호 강제 리셋

2. **보안 강화**:
   - 데이터베이스 접근 권한 재검토
   - 방화벽 규칙 강화
   - 정기 백업 검증

---

## 참고 자료

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Bcrypt](https://www.npmjs.com/package/bcrypt)
- [Helmet.js](https://helmetjs.github.io/)
- [Express Rate Limit](https://www.npmjs.com/package/express-rate-limit)
