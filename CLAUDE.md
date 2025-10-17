# CLAUDE.md

이 파일은 이 저장소에서 작업할 때 Claude Code (claude.ai/code)에게 지침을 제공합니다.

## 프로젝트 개요

WorkLife Dashboard는 React 프론트엔드와 Express 백엔드를 갖춘 풀스택 개인 재무 관리 애플리케이션으로, 수입/지출 추적, 예산 관리, 급여 공제 계산 기능을 제공합니다.

## 프로젝트 구조

```
worklife-dashboard/
├── client/     # React 프론트엔드 (Vite + TypeScript + Mantine)
├── server/     # Express 백엔드 (TypeScript + Prisma + PostgreSQL)
├── docs/       # 문서
└── prompts/    # 개발 프롬프트
```

## 주요 명령어

### 클라이언트 (프론트엔드)

```bash
cd client
npm install              # 의존성 설치
npm run dev              # 개발 서버 시작 (http://localhost:5173)
npm run build            # 프로덕션 빌드 (TypeScript + Vite)
npm run preview          # 프로덕션 빌드 미리보기
npm run lint             # ESLint 실행
```

### 서버 (백엔드)

```bash
cd server
npm install              # 의존성 설치
npm run dev              # nodemon으로 개발 서버 시작 (http://localhost:5001)
npm run build            # TypeScript를 dist/로 컴파일
npm start                # 컴파일된 프로덕션 빌드 실행

# 데이터베이스 명령어 (Prisma)
npm run db:generate      # Prisma Client 생성 (스키마 변경 후 실행)
npm run db:migrate       # 마이그레이션 실행 (DB 스키마 생성/업데이트)
npm run db:seed          # 초기 데이터로 데이터베이스 시드
npm run db:studio        # Prisma Studio 열기 (시각적 DB 편집기)
```

### 풀스택 개발

별도의 터미널에서 두 서버를 동시에 실행:

```bash
# 터미널 1
cd server && npm run dev

# 터미널 2
cd client && npm run dev
```

## 아키텍처

### 클라이언트 아키텍처

**상태 관리 전략:**

- **TanStack Query (React Query)**: 서버 상태 (사용자 데이터, 거래 내역, 카테고리, 예산)
- **Redux Toolkit**: 클라이언트 전용 UI 상태 (사이드바, 테마, 캐시된 인증)

**주요 기술:**

- React 19 with TypeScript
- Vite 빌드 도구
- Mantine v7 UI 컴포넌트 라이브러리
- React Router 라우팅
- Axios HTTP 요청 (자동 토큰 주입)

**디렉토리 구조:**

```
client/src/
├── components/       # 재사용 가능한 컴포넌트 (common/, layout/)
├── pages/           # 페이지 컴포넌트
├── hooks/           # 커스텀 훅 (useAuth 등)
├── lib/             # 라이브러리 설정
│   ├── axios.ts     # 인터셉터가 있는 Axios 인스턴스
│   └── queryClient.ts # TanStack Query 설정
├── services/        # API 서비스 함수
│   └── api/         # API 모듈 (authApi.ts 등)
├── store/           # Redux 스토어
│   ├── slices/      # Redux 슬라이스 (uiSlice, authSlice)
│   ├── hooks.ts     # 타입이 지정된 Redux 훅 (useAppDispatch, useAppSelector)
│   └── index.ts     # 스토어 설정
└── types/           # TypeScript 타입 정의
```

**인증 흐름:**

- JWT 액세스 토큰은 localStorage에 저장
- 리프레시 토큰은 HttpOnly 쿠키에 저장
- Axios 인터셉터를 통해 401 에러 시 자동 토큰 갱신
- `useAuth` 훅 제공: `user`, `login`, `register`, `logout`, `isAuthenticated`

### 서버 아키텍처

**주요 기술:**

- Express 5 with TypeScript
- Prisma ORM with PostgreSQL
- Zod 요청 검증
- bcrypt 비밀번호 해싱
- JWT 인증
- 보안: Helmet, CORS, rate limiting

**디렉토리 구조:**

```
server/src/
├── controllers/     # 요청 핸들러 (비즈니스 로직)
├── routes/          # Express 라우트 정의
├── middlewares/     # 커스텀 미들웨어 (인증, 에러 처리, rate limiting)
├── services/        # 서비스 레이어 (데이터베이스 작업)
├── validators/      # 요청 검증을 위한 Zod 스키마
└── utils/           # 유틸리티 함수
```

**데이터베이스 스키마 (Prisma):**

