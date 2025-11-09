# 사용자 설정 관리 페이지 PRD

## 1. 배경 및 목표
- 급여 주기, 통화, 시간대 같은 **개인화 설정을 서버에 저장**해 디바이스/브라우저를 옮겨도 동일하게 유지하고 싶다.
- 현재 일부 설정(예: 월급일)은 클라이언트 로컬 스토리지에만 존재해 기기마다 따로 입력해야 하고 초기 UX가 복잡하다.
- **사용자 설정 페이지**(대시보드 > 환경설정)와 **설정 API**를 제공해 프런트 전역에서 공통 데이터를 쓸 수 있도록 한다.

## 2. 범위
| 포함 | 제외 |
| --- | --- |
| 설정 전용 페이지(웹) + 모달 진입 | 모바일 앱, 데스크톱 앱 |
| 서버 영속화 API (GET/PUT `/api/user-settings`) | 실시간 동기화(WebSocket) |
| 필드: 월급일/통화/주 시작/타임존 + **테마/위젯/타이머/포모도로/스톱워치 기본값** | 조직 단위/멀티 사용자 권한 |
| 기존 로컬 스토어(`useUiStore`, `useWidgetStore`, `useTimerStore`, `usePomodoroStore`, `useStopwatchStore`)와 동기화 | 소셜 공유/템플릿 설정 |

## 3. 성공 지표
1. 월급일을 수정한 사용자의 90% 이상이 다른 기기에서도 동일 값 확인.
2. 설정 페이지 진입 후 저장까지의 완료율 80% 이상.
3. 신규 가입자의 평균 거래 필터 수정 횟수 20% 감소(서버 기본 월급일로 대시보드가 바로 정렬되기 때문).

## 4. 사용자 시나리오
1. **25일 월급 사용자**: 회원가입 후 가계부에 들어갔을 때 기본 월급일이 1일로 설정되어 있어 매번 변경해야 했다 → 설정 페이지에서 한 번만 변경하면 모든 통계/필터가 자동 반영.
2. **해외 거주자**: 기본 통화(KRW)가 실제 지출 통화와 달라 가시성이 떨어진다 → 통화를 선택하면 모든 금액 표시 helper에서 해당 통화 포맷 사용.
3. **주말이 다른 국가 사용자**: 달력형 UI의 주 시작 요일을 월요일에서 일요일/토요일로 변경해 보고 싶다.
4. **시간대 이동**: 출장을 가서 현지 시간대로 위젯 알림/타이머 기본값을 조정하고 싶다.
5. **다크 모드 고정 사용자**: 매번 헤더 토글을 누르지 않고 전체 서비스 테마를 영구히 다크 모드로 띄우고 싶다.
6. **위젯 파워유저**: 위젯 독을 좌측으로 옮기고 자동 닫힘을 끄는 등 개인 선호를 적용해 다시 방문해도 유지되길 원한다.
7. **포모도로·타이머 애호가**: 집중/휴식 시간, 타이머 프리셋, 알림 사운드를 통합해서 관리하고 다른 기기에서도 동일하게 쓰고 싶다.

## 5. UX 요구사항
- 접근: 상단 프로필 드롭다운 > "환경설정" 또는 `/settings` 라우트.
- 레이아웃 (카드 섹션)
  1. **재무 기본값**: 월급일(NumberInput), 기본 통화(Select), 주 시작 요일(SegmentedControl), 통화 포맷 미리보기.
  2. **지역 & 언어**: 타임존(검색 Select), 날짜/숫자 포맷 토글, 서비스 언어(locale) 선택.
  3. **테마 & 레이아웃**: 컬러 스킴(Dark/Light/System), 사이드바 기본 상태, 위젯 독 위치/자동 닫힘 토글.
  4. **타이머 & 위젯 기본값**:
     - 일반 타이머: 프리셋 리스트 편집(Chips + NumberInput), 자동 반복, 사전 알림, 알림/사운드 토글.
     - 포모도로: 집중/휴식 길이, 롱 브레이크 주기, 자동 시작 옵션, 사운드/볼륨, 알림.
     - 스톱워치: 기본 목표 시간, 목표 알림 허용 여부.
  5. **알림**: 거래 푸시/이메일, 월간 리포트, 대시보드 체크리스트/타이머 알림.
  6. 저장 영역: 상단 우측 고정 "저장"/"되돌리기" 버튼, 변경 사항 있을 때만 활성화.
- 폼 상태는 `react-hook-form` 또는 Mantine `useForm` 사용, 섹션별 dirty indicator 제공.
- 모바일: 카드가 세로 스택, 저장 바는 스티키 하단.

