# 포모도로 타이머 기능 구현 계획서

## 개요
대시보드의 "주요 기능" 섹션에 포모도로 타이머 카드를 추가합니다.
25분 집중 + 5분 휴식 사이클을 제공하며, 카드 내에서 바로 실행 가능한 인터랙티브 위젯입니다.

## 주요 요구사항

### 1. UI/UX 요구사항

#### 레이아웃
- **위치**: 대시보드 페이지 "주요 기능" 섹션의 SalaryCalculatorCard 옆
- **크기**: 기존 SalaryCalculatorCard와 동일한 크기
- **그리드**: SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} 구조 유지

#### 카드 디자인
- **기본 상태** (타이머 정지):
  - 상단: 포모도로 아이콘 + "포모도로 타이머" 제목
  - 중앙: 큰 타이머 디스플레이 (25:00)
  - 하단: 시작 버튼 + 간단한 설명
  - 색상: 빨간색 테마 (토마토 연상)

- **실행 상태** (타이머 작동 중):
  - 진행 상황을 보여주는 원형 프로그레스 바
  - 남은 시간 표시 (분:초)
  - 일시정지/재개 버튼
  - 중지 버튼
  - 현재 세션 타입 표시 (집중/휴식)

- **스타일링**:
  - 호버 시 살짝 올라오는 애니메이션
  - 그림자 효과
  - 반응형 디자인 (모바일 대응)

