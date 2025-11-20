# Next.js SSR/Prefetch 전략 (Profile & Settings)

## 1. 목표
- `/profile`, `/settings` 등 인증 기반 페이지에서 필요한 사용자/환경 데이터를 서버 사이드에서 선 로드해 **첫 페인트 전 상태 동기화**.
- Edge/Route Handler를 활용해 기존 Express API와 동일 스펙을 유지하면서, Next App Router의 `fetch`/`generateMetadata`/Server Component 기능을 최대한 활용.

## 2. 공통 아키텍처
1. **Route Handler 래핑**
   - `client-next/src/app/api` 아래에 `/api/auth/me`, `/api/user-settings` 라우트를 생성.
   - 내부에서는 기존 서버 REST 엔드포인트를 `fetch` 호출 (`process.env.API_URL`)로 프록시하고, Next `cookies()` 로 액세스토큰을 주입하거나 서버측 리프레시 로직을 처리.
2. **서버 컴포넌트 데이터 로드**
   - `/profile`·`/settings`의 상위 레이아웃 또는 페이지 컴포넌트에서 `const data = await fetch('/api/...', { cache: 'no-store' })`.
   - `headers()`로 Authorization 헤더를 구성하여 SSR 시 인증 상태를 판별하고, 인증 실패 시 `redirect('/login')`.
3. **React Query Hydration**
   - `client-next/src/app/providers.tsx`에 `Hydrate` 래퍼 추가 예정.
   - 서버 컴포넌트에서 `prefetchQuery` 로 QueryClient를 채우고, `dehydrate` 결과를 Children(클라이언트 컴포넌트)에 전달.
   - 클라이언트 컴포넌트(`useUserSettings`, `useAuth`)에서는 `initialData` 로 hydration 값을 사용하면서 이후 변경은 기존 mutation 로직을 재사용.

## 3. 페이지별 세부 전략

### 3.1 `/settings`
- **필요 데이터**
  - `GET /api/user-settings`: 모든 설정 구조
  - `GET /api/user-settings/meta`: 타임존/통화 등 선택 옵션 (향후 Route Handler에서 캐시 가능)
- **SSR 절차**
  1. `client-next/src/app/settings/layout.tsx` (Server Component)에서 `fetchSettings()` 실행.
  2. QueryClient 생성 후 `await queryClient.prefetchQuery(['user-settings'], fetchSettings)`.
  3. `const dehydratedState = dehydrate(queryClient)` 를 클라이언트 페이지에 prop으로 넘기고, `Hydrate` 로 감싸 렌더링.
  4. `useUserSettings` 훅은 `enabled: false` 로 초기 fetch를 막고, `hydrate` 단계에서 Zustand/Form에 값을 채움.
- **추가 고려사항**
  - Route Handler에서 SSG/ISR이 의미 없으므로 `cache: 'no-store'`.
  - `lastSavedAt` 등 서버 타임스탬프는 쿼리 응답에 포함시켜 SSR렌더 시 그대로 사용.

### 3.2 `/profile`
- **필요 데이터**
  - `GET /api/auth/me`: 사용자 프로필
  - (선택) `GET /api/auth/activity`: 최근 로그인/보안 로그
- **SSR 절차**
  1. `client-next/src/app/profile/page.tsx` 를 Server Component로 전환하거나, 래퍼 레이아웃에서 `fetchProfile()` 실행.
  2. 사용자 데이터가 없으면 `redirect('/login')`.
  3. React Query hydration은 `['auth', 'me']` 키로 prefetch 후, 클라이언트 페이지는 기존 `useAuth` 결과를 바로 사용.
  4. 비밀번호 변경 등 mutation은 클라이언트에서 기존 API 호출을 유지.

### 3.3 캐싱 & 보안
- Route Handler는 Next의 `cookies()` 를 통해 HttpOnly 리프레시 토큰 기반 재인증을 수행.
- 캐시 정책:
  - 민감 데이터는 `cache: 'no-store'`.
  - 옵션성 데이터(타임존 목록 등)는 `revalidate: 86400` 으로 Edge 캐시 허용 가능.
- 에러 처리:
  - 401 → `/login` 리다이렉트.
  - 5xx → 에러 바운더리에서 공지, 클라이언트 측 `useUserSettings`/`useAuth` 는 fallback 알림 그대로 사용.

## 4. 구현 우선순위
1. `Hydrate` 컴포넌트 도입 및 `fetchWithAuth` 유틸 생성 (`client-next/src/lib/server/fetchWithAuth.ts` 예정).
2. `/settings` Route Handler + Server Prefetch 적용.
3. `/profile` Server Prefetch + auth redirect 처리.

## 5. /transactions 전용 전략
- **문제점**: 기존 `recharts` 기반 차트는 DOM/Window 의존성이 강해 App Router 서버 컴포넌트에서 렌더 시 `createContext` 오류를 유발.
- **대안 1 – 서버 안전 UI로 대체**: 통계/카테고리 차트를 Progress/Stack 등 Mantine 컴포넌트로 교체해 완전 SSR 가능하도록 수정. 현재 버전은 이 방식으로 해결.
- **대안 2 – 동적 분리**:
  1. 차트만 Client Component(`"use client"`)로 분리하고 `next/dynamic` + `ssr: false` 사용.
  2. 서버 페이지에서는 차트용 데이터를 Prefetch 후 Hydrate로 넘기고, 클라이언트 차트 컴포넌트가 React Query에서 읽어 표시.
  3. Route Handler `/api/transactions/statistics` 로 백엔드 호출을 프록시해 SSR 시에도 token 이슈 없이 데이터를 공급.
- **현 상태**: 차트 라이브러리 교체 전까지는 CSR 페이지로 유지한다. (데이터/폼은 기존 CSR 흐름 그대로 사용)
- **Prefetch 대상**:
  - `["dashboard-statistics", start, end, payday]`
  - `["dashboard-recent-transactions"]` (선택)
- **추가 Route Handler**:
  - `GET /api/transactions/statistics`
  - `GET /api/transactions/recent`

## 6. 다른 페이지 확장 가이드 (/dashboard, /finance-tools)
1. **Route Handler 작성**  
   - `/api/dashboard/overview`, `/api/finance-tools/loan` 등 기존 REST 엔드포인트를 fetchWithAuth로 감싼 Next Route Handler 추가.
2. **Server Component Prefetch**  
   - `createQueryClient` → `prefetchQuery` → `Hydrate` 구조를 페이지마다 동일하게 적용.  
   - `/dashboard`의 경우 sticky notes, checklist, widget registry 등 필요한 데이터별로 QueryKey를 정의.
3. **클라이언트 상태 하이드레이션**  
   - 클라이언트 훅에서는 `enabled: typeof window !== "undefined"` 조건을 사용하거나 `initialData`를 활용해 SSR 값을 바로 사용.
4. **문서화**  
   - 새 Route Handler/Prefetch 항목을 Phase 4 문서에 표 형태로 기록해 두면 작업자가 어떤 쿼리를 맵핑해야 하는지 빠르게 파악 가능.

> **TIP**: 차트/캔버스 등 SSR 불가 UI는 “데이터는 서버에서 Prefetch + Hydrate, UI는 클라이언트에서만 렌더”라는 원칙만 지키면 다른 페이지에도 동일 패턴을 적용하기 쉽다.

위 전략을 바탕으로 Phase 3 잔여 작업(서버/클라이언트 분리, Form 검증)과 Phase 4 인증 연동을 동시에 진행할 수 있다. 구현 단계에서 구체적인 코드 패턴을 문서화하면 다른 페이지로도 손쉽게 확장 가능하다.