## 6. 기능 요구사항
### 6.1 데이터 모델 (서버)
```ts
interface UserSettings {
  userId: string;
  locale: string;              // e.g., ko-KR
  timezone: string;            // IANA tz
  finance: {
    payday: number;            // 1~31
    currency: string;          // ISO 4217
    weekStartsOn: 0|1|2|3|4|5|6;
  };
  appearance: {
    colorScheme: 'light' | 'dark' | 'system';
    sidebarPinned: boolean;
    widgetDockPosition: 'left' | 'right';
    widgetAutoClose: boolean;
  };
  timers: {
    presets: number[];         // ms
    autoRepeat: boolean;
    preAlertMs: number | null;
    notifications: boolean;
    soundEnabled: boolean;
  };
  pomodoro: {
    focusDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
    longBreakInterval: number;
    autoStartBreak: boolean;
    autoStartFocus: boolean;
    soundEnabled: boolean;
    soundVolume: number;       // 0~100
    notificationEnabled: boolean;
  };
  stopwatch: {
    defaultGoalTime: number | null;
    notificationsEnabled: boolean;
  };
  notifications: {
    transactions: boolean;
    monthlyReport: boolean;
    checklist: boolean;
  };
  updatedAt: Date;
}
```

### 6.2 동작 규칙
1. **초기화**: 계정 생성 시 서버가 `user_settings` 레코드를 기본값으로 삽입.
2. **조회**: 클라이언트가 로그인 직후 `/api/user-settings` 호출 → Zustand `useFinanceSettingsStore` 등에서 전역 상태로 보관.
3. **수정**: 폼 제출 시 PUT 요청, 서버는 입력 검증 후 저장. 성공 시 전체 객체 반환 → 클라이언트 캐시/스토어 갱신.
4. **오류 처리**: 유효하지 않은 통화/타임존은 400. DB 장애 시 503 + 재시도 가이드.
5. **동기화**: 저장 성공 시 클라이언트는 zustand 스토어(`useFinanceSettingsStore`, `useUiStore`, `useWidgetStore`, `useTimerStore`, `usePomodoroStore`, `useStopwatchStore`)에 일괄 반영. 브라우저 다중 탭을 위해 `storage`/`BroadcastChannel` 활용은 후속 고려.

## 7. API 설계
| Method | Endpoint | 설명 |
| --- | --- | --- |
| GET | `/api/user-settings` | 현재 로그인 사용자의 설정 조회 |
| PUT | `/api/user-settings` | 설정 전체/부분 업데이트 (`Partial<UserSettings>`) |

### 검증 규칙
- `payday`: 정수 1~31.
- `currency`: 서버에서 관리하는 허용 목록(예: KRW, USD, JPY, EUR).
- `timezone`: `Intl.supportedValuesOf('timeZone')` 혹은 tz DB 목록과 매칭.
- `timers.presets`: 1~24시간 범위, 최대 6개.
- `pomodoro` durations: 60~3600초, interval 1~8.
- `appearance.colorScheme`: light/dark/system 세 가지.
- Boolean 필드는 기본 false.

- **DB**: `user_settings` 테이블 (userId FK). Prisma JSON 칼럼(`settings jsonb`) 또는 필드별 칼럼 + existing `pomodoro_settings` 통합(마이그레이션 필요).
- **Service**: `userSettingsService.getByUserId`, `updateByUserId`, 내부적으로 pomodoro/timer defaults를 매핑.
- **Controller**: express 라우터 `userSettingsController` with auth middleware + zod validator.
- **Client State**: 공통 `useUserSettingsStore` 신설. 기존 로컬 스토어는 초기 로드시 서버 값으로 hydrate 하고, 로컬만 쓰는 곳(예: 타이머 위젯)도 저장 성공 이벤트를 구독해 값 업데이트.
- **Fallback**: API 실패 시 기존 로컬 값 유지 + 토스트 경고, 저장 버튼 비활성화.

## 8. Phase 4 — 설정 페이지 UI 상세
### 8.1 라우트 & 페이지 골격
- URL `/settings`, 상단 프로필 드롭다운 내 "환경설정" 메뉴에 연결. Auth 가드에서 `useUserSettingsStore` 초기 fetch가 완료되지 않았다면 Skeleton(카드 4개, 높이 140px)을 노출한다.
- 레이아웃: `AppShell` 본문에 `Stack` + `Container` 조합. 페이지 헤더(제목, 부제, 마지막 저장 시각)를 고정하고, 본문 섹션은 Mantine `Card` 6개 + `ActionIcon` anchor를 활용해 인덱스 탐색이 가능하도록 한다.
- Sticky 저장 바: ≥1024px에서는 우측 상단 플로팅 패널, <1024px에서는 하단 full-width 바. `저장`, `되돌리기`, `닫기`(모바일) 버튼을 포함하며 dirty 상태가 없으면 비활성화.

