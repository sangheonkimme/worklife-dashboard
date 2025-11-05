# 포모도로 타이머 기능 구현 체크리스트

## Phase 1: 백엔드 구현 (DB + API)

### 데이터베이스
- [x] Prisma 스키마에 `PomodoroSession` 모델 추가
- [x] Prisma 스키마에 `PomodoroSettings` 모델 추가
- [x] User 모델에 관계 추가 (`pomodoroSessions`, `pomodoroSettings`)
- [x] `npm run db:generate` 실행
- [x] `npm run db:migrate` 실행

### 검증 (Zod)
- [x] `server/src/validators/pomodoroValidator.ts` 파일 생성
- [x] 세션 생성 검증 스키마 작성 (`createSessionSchema`)
- [x] 설정 업데이트 검증 스키마 작성 (`updateSettingsSchema`)
- [x] 쿼리 파라미터 검증 스키마 작성 (`statsQuerySchema`, `sessionsQuerySchema`)

### 서비스 레이어
- [x] `server/src/services/pomodoroService.ts` 파일 생성
- [x] 세션 생성 함수 구현 (`createSession`)
- [x] 세션 조회 함수 구현 (`getSessions`)
- [x] 통계 계산 함수 구현 (`getStats`)
- [x] 설정 조회 함수 구현 (`getSettings`)
- [x] 설정 업데이트 함수 구현 (`updateSettings`)
- [x] 기본 설정 생성 함수 구현 (`createDefaultSettings`)

### 컨트롤러
- [x] `server/src/controllers/pomodoroController.ts` 파일 생성
- [x] GET `/api/pomodoro/stats` 핸들러 구현
- [x] GET `/api/pomodoro/sessions` 핸들러 구현
- [x] POST `/api/pomodoro/sessions` 핸들러 구현
- [x] GET `/api/pomodoro/settings` 핸들러 구현
- [x] PUT `/api/pomodoro/settings` 핸들러 구현

### 라우트
- [x] `server/src/routes/pomodoroRoutes.ts` 파일 생성
- [x] 모든 API 엔드포인트 라우트 정의
- [x] 인증 미들웨어 적용
- [x] 검증 미들웨어 적용
- [x] `server/src/index.ts`에 라우트 등록 (`/api/pomodoro`)

### 백엔드 테스트
- [x] API 엔드포인트 테스트 (수동 또는 자동)
- [x] 통계 계산 로직 검증
- [x] 에러 핸들링 확인

---

## Phase 2: 프론트엔드 - 기본 타이머

### 타입 정의
- [x] `client/src/types/pomodoro.ts` 파일 생성
- [x] `SessionType` 타입 정의 (`'focus' | 'short_break' | 'long_break'`)
- [x] `TimerStatus` 타입 정의 (`'idle' | 'running' | 'paused'`)
- [x] `PomodoroSession` 인터페이스 정의
- [x] `PomodoroSettings` 인터페이스 정의
- [x] `PomodoroStats` 인터페이스 정의

### Zustand 스토어
- [x] `client/src/store/usePomodoroStore.ts` 파일 생성
- [x] 스토어 상태 인터페이스 정의
- [x] `startTimer` 액션 구현
- [x] `pauseTimer` 액션 구현
- [x] `resumeTimer` 액션 구현
- [x] `stopTimer` 액션 구현
- [x] `tick` 함수 구현 (1초마다 remainingTime 감소)
- [x] `completeSession` 함수 구현
- [x] `switchSession` 함수 구현
- [x] `updateSettings` 함수 구현
- [x] `reset` 함수 구현
- [x] localStorage 연동 (persist 미들웨어)
- [x] setInterval 관리 로직 구현
- [x] 세션 복원 로직 구현 (`restoreSession`, `sessionStartedAt`, `lastTickAt`)
- [x] 위젯 표시/숨김 상태 관리 (`isWidgetVisible`, `setWidgetVisible`)

### API 서비스
- [x] `client/src/services/api/pomodoroApi.ts` 파일 생성
- [x] `getStats` API 함수 작성
- [x] `getSessions` API 함수 작성
- [x] `createSession` API 함수 작성
- [x] `getSettings` API 함수 작성
- [x] `updateSettings` API 함수 작성
- [x] TanStack Query 훅 생성 (`useStats`, `useSessions`, `useSettings` 등)

