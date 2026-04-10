# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

WorkLife Dashboard는 Next.js 프론트엔드와 Express 백엔드를 갖춘 풀스택 개인 생산성 및 재무 관리 애플리케이션으로, 다음 기능을 제공합니다:

- 수입/지출 추적 및 예산 관리
- 급여 공제 계산
- 메모 및 노트 관리 (마크다운 지원, 태그, 첨부파일)
- 대시보드 생산성 위젯 (스티커 메모, 포모도로, 체크리스트 등)
- 구독 관리 및 캐시플로우 캘린더
- 다국어 지원 (한국어/영어)

## 프로젝트 구조

```text
worklife-dashboard/
├── client/     # Next.js 16 프론트엔드 (App Router + TypeScript + Mantine v8)
├── server/     # Express 5 백엔드 (TypeScript + Prisma + PostgreSQL)
├── docs/       # 설계 문서 및 PRD
└── prompts/    # 개발 프롬프트
```

## 주요 명령어

### 클라이언트 (client/)

```bash
npm run dev              # 개발 서버 (http://localhost:3000)
npm run build            # 프로덕션 빌드
npm run lint             # ESLint
```

### 서버 (server/)

```bash
npm run dev              # nodemon 개발 서버 (http://localhost:5001)
npm run build            # TypeScript → dist/ 컴파일
npm test                 # Jest 전체 테스트
npm test -- path/to/test.ts               # 단일 파일 테스트
npm test -- --testNamePattern="test name"  # 특정 테스트

# Prisma (스키마 변경 후 반드시 이 순서로 실행)
npm run db:generate      # 1단계: Prisma Client 타입 생성
npm run db:migrate       # 2단계: DB 스키마 적용
npm run db:seed          # 초기 데이터 시드
npm run db:studio        # Prisma Studio (시각적 DB 편집기)

# Docker (권장 - 서버 + PostgreSQL 동시 실행)
npm run docker:dev       # 서버 + DB 시작
npm run docker:dev:down  # 컨테이너 중지
```

### 풀스택 개발

```bash
# 터미널 1: 서버 + DB
cd server && npm run docker:dev

# 터미널 2: 클라이언트
cd client && npm run dev
```

## 아키텍처

### 클라이언트

- **Next.js 16 App Router** — 페이지는 `client/src/app/` 디렉토리, `"use client"` 지시어로 Server/Client Components 분리
- **Route Handlers** (`client/src/app/api/`) — Express API를 프록시, `cookies()`로 HttpOnly 쿠키 기반 인증 처리
- **SSR/Prefetch** — Server Component에서 TanStack Query `prefetchQuery` → `dehydrate` → 클라이언트에서 hydrate (상세: `docs/14_client-next-ssr-prefetch-strategy.md`)
- **상태 관리**:
  - **TanStack Query**: 서버 상태 (5분 stale time, 10분 cache time)
  - **Zustand**: 클라이언트 UI 상태 (`useAuthStore`, `useUiStore`, `useWidgetStore`)
- **UI**: Mantine v8, i18next (한국어/영어), Axios (자동 토큰 주입/리프레시 인터셉터)
- **인증**: JWT 액세스 토큰(localStorage) + 리프레시 토큰(HttpOnly 쿠키), Google OAuth, Axios 인터셉터가 401 시 자동 갱신 및 동시 요청 큐잉

### 서버

- **Express 5** — 라우트(`routes/`) → Zod 검증(`validators/`) → 컨트롤러(`controllers/`) → 서비스(`services/`) → Prisma
- **보안**: Helmet, CORS, rate limiting, bcrypt
- **DB**: PostgreSQL + Prisma ORM, 스키마는 `server/prisma/schema.prisma` 참조
- **테스트**: Jest + ts-jest, `__tests__/` 디렉토리

### 배포

- **클라이언트**: Vercel 자동 배포
- **서버 + DB**: Render (Web Service + PostgreSQL)
- **CI/CD**: GitHub Actions (상세: `docs/DEPLOYMENT.md`)

## 개발 워크플로우

### 새로운 풀스택 기능 추가

1. `server/prisma/schema.prisma`에 모델 정의
2. `cd server && npm run db:generate && npm run db:migrate`
3. `server/src/validators/` → `services/` → `controllers/` → `routes/` 순서로 구현
4. `client/src/types/`에 타입 정의, `client/src/services/api/`에 API 함수
5. 필요 시 `client/src/app/api/`에 Route Handler 추가

### 환경 변수

- **서버**: `server/.env` (참고: `.env.dev` 파일에 템플릿 있음)
- **클라이언트**: `client/.env.local` — 클라이언트에서 접근하려면 반드시 `NEXT_PUBLIC_` 접두사 필요

## 코딩 컨벤션 & 주의사항

- **경로 별칭**: 클라이언트/서버 모두 `@/` → `src/`
- **타입 임포트**: `import type { Foo } from "./types"` — `type` 키워드 필수
- **Zustand selector**: React 19에서 `useStore((s) => ({ a: s.a, b: s.b }))` 패턴은 무한 렌더링 유발. 반드시 `useStore((s) => s.someValue)` 처럼 값별 개별 selector 사용 또는 `useShallow` 사용
- **설정 페이지**: `client/src/app/dashboard/settings/SettingsPageClient.tsx`는 `react-hook-form` 기반, 신규 설정 항목은 이 컴포넌트를 확장
- **스티커 메모**: 최대 3개, 위치 인덱스 0~2 하드코딩 — 변경 시 `server/src/services/stickyNoteService.ts` + `client/src/components/dashboard/StickyNotes.tsx` 동시 수정 필요
- **대시보드 체크리스트**: 최대 7개, TanStack Query 키 `dashboardChecklist`, API 경로 `/api/dashboard-checklist`