#### 시각적 피드백
- **집중 세션**: 빨간색/토마토색 (#E74C3C)
- **휴식 세션**: 녹색 (#27AE60)
- **일시정지 상태**: 노란색 (#F39C12)
- 타이머 완료 시 브라우저 알림 (Notification API)
- 소리 알림 (선택적, 토글 가능)

### 2. 기능 요구사항

#### 기본 기능
- **포모도로 사이클**:
  - 집중 시간: 25분 (1500초)
  - 짧은 휴식: 5분 (300초)
  - 긴 휴식: 15분 (900초, 4회 완료 후)
  - 자동 전환 옵션 (선택적)

- **타이머 제어**:
  - 시작 (Start)
  - 일시정지 (Pause)
  - 재개 (Resume)
  - 중지/리셋 (Stop/Reset)

- **통계 기록**:
  - 오늘 완료한 포모도로 개수
  - 총 집중 시간
  - 연속 달성 일수 (streak)
  - 주간/월간 통계

#### 고급 기능 (Phase 2)
- **설정 커스터마이징**:
  - 집중 시간 조정 (15/25/45분)
  - 휴식 시간 조정 (5/10/15분)
  - 자동 시작 여부
  - 소리 알림 on/off
  - 알림 타입 선택

- **작업 연동**:
  - 특정 작업/프로젝트에 포모도로 연결
  - 태그 기능
  - 메모 기능

### 3. 기술 스택

#### 프론트엔드
- **컴포넌트**:
  - `client/src/components/dashboard/PomodoroTimerCard.tsx` (메인 카드)
  - `client/src/components/pomodoro/Timer.tsx` (타이머 로직)
  - `client/src/components/pomodoro/TimerDisplay.tsx` (UI)
  - `client/src/components/pomodoro/SettingsModal.tsx` (설정)
  - `client/src/components/pomodoro/StatsPanel.tsx` (통계)

- **상태 관리**:
  - **Zustand**: 타이머 상태 (실행 중, 일시정지, 남은 시간)
    - `client/src/store/usePomodoroStore.ts`
  - **TanStack Query**: 서버 상태 (통계, 히스토리)

- **API 서비스**: `client/src/services/api/pomodoroApi.ts`

- **스타일**: Mantine 컴포넌트 활용
  - `Card`, `Button`, `RingProgress`, `Text`, `Modal`
  - `ActionIcon`, `ThemeIcon`, `Stack`, `Group`

- **아이콘**: Tabler Icons
  - `IconTomato`, `IconPlayerPlay`, `IconPlayerPause`, `IconPlayerStop`
  - `IconSettings`, `IconChartBar`

#### 백엔드
- **데이터베이스**: Prisma 스키마에 모델 추가
  - `PomodoroSession` (세션 기록)
  - `PomodoroSettings` (사용자별 설정)
  - `PomodoroStats` (통계 집계)

- **API 엔드포인트**: `/api/pomodoro`
  - `GET /api/pomodoro/stats` - 통계 조회
  - `GET /api/pomodoro/sessions` - 세션 히스토리
  - `POST /api/pomodoro/sessions` - 세션 기록
  - `GET /api/pomodoro/settings` - 설정 조회
  - `PUT /api/pomodoro/settings` - 설정 업데이트

- **검증**: Zod 스키마로 요청 검증

## 데이터베이스 스키마

```prisma
// 포모도로 세션 기록
model PomodoroSession {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  type        String   // 'focus' | 'short_break' | 'long_break'
  duration    Int      // 예정 시간 (초)
  completed   Boolean  @default(false) // 완료 여부
  startedAt   DateTime @default(now())
  completedAt DateTime? // 실제 완료 시간

  // 선택적: 작업 연동
  taskName    String?
  tags        String[] // 태그 배열
  notes       String?  @db.Text

  createdAt   DateTime @default(now())

  @@index([userId, startedAt])
  @@map("pomodoro_sessions")
}

// 사용자별 설정
model PomodoroSettings {
  id                String   @id @default(cuid())
  userId            String   @unique
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  focusDuration     Int      @default(1500) // 25분 (초)
  shortBreakDuration Int     @default(300)  // 5분 (초)
  longBreakDuration Int      @default(900)  // 15분 (초)
  longBreakInterval Int      @default(4)    // 몇 번마다 긴 휴식

  autoStartBreak    Boolean  @default(false)
  autoStartFocus    Boolean  @default(false)
  soundEnabled      Boolean  @default(true)
  soundVolume       Int      @default(50)   // 0-100

  notificationEnabled Boolean @default(true)

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@map("pomodoro_settings")
}

// User 모델에 관계 추가
model User {
  // ... 기존 필드들
  pomodoroSessions  PomodoroSession[]
  pomodoroSettings  PomodoroSettings?
}
```

## API 명세

### 1. GET /api/pomodoro/stats
**쿼리 파라미터**:
- `period`: 'today' | 'week' | 'month' | 'all'

**응답**:
```json
{
  "success": true,
  "data": {
    "totalSessions": 24,
    "completedSessions": 20,
    "totalFocusTime": 36000, // 초
    "todayCompleted": 4,
    "currentStreak": 7, // 연속 일수
    "longestStreak": 15
  }
}
```

### 2. GET /api/pomodoro/sessions
**쿼리 파라미터**:
- `limit`: number (기본값: 50)
- `offset`: number (기본값: 0)
- `startDate`: ISO string
- `endDate`: ISO string

**응답**:
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "clx123...",
        "type": "focus",
        "duration": 1500,
        "completed": true,
        "startedAt": "2025-01-01T09:00:00Z",
        "completedAt": "2025-01-01T09:25:00Z",
        "taskName": "프로젝트 기획",
        "tags": ["개발", "기획"]
      }
    ],
    "total": 100,
    "hasMore": true
  }
}
```

### 3. POST /api/pomodoro/sessions
**요청**:
```json
{
  "type": "focus",
  "duration": 1500,
  "completed": true,
  "startedAt": "2025-01-01T09:00:00Z",
  "completedAt": "2025-01-01T09:25:00Z",
  "taskName": "프로젝트 기획",
  "tags": ["개발"],
  "notes": "API 설계 완료"
}
```
**응답**: 생성된 세션 객체

### 4. GET /api/pomodoro/settings
**응답**:
```json
{
  "success": true,
  "data": {
    "id": "clx123...",
    "focusDuration": 1500,
    "shortBreakDuration": 300,
    "longBreakDuration": 900,
    "longBreakInterval": 4,
    "autoStartBreak": false,
    "autoStartFocus": false,
    "soundEnabled": true,
    "soundVolume": 50,
    "notificationEnabled": true
  }
}
```

### 5. PUT /api/pomodoro/settings
**요청**:
```json
{
  "focusDuration": 2700, // 45분
  "soundEnabled": false
}
```
**응답**: 업데이트된 설정 객체

## 컴포넌트 구조

```
PomodoroTimerCard (대시보드 카드)
├── TimerDisplay (타이머 UI)
│   ├── RingProgress (원형 진행바)
│   ├── TimeText (시간 표시)
│   └── SessionTypeIndicator (세션 타입)
├── TimerControls (제어 버튼)
│   ├── StartButton
│   ├── PauseButton
│   ├── StopButton
│   └── SettingsButton
├── QuickStats (간단한 통계)
│   └── TodayCompletedBadge
└── SettingsModal (설정 모달)
    ├── DurationSettings
    ├── AutoStartToggles
    ├── SoundSettings
    └── NotificationSettings
