# Next.js 클라이언트 마이그레이션 체크리스트

기존 Vite 기반 `client` 앱을 `client-next` (Next.js App Router)로 이전하기 위한 단계별 체크리스트입니다. 각 Phase는 선행 조건을 만족해야 다음 단계로 넘어갈 수 있도록 구성했습니다.

---

## Phase 1 – 기반 환경 구축

- [x] `client-next` 디렉터리에 Next.js(App Router) 템플릿 생성
- [x] Mantine/React Query/핵심 UI 의존성 설치 및 글로벌 테마/Provider 구성 (`src/theme.ts`, `src/app/providers.tsx`)
- [x] 기존 랜딩 페이지 컴포넌트를 `client-next` 로 복사하고 `/` 경로에 연결
- [x] 주요 내비게이션 대상(로그인, 대시보드, 노트 등) 페이지 파일 생성 및 SEO 메타데이터 정의
- [x] ESLint/TypeScript 기본 설정 확인 (`npm run lint`)

## Phase 2 – 상태 & 유틸 모듈 포팅

- [x] `client/src/store` 의 Zustand 스토어 모듈을 기능 단위로 `client-next/src/lib` 또는 `src/store` 로 이동
- [x] i18n 관련 설정(`lib/i18n.ts`, locale 리소스)을 Next.js 환경에 맞게 `next-i18next` 또는 `i18next` + `app` 디렉터리 구조로 재구성
- [x] Axios/API 클라이언트, React Query 키/헬퍼를 `client-next/src/services` 또는 `lib` 로 복사하면서 서버 사이드 호출 전략 수립
- [x] 환경 변수 사용처를 `process.env.NEXT_PUBLIC_...` 스키마로 업데이트하고 `.env.example` 제공

## Phase 3 – UI 컴포넌트 & 페이지 마이그레이션

- [x] 공용 레이아웃(`DashboardLayout`, `AuthLayout`)과 주요 UI 컴포넌트를 `client-next/src/components` 로 이동
- [x] 페이지별 비즈니스 로직(대시보드, 트랜잭션, 노트 등)을 Next.js 경로에 맞춰 점진적으로 포팅
- [x] 서버 컴포넌트/클라이언트 컴포넌트 구분 (`"use client"`) 및 코드 스플리팅 전략 적용
- [x] Form, 모달, 위젯 등 Mantine 기능이 Next.js 환경에서도 정상 동작하는지 확인

## Phase 4 – 인증 & 데이터 연동

- [x] `@react-oauth/google` 및 기존 토큰 처리 로직을 Next.js Route Handler 또는 Middleware와 연동
- [x] `PrivateRoute` 대체: Next.js middleware 혹은 `generateMetadata`/server actions에서 인증 상태 판별
- [x] React Query + SSR 연계 전략 수립 (필요 시 `dehydrate` 사용)
- [x] API 엔드포인트 호출 경로를 Next.js API Route 혹은 기존 서버 REST API로 리다이렉션

## Phase 5 – QA & 배포 준비

- [ ] `client-next` 전용 빌드/프리뷰 파이프라인 추가 (예: Vercel Project 연결)
- [ ] Lighthouse/SEO 검사로 주요 페이지 인덱싱 가능 여부 확인
- [ ] 크로스 브라우저 테스트 및 모바일 뷰 확인
- [ ] 기존 `client`와 공존하는 동안 라우팅/도메인 전략 문서화 (예: beta 서브도메인)
- [ ] 마이그레이션 완료 후 `client` 폴더 정리 계획 수립

---

### 참고

- 각 Phase 완료 시 `docs` 혹은 프로젝트 노션에 진행 상황 업데이트
- 대규모 컴포넌트 이전 시에는 PR 기준 기능 단위로 쪼개어 검토
