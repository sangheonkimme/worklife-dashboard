# 12. Multilingual Support Plan

## Chapter 1. 목표 및 범위
1.1 기본 언어를 한국어/영어 이중화로 정의하고, 언어 리소스 구조를 N개 언어까지 확장 가능한 JSON namespace 형태로 통일한다.  
1.2 클라이언트(React 19 + Mantine) 전역에서 사용자 설정(`settings` 페이지)과 로컬 스토리지에 동기화된 언어 코드가 항상 동일하게 적용되도록 한다.  
1.3 서버(Express + Prisma)가 반환하는 검증/오류 메시지, 이메일 템플릿, push 알림 등 사용자 노출 문구에 동일한 키 기반 번역을 적용한다.  
1.4 번역 품질 관리를 위해 `docs/worklife_design_guide.md`의 톤 & 매뉴얼을 참조한 언어별 카피 가이드라인을 추가한다.  
1.5 비범용 텍스트(사용자 생성 컨텐츠, 영수증 OCR 결과 등)는 번역 대상에서 제외하고, 필요 시 "원문 유지" 배지로 명시한다.

## Chapter 2. 구현 계획
2.1 **기술 스택 결정**: 프런트는 `i18next + react-i18next`, 서버는 `i18next-fs-backend` 기반 라이트 래퍼를 도입해 동일 키셋을 공유한다. 빌드 시 리소스는 `/client/src/locales/<lang>/*.json`, `/server/src/locales/<lang>.json`에 저장하고, 공통 키 정의는 `docs/i18n-key-reference.md`로 관리한다.  
2.2 **리소스 구조 설계**: 뷰 단위 네임스페이스(`dashboard`, `notes`, `finance`, `settings`, `system`)로 나누고, UI 컴포넌트에 명확한 키 규칙(`{namespace}:{component}.{slot}`)을 적용한다. 새 문자열 추가 시 PR 템플릿에 키 등록 체크 항목을 추가한다.  
2.3 **클라이언트 통합**: `client/src/main.tsx`에 `I18nextProvider`를 주입하고, Mantine의 `createTheme`와 `DatesProvider`에 locale을 연동한다. 라우터 로드 시 `Suspense` 로더를 사용해 언어별 청크를 지연 로딩하고, 현지화가 필요한 숫자/통화/날짜는 Intl API 래퍼 유틸(`client/src/lib/formatters.ts`)로 추상화한다.  
2.4 **서버 통합**: `Accept-Language` 헤더 및 사용자 설정 테이블에 `language` 필드를 추가해 미들웨어(`server/src/middleware/i18n.ts`)에서 결정, Zod 오류/Prisma Unique 오류 등을 키 기반 메시지로 매핑한다. 이메일/알림 템플릿은 handlebars 내에 `{{t "namespace.key"}}` 헬퍼를 주입해 렌더한다.  
2.5 **번역 워크플로우**: 기본 언어 커밋 → `scripts/i18n:extract`로 신규 키를 추출 → 번역 담당자가 `docs/i18n-key-reference.md` 기준으로 JSON 채우기 → `scripts/i18n:lint`로 누락 및 형식 검사 → CI에서 언어별 파일 구조 비교.  
2.6 **QA 및 접근성**: 스냅샷 테스트 외에도 Cypress e2e에 언어 전환 시나리오를 추가하고, 긴 문자열 대비 레이아웃 테스트(Storybook viewport)와 스크린리더 번역 유효성(aria-label) 체크리스트를 만든다.  
2.7 **릴리스 및 롤아웃**: 숨김 플래그로 `/settings`에 언어 선택 토글을 먼저 노출 → 내부 QA 완료 후 기본값을 `auto (browser)`로 설정하고, 사용자별 언어 선택을 서버에 영구 저장한다.

## Chapter 3. TodoList (Check 가능한 Chapter)
### 3.1 Foundation
- [x] `user_settings` 스키마에 `language` enum(`ko`, `en`, `system`) 추가 및 Prisma 마이그레이션 작성
- [x] 공용 키 규칙 문서 초안(`docs/i18n-key-reference.md`) 생성 및 PR 템플릿 체크 항목 추가
- [x] `scripts/i18n:extract` / `scripts/i18n:lint` Node 스크립트 골격 작성

### 3.2 Client Integration
- [x] `i18next` / `react-i18next` / `i18next-browser-languagedetector` 의존성 설치 및 `client/src/lib/i18n.ts` 초기화
- [x] Mantine `DatesProvider`와 커스텀 숫자/통화 포매터 유틸에 locale 주입
- [ ] 기존 문자열(대시보드·메모·설정 등) 1차 키 변환 및 `ko`/`en` JSON 작성
- [x] 언어 전환 토글을 `settings` 페이지에 추가하고 Zustand 스토어와 동기화

### 3.3 Server Integration
- [ ] `i18next` 서버 인스턴스와 로더(`server/src/lib/i18n.ts`) 추가
- [ ] `Accept-Language`/사용자 설정 기반 언어 결정 미들웨어 작성
- [ ] Zod/Prisma 오류 메시지 맵을 키 기반으로 교체하고 테스트 추가
- [ ] 이메일/알림 템플릿에 번역 헬퍼(`{{t ...}}`) 주입

### 3.4 Content & QA
- [ ] `docs/worklife_design_guide.md`에 언어별 톤 & 스타일 가이드 추가
- [ ] 번역 누락/레이블 길이 감시용 Storybook 또는 Chromatic 시나리오 등록
- [ ] Cypress e2e에 언어 변경 → UI 반영 → 서버 API 응답 번역 시나리오 추가
- [ ] 릴리스 노트에 다국어 지원 항목 및 롤아웃 단계 명시