### 8.2 섹션 구성 및 필드 정의
| 섹션 | 필드/컴포넌트 | UX/검증 포인트 |
| --- | --- | --- |
| 재무 기본값 | 월급일(NumberInput), 통화(Select + ISO 검색), 주 시작 요일(SegmentedControl), 통화 포맷 미리보기(Text) | 1~31 범위, 비워두면 에러; 통화 선택 시 helper에 반영된 예시(`₩1,234,567`). 필드 변경 시 `finance` 섹션 배지(dirty dot) 표시. |
| 지역 & 언어 | 타임존(AsyncSelect + debounce 검색), 날짜/숫자 포맷 토글(Switch group), 서비스 언어(Locale Select) | 타임존은 IANA 목록과 매칭, 검색어 미일치 시 "검색 결과 없음" 표시. 언어 변경 시 즉시 Preview 텍스트(예: 날짜/통화) 업데이트. |
| 테마 & 레이아웃 | 컬러 스킴(SegmentedControl: Light/Dark/System), 사이드바 고정(Switch), 위젯 독 위치(Segmented left/right), 자동 닫힘(Switch) | Preview 카드에서 즉시 색상 토큰 전환. 사이드바 고정을 해제하면 위젯 독 위치 토글이 비활성화되도록 의존 관계 설명 툴팁 제공. |
| 타이머 & 위젯 기본값 | 타이머 프리셋(ChipsEditable), 자동 반복/사전 알림/사운드 토글, 포모도로 집중·휴식 시간(NumberInput + 단위), 롱 브레이크 간격(Stepper), 자동 시작 옵션(Switch), 사운드/볼륨(Slider), 스톱워치 목표(NumberInput) | 프리셋은 1~24시간(분 단위) 사이 최대 6개, 중복 불가. 포모도로 시간은 초 단위로 저장하되 UI는 분 단위 입력. 볼륨 slider 변경 시 샘플 사운드 미리듣기 버튼 제공. |
| 알림 | 거래 푸시/이메일, 월간 리포트, 대시보드 체크리스트, 타이머 완료 알림 (Switch 목록) | 토글 옆에 채널 아이콘(푸시/메일) 표기. 푸시 권한 미허용 시 배지로 경고 표시 및 "브라우저 설정에서 알림 허용" CTA. |
| 저장 행동 | 상단/하단 저장 버튼, 되돌리기(ActionIcon), 상태 메시지 | 저장 시 로딩 스피너 + "저장 중" 텍스트. 성공 시 Toast("설정이 저장되었습니다")와 마지막 저장 시간 업데이트. 실패 시 Form-level 에러 alert + 필드별 에러 유지. |

### 8.3 폼 상태 및 검증 UX
- `react-hook-form` + `zodResolver(UserSettingsSchema)`를 사용하고, `FormProvider`를 섹션 컴포넌트에 전달해 공통 에러 핸들링을 단순화한다.
- 각 섹션 카드 헤더 오른쪽에 dirty indicator(Dot/Tag)를 노출하여 어느 영역이 수정됐는지 명확히 한다. `useWatch`로 섹션별 필드를 구독한다.
- 저장 버튼 활성화 조건: dirty && !isSubmitting && isValid. 되돌리기 클릭 시 confirm 모달을 띄워 실제 서버 값으로 reset.
- API 에러 유형
  - 4xx validation: 해당 필드 하단에 에러 메시지, 카드 상단에는 `Alert`를 노출.
  - 503/네트워크: 저장 바에 Retry 버튼을 노출하고 기존 값으로 롤백하지 않는다.
- PUT 요청은 optimistic update로 zustand store를 먼저 갱신하고, 실패 시 이전 스냅샷으로 되돌린다.

### 8.4 핵심 상호작용 플로우
1. **페이지 진입**: 사용자 메뉴 → 환경설정 → Skeleton → 데이터 불러오기 완료 → 카드 확장. 첫 방문 시 도움말 Tour(선택) 제공.
2. **필드 수정**: 예) 통화 변경 → 통화 포맷 preview 즉시 반영 → dirty badge → 저장 바 활성화.
3. **저장**: Save 클릭 → 상단/하단 모든 버튼 로딩 상태 → 성공 Toast + store 싱크 + dirty clear. 실패 시 focus를 문제 필드로 이동.
4. **되돌리기/이탈 보호**: dirty 상태에서 라우트 이동 시 confirm dialog. 되돌리기 사용 시 서버 state를 refetch(React Query invalidate)하여 drift를 방지.