```

## Zustand 스토어 구조

```typescript
interface PomodoroState {
  // 타이머 상태
  status: 'idle' | 'running' | 'paused';
  sessionType: 'focus' | 'short_break' | 'long_break';
  remainingTime: number; // 초
  totalDuration: number; // 초
  completedSessions: number; // 오늘 완료한 포모도로 수

  // 설정
  settings: {
    focusDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
    longBreakInterval: number;
    autoStartBreak: boolean;
    autoStartFocus: boolean;
    soundEnabled: boolean;
    notificationEnabled: boolean;
  };

  // 액션
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  tick: () => void; // 1초마다 호출
  completeSession: () => void;
  switchSession: (type: SessionType) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  reset: () => void;
}
```

## 구현 순서

### Phase 1: 백엔드 구현 (DB + API)
1. **Prisma 스키마**
   - `PomodoroSession`, `PomodoroSettings` 모델 추가
   - User 모델에 관계 추가
   - 마이그레이션 실행 (`db:generate` → `db:migrate`)

2. **Zod 검증**
   - `validators/pomodoroValidator.ts` 생성
   - 세션 생성/업데이트 스키마
   - 설정 업데이트 스키마

3. **서비스 레이어**
   - `services/pomodoroService.ts` 구현
   - CRUD 작업 (세션, 설정)
   - 통계 계산 로직

4. **컨트롤러**
   - `controllers/pomodoroController.ts` 구현
   - 모든 엔드포인트 핸들러

5. **라우트**
   - `routes/pomodoroRoutes.ts` 생성
   - `server/src/index.ts`에 라우트 등록

### Phase 2: 프론트엔드 - 기본 타이머 (카드 내 실행)
1. **타입 정의**
   - `client/src/types/pomodoro.ts`
   - Session, Settings, Stats 타입

2. **Zustand 스토어**
   - `client/src/store/usePomodoroStore.ts`
   - 타이머 로직 구현
   - localStorage 연동 (persist)

3. **API 서비스**
   - `client/src/services/api/pomodoroApi.ts`
   - TanStack Query 훅 생성

4. **기본 컴포넌트**
   - `PomodoroTimerCard.tsx` (메인 카드)
   - 타이머 디스플레이
   - 시작/일시정지/중지 버튼
   - 간단한 통계 표시

5. **대시보드 통합**
   - `DashboardPage.tsx`에 카드 추가
   - 연봉 계산기 카드 옆에 배치

### Phase 3: 고급 기능
1. **설정 모달**
   - `SettingsModal.tsx` 구현
   - 시간 커스터마이징
   - 소리/알림 설정

2. **알림 기능**
   - 브라우저 Notification API
   - 권한 요청
   - 소리 재생

3. **통계 패널**
   - `StatsPanel.tsx` (선택적)
   - 차트/그래프
   - 히스토리

### Phase 4: 테스트 및 최적화
1. API 엔드포인트 테스트
2. 타이머 정확도 검증
3. 알림 동작 확인
4. 성능 최적화
5. 반응형 디자인 테스트

## 예상 파일 목록

### 서버
- `server/prisma/schema.prisma` (수정)
- `server/src/validators/pomodoroValidator.ts` (신규)
- `server/src/services/pomodoroService.ts` (신규)
- `server/src/controllers/pomodoroController.ts` (신규)
- `server/src/routes/pomodoroRoutes.ts` (신규)
- `server/src/index.ts` (수정)

### 클라이언트
- `client/src/types/pomodoro.ts` (신규)
- `client/src/store/usePomodoroStore.ts` (신규)
- `client/src/services/api/pomodoroApi.ts` (신규)
- `client/src/components/dashboard/PomodoroTimerCard.tsx` (신규)
- `client/src/components/pomodoro/TimerDisplay.tsx` (신규)
- `client/src/components/pomodoro/TimerControls.tsx` (신규)
- `client/src/components/pomodoro/SettingsModal.tsx` (신규)
- `client/src/components/pomodoro/StatsPanel.tsx` (신규, 선택적)
- `client/src/pages/DashboardPage.tsx` (수정)
- `client/src/utils/notifications.ts` (신규, 알림 유틸)
- `client/src/utils/audio.ts` (신규, 소리 재생)

## UI 레이아웃 예시

### 대시보드 통합
```
┌───────────────────────────────────────────────────────────────────────┐
│                     주요 기능                                          │
│                                                                        │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐   │
│  │  연봉 계산기     │  │ 포모도로 타이머  │  │  (추가 기능)     │   │
│  │                  │  │                  │  │                  │   │
│  │  💰 계산기      │  │  🍅 25:00       │  │                  │   │
│  │                  │  │                  │  │                  │   │
│  │  실수령액 계산   │  │  ▶ 시작하기     │  │                  │   │
│  │                  │  │  오늘: 0회 완료  │  │                  │   │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘   │
└───────────────────────────────────────────────────────────────────────┘
```

### 타이머 실행 중 (카드 내)
```
┌──────────────────────────┐
│   포모도로 타이머         │
│                          │
│      ╭────────╮          │
│     ╱  24:35   ╲         │
│    │            │        │
│     ╲          ╱         │
│      ╰────────╯          │
│                          │
│      🔴 집중 세션        │
│                          │
│   [⏸ 일시정지] [⏹ 중지] │
│                          │
│   오늘: 2회 완료 🎯      │
└──────────────────────────┘
```

## 타이머 로직 상세

### setInterval 사용
```typescript
// usePomodoroStore.ts에서
let intervalId: NodeJS.Timeout | null = null;