- `User`: 인증 및 사용자 프로필
- `Category`: 수입/지출 카테고리 (사용자별 및 기본)
- `Transaction`: 수입/지출 기록
- `Budget`: 카테고리별 월간 예산 추적
- `SalaryCalculation`: 급여 및 공제 계산

### 데이터 흐름 패턴

1. **클라이언트 요청** → API 서비스 함수 (services/api/)
2. **Axios 인터셉터** → Authorization 헤더 추가
3. **서버 라우트** → Express 라우트 (routes/)
4. **미들웨어** → 검증 (Zod), 인증
5. **컨트롤러** → 비즈니스 로직 (controllers/)
6. **서비스** → Prisma를 통한 데이터베이스 작업 (services/)
7. **응답** → TanStack Query가 결과를 캐시

## 개발 워크플로우

### 새로운 기능 추가

**풀스택 기능:**

1. `server/prisma/schema.prisma`에 Prisma 스키마 모델 정의
2. `npm run db:migrate` 및 `npm run db:generate` 실행
3. `server/src/validators/`에 Zod 검증 생성
4. `server/src/services/`에 서비스 함수 생성
5. `server/src/controllers/`에 컨트롤러 생성
6. `server/src/routes/`에 라우트 추가
7. `client/src/types/`에 TypeScript 타입 정의
8. `client/src/services/api/`에 API 함수 생성
9. 컴포넌트에서 TanStack Query 훅 사용

**클라이언트 전용 기능:**

1. `client/src/types/`에 타입 추가
2. 서버 상태의 경우: TanStack Query 사용
3. UI 상태의 경우: `client/src/store/slices/`에 Redux 슬라이스 생성
4. `client/src/pages/` 또는 `client/src/components/`에 페이지/컴포넌트 생성
5. `client/src/App.tsx`에 라우트 추가

### 데이터베이스 변경

`schema.prisma` 수정 후:

```bash
cd server
npm run db:generate    # Prisma Client 타입 업데이트
npm run db:migrate     # 데이터베이스에 변경사항 적용
```

### 환경 변수

**클라이언트** (.env):

```
VITE_API_URL=http://localhost:5001
```

**서버** (.env):

```
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/worklife_dashboard"
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=5001
NODE_ENV=development
CLIENT_URL="http://localhost:5173"
```

## 주요 패턴

### 클라이언트 패턴

**TanStack Query로 API 호출:**

```typescript
// services/api/exampleApi.ts
import api from '@/lib/axios';

export const exampleApi = {
  getAll: () => api.get('/api/examples').then(res => res.data),
  getById: (id: string) => api.get(`/api/examples/${id}`).then(res => res.data),
};

// 컴포넌트에서
const { data, isLoading } = useQuery({
  queryKey: ['examples'],
  queryFn: exampleApi.getAll,
});
```

**UI 상태를 위한 Redux:**

```typescript
// store/slices/exampleSlice.ts
import { createSlice } from '@reduxjs/toolkit';

const exampleSlice = createSlice({
  name: 'example',
  initialState: { value: '' },
  reducers: {
    setValue: (state, action) => { state.value = action.payload; },
  },
});

// 컴포넌트에서
const value = useAppSelector(state => state.example.value);
const dispatch = useAppDispatch();
dispatch(setValue('new value'));
```

### 서버 패턴

**라우트 → 미들웨어 → 컨트롤러:**

```typescript
// routes/exampleRoutes.ts
import { Router } from 'express';
import { validate } from '../middlewares/validate';
import { exampleSchema } from '../validators/exampleValidator';
import { exampleController } from '../controllers/exampleController';

const router = Router();
router.post('/', validate(exampleSchema), exampleController.create);
```

**Zod 검증:**

```typescript
// validators/exampleValidator.ts
import { z } from 'zod';

export const exampleSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    amount: z.number().positive(),
  }),
});
```

**Prisma 서비스:**

```typescript
// services/exampleService.ts
import { prisma } from '../lib/prisma';

export const exampleService = {
  create: (data: CreateDto) => prisma.example.create({ data }),
  findById: (id: string) => prisma.example.findUnique({ where: { id } }),
};
```

## 중요 사항

- 클라이언트는 경로 별칭 `@/` → `client/src/` 사용 (tsconfig에 설정됨)
- 서버는 strict TypeScript 설정 사용 (noImplicitAny, strictNullChecks 등)
- 스키마 변경 후 서버 실행 전 항상 Prisma generate 실행 필요
- Nodemon이 `server/src/` 변경사항을 감시하고 자동 재시작
- Vite HMR이 클라이언트 개발 중 즉각적인 피드백 제공