### 8.5 반응형 & 접근성
- Breakpoint 1200px 이상: 2열 masonry (재무/지역/테마 | 타이머/알림/저장). 768~1199px: 단일 열이지만 카드 제목 옆에 아이콘 유지. 767px 이하: 카드 padding 축소(16px), 입력 요소 전체 폭 사용.
- Sticky 저장 바는 모바일에서 safe-area inset을 고려해 padding 추가. 키보드 오픈 시 자동 숨김.
- 모든 Switch/SegmentedControl은 `aria-describedby`로 도움말 텍스트와 연결, color scheme 토글은 OS 설정과의 관계를 설명하는 sr-only 텍스트 포함.
- 대비 비율 WCAG AA 유지(텍스트 4.5:1), 포커스 링은 테마별 변형을 준다.

### 8.6 구현 체크리스트
- 섹션별 컴포넌트 예시: `FinanceSection`, `LocaleSection`, `AppearanceSection`, `TimersSection`, `NotificationsSection`, `SettingsActionBar`. 각 컴포넌트는 `FormProvider` context만 의존하도록 설계.
- 공통 helper: `useCurrencyPreview(payday, currency, locale)` 등 미리보기 hook, `useDirtySections`.
- Storybook 혹은 Ladle 스토리를 작성해 단일 컴포넌트 테스트 가능하게 하고, 각 필드는 mock store 데이터를 주입해 시각적으로 검증한다.
- i18n: 레이블/토스트 문구는 `client/src/i18n/settings.json`에 추가.

## 9. 보안 / 권한
- 인증 필수: `AuthRequest`에서 userId 추출.
- 사용자당 하나의 레코드만 수정 가능, 서버에서 `where userId = req.user.id` 강제.
- 요청 본문은 Zod로 스키마 검증, rate limit(분당 20회) 적용.
- 감사 로그: 설정이 변경되면 `user_settings_logs` 혹은 기존 로그 테이블에 기록(필드, 이전/이후 값).

## 10. 구현 계획 (예상 4~5일)
1. **DB/Service (1d)**: Prisma 모델/마이그레이션, `user_settings` + pomodoro 통합, 서비스 단위 테스트.
2. **API Layer (0.5d)**: 라우터, 컨트롤러, Zod Validator, Jest 컨트롤러 테스트.
3. **Client State (1d)**: 공통 settings store 구축, 기존 `useFinanceSettingsStore`/`useUiStore`/`useWidgetStore`/`useTimerStore`/`usePomodoroStore`/`useStopwatchStore`와 동기화 로직 작성.
4. **Settings UI (1.5d)**: `/settings` 페이지, 섹션 컴포넌트, form schema, validation, 저장 UX.
5. **Integration & QA (1d)**: e2e(Playwright) or Cypress 시나리오, 다중 기기 테스트, 회귀 테스트(위젯 기본값 반영 확인).

## 11. 테스트 시나리오
1. 신규 사용자 기본값 확인: 가입 직후 GET 응답이 기본 스키마와 일치.
2. 월급일 25일 저장 → 가계부 대시보드 새로고침 시 `10/25~11/24` 구간으로 표시.
3. 통화 바꾸기 → 거래 카드/그래프 포맷이 즉시 새 통화로 변환.
4. 타임존 변경 → 포모도로/타이머 알림 시간과 거래 시각 표시가 올바르게 변환.
5. 테마를 다크로 저장 → 페이지 리로딩/다른 브라우저에서도 다크 모드 적용.
6. 위젯 독 위치를 left로 저장 → Widget Dock 전역에서 좌측으로 렌더링.
7. 포모도로 집중 시간 50분으로 저장 → 위젯/모바일에서 새 기본이 반영되고 서버 세션 기록도 새 duration을 따른다.
8. 타이머 프리셋 수정 → TimerWidget preset 버튼 갯수/시간 일치.
9. 스톱워치 목표시간/알림 설정 저장 → 새 세션 시작 시 기본 목표가 자동으로 채워짐.
10. 권한 검증: 다른 사용자 토큰으로 PUT 시 403.
11. 네트워크 오류 → 저장 버튼 재시도 가능 + 기존 값 유지.
12. E2E 회귀: `client/tests/e2e/settings.spec.ts`에서 월급일 저장, 되돌리기, 검증 실패 시나리오 자동화.

## 12. 오픈 이슈
- 미래 확장: 이메일 구독 주기, 위젯 도크 레이아웃, 알림 채널(Slack/Webhook) 등 추가 필드.
- 다중 기기 실시간 반영을 위한 WebSocket/BroadcastChannel 동기화는 차기 스프린트에서 논의.
- 모바일 전용 레이아웃(앱)이 생길 경우 현재 설계가 재사용 가능한지 검토 필요.
