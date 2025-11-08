# 타이머 기능 PRD (Product Requirements Document)

## 1. 배경 및 목표
- 대시보드 위젯 도크에 포모도로 · 스톱워치와 함께 사용할 수 있는 **일반 목적 타이머(카운트다운)** 제공
- 사용자가 원하는 시간(초 단위)으로 타이머를 설정하고 알림/진동/색상으로 완료를 인지
- 포모도로 대비 자유도가 높고, 스톱워치 대비 종료 시점을 명확히 정의하고 싶을 때 사용
- 다크/라이트 테마 및 모바일 반응형 지원

## 2. 범위
| 포함 | 제외 |
| --- | --- |
| 단일 카운트다운 타이머, 다중 프리셋 (예: 5/10/15분) | 다중 동시 타이머 |
| 남은 시간 시각화 (Ring/Radial progress) | 캘린더/알람 앱 연동 |
| 완료 시 브라우저 Notification + 소리(옵션) | 백그라운드 푸시 알림 |
| 상태 영속화 (localStorage) | 서버 저장, 멀티 디바이스 동기화 |

## 3. 주요 지표 (Success Metrics)
1. 타이머 위젯 활성화율 (주 1회 이상 사용) 30% 이상
2. 타이머 완료까지 전부 재생 비율 60% 이상
3. 위젯 도크 내 평균 체류 시간 10% 증가

## 4. 사용자 여정 & 요구사항
1. **빠른 집중 세션**: 10~15분 정도 짧은 집중시간을 만들고 싶다. → 프리셋 버튼 제공, 1클릭 실행
2. **요리/운동/라면 타이머**: 수동으로 시간을 입력해 One-off 카운트다운 실행 → 분/초 입력 UI 필요
3. **회의/발표 관리**: 남은 시간을 직관적으로 확인하고 종료 1분 전에 미리 경고 받고 싶다. → 중간 경고 옵션
4. **다크모드 사용**: 야간에 사용할 때 위젯이 눈부시지 않고 대비가 유지되길 원함. → 색상 토큰 대응

## 5. UX 요구사항
- 위젯 도크 아이콘: 모래시계/알람 벨 아이콘
- 위젯 본문 구성
  1. 헤더: 아이콘 + "타이머" 제목 + 설정(ActionIcon)
  2. 중앙: RingProgress (남은 시간 비율) + 중앙에 `MM:SS`
  3. 컨트롤: 시작/일시정지 토글, 리셋, 프리셋 Chip(5/10/15/30분)
  4. 커스텀 입력: NumberInput 0~99분, 0~59초
  5. 설정 Drawer: 사운드 On/Off, 자동 반복(선택), 1분 미리 알림, 완료 알림 문구
- 반응형
  - ≥768px: 가로 레이아웃 (입력 + 디스플레이 병렬)
  - <768px: 세로 스택

## 6. 기능 요구사항
### 6.1 타이머 상태
```ts
type TimerStatus = "idle" | "running" | "paused" | "finished";
interface TimerState {
  status: TimerStatus;
  totalMs: number;      // 설정 시간
  remainingMs: number;
  startedAt?: number;   // Date.now()
  pausedAt?: number;
  settings: {
    presets: number[];        // ms 단위
    autoRepeat: boolean;
    preAlertMs: number | null;
    sound: "default" | "mute";
  };
}
```

### 6.2 동작 규칙
1. **시작**
   - `remainingMs`가 0이면 `totalMs`로 초기화
   - `startedAt = Date.now()` 저장 후 interval 가동 (최소 200ms tick / requestAnimationFrame)
2. **틱 업데이트**
   - `remaining = Math.max(total - (now - startedAt), 0)`
   - 0이 되면 `finished` 상태, 알림/사운드 호출, autoRepeat 케이스면 `status=running` + `startedAt` 재설정
3. **일시정지**
   - Interval 해제, `remainingMs` 확정, `pausedAt` 저장
4. **재개**
   - `startedAt = Date.now() - (total - remaining)`
5. **리셋**
   - 상태 `idle`, `remainingMs = totalMs`, interval 제거
6. **프리셋 변경**
   - `totalMs/remainingMs` 갱신, 상태 `idle`, UI 즉시 반영
7. **알림**
   - `Notification API` 사용, 권한 없으면 `notifications.show`
   - `preAlertMs`가 있고 해당 시점이 지나면 별도 토스트 및 RingProgress 색상 전환
8. **Persist**
   - Zustand + `persist` 미들웨어, `key: dashboard-timer`
   - 새로고침 후에도 실행 중이던 타이머를 복원 (`remaining = remaining - (now - lastSavedAt)`)

## 7. 기술 설계
- **State 관리**: `client/src/store/timerStore.ts`
  - actions: `setPreset`, `startTimer`, `pauseTimer`, `resumeTimer`, `resetTimer`, `tick`, `setSettings`
- **Hook**: `useTimer()` → store selector + derived 계산 (progress %, formatted time, isRunning)
- **Components**
  - `TimerWidgetCard.tsx` (Entry, 헤더/레이아웃)
  - `TimerDisplay.tsx` (RingProgress + Text)
  - `TimerControls.tsx` (Start/Pause/Reset)
  - `TimerPresets.tsx` (Chips + custom input)
  - `TimerSettingsDrawer.tsx`
- **Notification**
  - `useEffect`로 `status === "finished"`일 때 브라우저 권한 체크 → 허용 시 native, 미허용 시 Mantine notifications
  - 사운드: 간단한 mp3 파일 (public/sounds/timer-complete.mp3) + `<audio>` ref
- **Interval 정확도**
  - `requestAnimationFrame` + delta 계산
  - 탭 비활성화 시 fallback: `setInterval(1000)` + `document.visibilityState` 감지
- **Accessibility**
  - 버튼 aria-label, role="timer", 완료 시 `alert` 역할 텍스트

## 8. API/데이터
- 서버 통신 없음 (local-only)
- 향후 확장: 사용자별 타이머 설정 저장 API (`/api/settings/timer`)

## 9. 보안/성능
- 위젯 단일 interval만 유지, 언마운트 시 정리
- 알림은 사용자 허용 시에만
- 오디오 재생은 사용자 인터랙션 이후에만 가능하므로 최초 Start 시 `<audio>` load

## 10. 구현 단계 및 일정 (예상 2~3일)
1. **상태 / Store 구축** (0.5일)
2. **UI 골격 (위젯 카드 + 디스플레이)** (0.5일)
3. **컨트롤 + 로직 연결** (0.5일)
4. **설정 Drawer + 프리셋/커스텀 입력** (0.5일)
5. **알림/사운드 + 영속화 + QA** (0.5~1일)

## 11. 테스트 시나리오
1. 10분 타이머 시작 → 5분 경과 후 일시정지/재개 → 0 초 도달 시 알림
2. 프리셋 클릭 후 즉시 시작 → 정확한 시간으로 세팅되는지 확인
3. 1분 남음 알림 옵션 켰을 때 미리 알림 발생/색상 변화
4. 페이지 새로고침 후에도 남은 시간이 유지되는지
5. 다크 모드에서 대비 유지 (텍스트/배경/프로그레스 라인)
6. 모바일(375px)에서 레이아웃 깨짐 없는지

## 12. 오픈 이슈 / 후속 과제
- 다중 타이머 동시 실행 (향후)
- 서버 동기화 및 브라우저 외 기기 알림
- 캘린더/루틴과 연결해 자동 타이머 시작