const startTimer = () => {
  if (intervalId) return; // 이미 실행 중

  set({ status: 'running' });

  intervalId = setInterval(() => {
    get().tick();
  }, 1000);
};

const tick = () => {
  const { remainingTime } = get();

  if (remainingTime <= 0) {
    get().completeSession();
    return;
  }

  set({ remainingTime: remainingTime - 1 });
};

const pauseTimer = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  set({ status: 'paused' });
};

const stopTimer = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  set({
    status: 'idle',
    remainingTime: get().settings.focusDuration,
  });
};
```

### 세션 완료 처리
```typescript
const completeSession = async () => {
  const { sessionType, totalDuration, settings } = get();

  // 1. 서버에 세션 기록
  await pomodoroApi.createSession({
    type: sessionType,
    duration: totalDuration,
    completed: true,
    startedAt: /* 시작 시간 */,
    completedAt: new Date().toISOString(),
  });

  // 2. 알림 표시
  if (settings.notificationEnabled) {
    showNotification(
      sessionType === 'focus'
        ? '집중 시간 완료! 휴식 시간입니다.'
        : '휴식 완료! 다음 집중 시간을 시작하세요.'
    );
  }

  // 3. 소리 재생
  if (settings.soundEnabled) {
    playCompletionSound();
  }

  // 4. 다음 세션으로 전환
  const nextType = getNextSessionType();
  switchSession(nextType);

  // 5. 자동 시작 설정 확인
  if (
    (nextType === 'focus' && settings.autoStartFocus) ||
    (nextType !== 'focus' && settings.autoStartBreak)
  ) {
    startTimer();
  }
};
```

## 브라우저 알림 구현

```typescript
// utils/notifications.ts

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const showNotification = (
  title: string,
  options?: NotificationOptions
) => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/pomodoro-icon.png',
      badge: '/badge-icon.png',
      ...options,
    });
  }
};
```

## 추가 고려사항

### 향후 개선 가능 기능
1. **작업 관리 통합**
   - 특정 작업/프로젝트에 포모도로 연결
   - 작업별 통계

2. **팀 기능**
   - 팀원과 함께 포모도로
   - 집중 시간 공유

3. **분석 대시보드**
   - 생산성 패턴 분석
   - 최적 집중 시간대 파악
   - 주간/월간 리포트

4. **다양한 모드**
   - 커스텀 타이머 (예: 52-17 방식)
   - 플립시계 모드
   - 풀스크린 모드

5. **통합 기능**
   - 캘린더 연동
   - 할 일 목록 연동
   - Slack/Discord 알림

### 성능 최적화
- `setInterval` 대신 `requestAnimationFrame` 고려 (더 정확한 타이머)
- Web Worker로 타이머 로직 분리 (메인 스레드 부하 감소)
- 페이지 비활성화 시 타이머 동작 유지 (Page Visibility API)

### 접근성
- 키보드 단축키 지원 (Space: 시작/일시정지, Esc: 중지)
- ARIA 라벨 추가
- 고대비 모드 지원
- 스크린 리더 친화적인 시간 표시

### 데이터 프라이버시
- 사용자 통계는 개인 정보로 취급
- 익명화된 집계 데이터만 서버 전송
- 로컬 우선 저장 (오프라인 지원)

## 예상 작업 시간

### Phase 1: 백엔드 (2-3시간)
- Prisma 스키마: 30분
- 검증 + 서비스: 1시간
- 컨트롤러 + 라우트: 1시간
- 테스트: 30분

### Phase 2: 프론트엔드 기본 (4-5시간)
- 타입 + 스토어: 1시간
- API 서비스: 30분
- 타이머 카드 컴포넌트: 2시간
- 대시보드 통합: 30분
- 스타일링: 1시간

### Phase 3: 고급 기능 (2-3시간)
- 설정 모달: 1시간
- 알림 기능: 1시간
- 통계 패널: 1시간

### Phase 4: 테스트 및 버그 수정 (1-2시간)

**총 예상 시간**: 9-13시간

## 완료 조건 (MVP)

### 필수 기능
- [ ] 포모도로 타이머 카드가 대시보드에 표시됨
- [ ] 25분 집중 타이머 시작/일시정지/중지 가능
- [ ] 5분 휴식 타이머로 자동 전환
- [ ] 남은 시간을 시각적으로 표시 (원형 프로그레스)
- [ ] 타이머 완료 시 브라우저 알림
- [ ] 오늘 완료한 포모도로 개수 표시
- [ ] 세션 기록이 서버에 저장됨

### 선택적 기능 (Phase 2+)
- [ ] 시간 커스터마이징 설정
- [ ] 자동 시작 옵션
- [ ] 소리 알림
- [ ] 통계 대시보드
- [ ] 작업 연동

## 참고 자료

### 포모도로 기법
- 기본 사이클: 25분 집중 + 5분 휴식
- 4회 완료 후: 15-30분 긴 휴식
- 집중 시간에는 한 가지 작업에만 몰입
- 휴식 시간에는 완전히 다른 활동 (스트레칭, 산책 등)

### 디자인 참고
- [Pomofocus](https://pomofocus.io/)
- [Marinara Timer](https://www.marinaratimer.com/)
- [Forest App](https://www.forestapp.cc/)

### 기술 참고
- [Notification API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
- [Page Visibility API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API)
- [Web Audio API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

## 최소 기능 우선 구현 (MVP)

첫 번째 버전에서는 다음 기능만 구현:
1. ✅ 카드 내에서 25분 타이머 실행
2. ✅ 시작/일시정지/중지 버튼
3. ✅ 원형 프로그레스로 진행 상황 표시
4. ✅ 완료 시 브라우저 알림
5. ✅ 오늘 완료 개수 표시
6. ✅ 서버에 세션 기록

설정이나 통계는 Phase 2에서 추가하여 점진적으로 개선합니다.