### 타이머 디스플레이 컴포넌트
- [x] `client/src/components/dashboard/PomodoroTimerCard.tsx` 파일 생성 (통합 구현)
- [x] 원형 프로그레스 바 구현 (Mantine `RingProgress`)
- [x] 시간 텍스트 표시 (MM:SS 포맷)
- [x] 세션 타입 인디케이터 (집중/휴식)
- [x] 색상 테마 적용 (집중: 빨강, 휴식: 녹색, 일시정지: 노랑)

### 타이머 제어 컴포넌트
- [x] PomodoroTimerCard 내 통합 구현
- [x] 시작 버튼 구현
- [x] 일시정지 버튼 구현
- [x] 중지 버튼 구현
- [x] 버튼 상태에 따른 조건부 렌더링

### 메인 타이머 카드
- [x] `client/src/components/dashboard/PomodoroTimerCard.tsx` 파일 생성
- [x] 카드 레이아웃 구성 (Mantine `Card`)
- [x] 타이머 디스플레이 통합
- [x] 타이머 제어 버튼 통합
- [x] 오늘 완료한 포모도로 개수 표시 (Badge)
- [x] 카드 호버 애니메이션 추가
- [x] 반응형 디자인 적용

### 대시보드 통합
- [x] `client/src/pages/DashboardPage.tsx` 수정
- [x] PomodoroTimerCard 임포트
- [x] "주요 기능" 섹션에 카드 추가
- [x] SimpleGrid 레이아웃 확인 (cols: 1/2/3)
- [x] 연봉 계산기 옆에 배치

### 브라우저 알림
- [x] `requestNotificationPermission` 함수 구현 (스토어 내)
- [x] `showNotification` 함수 구현 (스토어 내)
- [x] 타이머 완료 시 알림 트리거
- [x] 알림 권한 요청 컴포넌트 마운트 시 실행

### 스타일링 및 아이콘
- [x] Tabler Icons 임포트 (`IconClock`, `IconPlayerPlay` 등)
- [x] 색상 테마 정의 (집중: red, 휴식: green, 일시정지: yellow)
- [x] 애니메이션 추가 (호버, 전환 효과)
- [x] 모바일 반응형 확인

### 플로팅 위젯 및 독 아이콘
- [x] `client/src/components/pomodoro/PomodoroWidget.tsx` 파일 생성
- [x] 우측 하단 플로팅 위젯 구현
- [x] 대시보드에서 위젯 숨김 처리
- [x] 위젯 표시/숨김 토글 기능
- [x] `client/src/components/widget-dock/PomodoroDockIcon.tsx` 파일 생성
- [x] WidgetDock에 포모도로 타이머 미니 아이콘 추가
- [x] 독 아이콘 클릭 시 위젯 표시/숨김 전환
- [x] 실시간 시간 표시 및 상태 색상 변경
- [x] Pulse 애니메이션 추가 (running 상태)

### 프론트엔드 테스트
- [x] 타이머 시작/일시정지/중지 동작 확인
- [x] 시간 카운트다운 정확도 검증
- [x] 세션 전환 로직 테스트
- [x] 브라우저 알림 동작 확인
- [x] 반응형 디자인 테스트 (모바일, 태블릿, 데스크톱)
- [x] 새로고침 시 타이머 상태 복원 확인
- [x] 플로팅 위젯 닫기/열기 동작 확인

---

## Phase 3: 고급 기능

### 설정 모달
- [ ] `client/src/components/pomodoro/SettingsModal.tsx` 파일 생성
- [ ] 설정 버튼 추가 (기어 아이콘)
- [ ] 모달 레이아웃 구성 (Mantine `Modal`)
- [ ] 집중 시간 조정 슬라이더 (15/25/45분)
- [ ] 휴식 시간 조정 슬라이더 (5/10/15분)
- [ ] 긴 휴식 간격 설정 (4회마다)
- [ ] 자동 시작 토글 (집중/휴식)
- [ ] 소리 알림 토글
- [ ] 소리 볼륨 조절
- [ ] 설정 저장 버튼
- [ ] 설정 API 연동 (PUT `/api/pomodoro/settings`)

