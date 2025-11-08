# 사용자 설정 관리 페이지 TODO (Phase별)

## Phase 1. 서버 스키마 & 서비스
- [x] Prisma `user_settings` 모델 추가 (JSON 구조 or 필드별) + 기존 `pomodoro_settings` 통합 전략 수립
- [x] 마이그레이션 작성 및 테스트 DB에 적용
- [x] `userSettingsService.getByUserId` / `updateByUserId` 구현 (기본값 merge 포함)
- [x] Pomodoro 기본값/세션 로직에서 새 서비스 사용하도록 리팩터

## Phase 2. API & 검증
- [x] `userSettingsController` (GET/PUT `/api/user-settings`) + Auth 미들웨어 연결
- [x] Zod validator 작성 (payday 1~31, currency whitelist, timers/pomodoro ranges 등)
- [x] Express 라우터/테스트 (권한, validation, error case) — Jest 케이스 추가 (원격 DB 미접속 시 수동 확인 필요)
- [x] Swagger/문서 업데이트 (선택)

## Phase 3. 클라이언트 상태 동기화
- [x] 공통 `useUserSettingsStore` (Zustand + React Query hydration) 추가
- [x] 기존 스토어(`useFinanceSettingsStore`, `useUiStore`, `useWidgetStore`, `useTimerStore`, `usePomodoroStore`, `useStopwatchStore`)가 서버 값으로 초기화/동기화되도록 리팩터
- [x] currency/timezone/locale helper가 서버 설정을 참조하도록 수정
- [x] 오류/오프라인 시 fallback UX 정의

## Phase 4. 설정 페이지 UI (/settings)
- [ ] 라우트/페이지 골격 + 접근 경로(프로필 드롭다운) 연결  
  - `/settings` 라우트, Auth 가드, React Query prefetch, Skeleton 상태 구현  
  - AppShell 내 헤더/본문 레이아웃 구성, 인덱스 네비게이션(ActionIcon anchor) 추가
- [ ] 재무 기본값 섹션: 월급일, 통화, 주 시작 요일, 포맷 미리보기  
  - `NumberInput`, `Select`, `SegmentedControl` 조합 및 zod validation 연결  
  - 통화 포맷 helper hook(`useCurrencyPreview`) 구성, dirty badge 노출
- [ ] 지역 & 언어 섹션: 타임존 검색, 날짜/숫자 포맷, 언어 선택  
  - Async Select(검색 debounce) + IANA 목록 필터, empty state UX  
  - 날짜/숫자 포맷 토글과 Preview 텍스트 바인딩
- [ ] 테마 & 레이아웃 섹션: 색상 스킴, 사이드바 고정, 위젯 독 위치/자동닫힘  
  - Light/Dark/System SegmentedControl + SR-only 설명  
  - 사이드바 고정 해제 시 위젯 위치 토글 비활성화, Tooltip 안내
- [ ] 타이머/포모도로/스톱워치 기본값 섹션 (프리셋 편집, duration, 알림, 사운드 등)  
  - ChipsEditable 프리셋 에디터(최대 6개, 1~24h 범위) + 중복 검증  
  - 포모도로/스톱워치 입력 컴포넌트, 사운드/볼륨 UI, 샘플 사운드 미리듣기
- [ ] 알림 섹션: 거래/리포트/체크리스트/타이머 알림 토글  
  - Switch 목록 + 채널 아이콘, 브라우저 푸시 권한 경고 배지  
  - 비활성화 사유 툴팁 및 설명 텍스트 연결
- [ ] 저장/되돌리기 컨트롤 + dirty state/validation/토스트 UX  
  - Sticky action bar(데스크톱 플로팅, 모바일 하단) UI 구현  
  - Optimistic PUT + 실패 롤백, Toast/Alert, 되돌리기 confirm 모달
- [ ] 모바일/반응형 레이아웃 최적화  
  - ≥1200px 2열, 768~1199px 단일열, 모바일 padding/spacing 조정  
  - Safe-area inset 및 키보드 대응, 포커스/ARIA 속성 점검

## Phase 5. 통합 및 QA
- [ ] e2e 테스트: 설정 저장 후 각 기능(대시보드, 위젯, 알림)에 반영되는지 검증
- [ ] 다중 브라우저/디바이스에서 설정 유지 확인
- [ ] 회귀 테스트: 기존 로컬 설정 동작 이상 여부 체크 (Timer/Pomodoro/Stopwatch)
- [ ] 문서(README/CLAUDE/PRD) 최신 상태 유지
