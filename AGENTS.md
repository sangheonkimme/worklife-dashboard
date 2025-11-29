# Repository Guidelines

## 프로젝트 구조 & 모듈 구성
- `client/` — Next.js 16 + TypeScript UI. 주요 폴더: `src/app`(라우트/레이아웃), `src/components`(기능별 모듈: notes, pomodoro, dashboard 등), `src/hooks`, `src/store`(Zustand), `src/services`(API 호출), `src/locales`(i18n). 정적 자산은 `public/`.
- `server/` — Express 5 + TypeScript + Prisma. MVC에 맞춰 `src/routes`, `controllers`, `services`, `validators`, `middlewares`, `lib`, `utils`, `src/__tests__`로 구성. DB 스키마/시드는 `prisma/`.
- `docs/`는 PRD·구현 계획·보안 노트를 보관, `scripts/`는 i18n 유틸, 루트 `docker-compose*.yml`이 클라이언트/서버/Postgres 오케스트레이션.

## 빌드·테스트·개발 명령
- 클라이언트(`client/`에서 실행): `npm run dev`(로컬 :3000), `npm run build`(프로덕션 빌드), `npm start`(빌드 서비스), `npm run lint`(ESLint core-web-vitals).
- 서버(`server/`에서 실행): `npm run dev`(nodemon+ts-node), `npm run build`(tsc → `dist/`), `npm start`(Prisma migrate deploy 후 Node), `npm test` / `npm run test:coverage`(Jest+Supertest), `npm run db:generate|db:migrate|db:seed|db:studio`(Prisma 작업).
- Docker: `server/` 기준 `npm run docker:dev`로 전체 스택 핫리로드, `docker:prod` 변형은 프로덕션 유사 실행.
- 루트 i18n: `npm run i18n:extract`, `npm run i18n:lint`를 리포지토리 루트에서 실행.

## 코딩 스타일 & 네이밍
- 전반 TypeScript 우선; 공개 인터페이스·API 페이로드에는 명시적 타입 선호.
- 클라이언트는 ESLint(Next core-web-vitals) 준수 후 커밋. 서버는 TS/Jest 기본 규칙에 맞춰 2스페이스 들여쓰기와 trailing comma 유지.
- 컴포넌트/훅 파일은 PascalCase(`DashboardShell.tsx`), 디렉터리는 케밥 또는 소문자. 훅은 `use*`로 시작, API·유틸은 camelCase(`authClient.ts`, `dateUtils.ts`).
- i18n 키는 `scripts/i18n`으로 관리; `client/src/locales`에 키 추가 후 lint/extract 실행.

## 테스트 가이드
- 서버: `server/src/__tests__`에 `*.test.ts` 배치. 라우트 계약은 Supertest, 스냅샷은 안정된 응답에 한정. DB를 쓰는 테스트 전 Prisma 마이그레이션 실행.
- 클라이언트: 공식 테스트 스위트는 미비; 최소 `npm run lint` 실행. 핵심 UI 로직 추가 시 React Testing Library 기반 경량 테스트를 `__tests__` 패턴으로 추가.
- 신규 API는 정상·검증 실패 케이스 모두 포함해 커버리지 확보. 인증, rate limit, 파일 업로드 에지 케이스를 포함.

## 커밋 & PR 가이드
- git 히스토리 형식 준수: `<type> : [scope] 요약` (예: `feat : [프론트] 위젯 독 상태 저장`, `fix : [서버] 빌드 오류 수정`). 요약은 ~70자 이내, scope는 `프론트`/`서버`/기능명 사용.
- PR에는 목표/접근, 수행 테스트(`npm test`, `npm run lint`, 주요 수동 플로우), UI 변경 시 스크린샷 또는 영상, 관련 `docs/` 문서나 이슈 링크를 포함. 환경 변경(`.env`, Prisma 스키마) 시 마이그레이션 방법을 명시.