### 소리 알림
- [ ] `client/src/utils/audio.ts` 파일 생성
- [ ] 완료 소리 파일 준비 (public/sounds/)
- [ ] `playCompletionSound` 함수 구현
- [ ] Web Audio API 또는 `<audio>` 태그 사용
- [ ] 볼륨 조절 기능
- [ ] 소리 on/off 토글 연동

### 통계 패널 (선택적)
- [ ] `client/src/components/pomodoro/StatsPanel.tsx` 파일 생성
- [ ] 오늘 완료 개수 표시
- [ ] 총 집중 시간 표시
- [ ] 연속 달성 일수 (streak) 표시
- [ ] 주간/월간 통계 차트 (선택적)
- [ ] 세션 히스토리 목록 (선택적)

### 고급 기능 테스트
- [ ] 설정 변경 및 저장 확인
- [ ] 자동 시작 동작 테스트
- [ ] 소리 알림 재생 확인
- [ ] 통계 데이터 정확성 검증

---

## Phase 4: 테스트 및 최적화

### 통합 테스트
- [ ] 풀스택 동작 테스트 (프론트엔드 + 백엔드)
- [ ] 세션 기록이 DB에 정확히 저장되는지 확인
- [ ] 통계가 올바르게 계산되는지 확인
- [ ] 여러 세션 연속 실행 테스트

### 성능 최적화
- [ ] setInterval 정확도 개선 (필요 시 requestAnimationFrame 고려)
- [ ] 페이지 비활성화 시 타이머 동작 확인 (Page Visibility API)
- [ ] 불필요한 리렌더링 최적화 (React.memo, useMemo)
- [ ] TanStack Query 캐싱 전략 확인

### 접근성
- [ ] 키보드 단축키 지원 (Space: 시작/일시정지, Esc: 중지)
- [ ] ARIA 라벨 추가 (버튼, 프로그레스)
- [ ] 스크린 리더 친화적인 시간 표시
- [ ] 고대비 모드 테스트

### 버그 수정
- [ ] 타이머 정확도 이슈 수정
- [ ] 알림이 중복 표시되는 문제 수정
- [ ] 페이지 새로고침 시 상태 유지 확인
- [ ] 동시 요청 시 race condition 방지

### 문서화
- [ ] 코드 주석 추가
- [ ] API 문서 업데이트
- [ ] 사용자 가이드 작성 (선택적)

---

## MVP 완료 조건

### 필수 기능 체크리스트
- [ ] 포모도로 타이머 카드가 대시보드에 표시됨
- [ ] 25분 집중 타이머 시작/일시정지/중지 가능
- [ ] 5분 휴식 타이머로 자동 전환
- [ ] 남은 시간을 시각적으로 표시 (원형 프로그레스)
- [ ] 타이머 완료 시 브라우저 알림
- [ ] 오늘 완료한 포모도로 개수 표시
- [ ] 세션 기록이 서버에 저장됨

---

## 추가 개선 사항 (향후)

### 작업 연동
- [ ] 특정 작업/프로젝트에 포모도로 연결
- [ ] 태그 기능
- [ ] 메모 기능
- [ ] 작업별 통계

### 분석 대시보드
- [ ] 생산성 패턴 분석
- [ ] 최적 집중 시간대 파악
- [ ] 주간/월간 리포트 생성

### 다양한 모드
- [ ] 커스텀 타이머 (52-17 방식 등)
- [ ] 플립시계 모드
- [ ] 풀스크린 모드

### 통합 기능
- [ ] 캘린더 연동
- [ ] 할 일 목록 연동
- [ ] Slack/Discord 알림

---

## 예상 작업 시간

| Phase | 작업 내용 | 예상 시간 |
|-------|----------|----------|
| Phase 1 | 백엔드 (DB + API) | 2-3시간 |
| Phase 2 | 프론트엔드 기본 타이머 | 4-5시간 |
| Phase 3 | 고급 기능 (설정, 알림, 통계) | 2-3시간 |
| Phase 4 | 테스트 및 버그 수정 | 1-2시간 |
| **총계** | | **9-13시간** |

---

## 참고사항

- **우선순위**: MVP 필수 기능 먼저 구현 후 고급 기능 추가
- **테스트**: 각 Phase 완료 시마다 테스트 수행
- **커밋**: 기능 단위로 작은 커밋 유지
- **코드 리뷰**: 주요 기능 구현 후 코드 검토
