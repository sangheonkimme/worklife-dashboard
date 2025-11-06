# 스톱워치 기능 구현 계획서

## 개요
포모도로 타이머 옆에 스톱워치 기능을 추가합니다.
시간을 측정하고, 랩 타임을 기록하며, 작업 시간을 추적할 수 있는 인터랙티브 위젯입니다.

## 주요 요구사항

### 1. UI/UX 요구사항

#### 레이아웃
- **위치**: 대시보드 페이지 "주요 기능" 섹션의 PomodoroTimerCard 옆
- **크기**: 기존 PomodoroTimerCard와 동일한 크기
- **그리드**: SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} 구조 유지

#### 카드 디자인
- **기본 상태** (스톱워치 정지):
  - 상단: 스톱워치 아이콘 + "스톱워치" 제목
  - 중앙: 큰 타이머 디스플레이 (00:00:00)
  - 하단: 시작 버튼 + 간단한 설명
  - 색상: 파란색 테마

- **실행 상태** (스톱워치 작동 중):
  - 경과 시간 표시 (시:분:초.밀리초)
  - 원형 프로그레스 바 (애니메이션)
  - 일시정지/재개 버튼
  - 랩 타임 기록 버튼
  - 리셋 버튼
  - 최근 3개 랩 타임 표시

- **스타일링**:
  - 호버 시 살짝 올라오는 애니메이션
  - 그림자 효과
  - 반응형 디자인 (모바일 대응)

#### 시각적 피드백
- **실행 상태**: 파란색 (#3498DB)
- **일시정지 상태**: 노란색 (#F39C12)
- **정지 상태**: 회색 (#95A5A6)
- 랩 타임 기록 시 짧은 애니메이션 효과
- 1시간 초과 시 색상 변경 (주황색, 경고)

### 2. 기능 요구사항

#### 기본 기능
- **타이머 제어**:
  - 시작 (Start): 0초부터 카운트업 시작
  - 일시정지 (Pause): 현재 시간에서 일시정지
  - 재개 (Resume): 일시정지한 시점부터 재개
  - 리셋 (Reset): 0초로 돌아가고 모든 랩 타임 삭제
  - 랩 타임 기록 (Lap): 현재 시간을 기록하고 계속 진행

- **랩 타임 관리**:
  - 랩 타임 기록 (최대 999개)
  - 각 랩별 소요 시간 계산
  - 랩 타임 리스트 표시
  - 가장 빠른/느린 랩 하이라이트
  - 평균 랩 타임 계산

- **통계 기록**:
  - 총 측정 시간
  - 총 측정 횟수
  - 평균 측정 시간
  - 최장 측정 시간
  - 오늘 측정 횟수

#### 고급 기능 (Phase 2)
- **세션 저장**:
  - 스톱워치 세션 저장 (이름, 태그, 메모)
  - 작업/프로젝트 연동
  - 히스토리 조회

- **알림 기능**:
  - 특정 시간 도달 시 알림 (예: 1시간)
  - 목표 시간 설정 및 알림

- **내보내기**:
  - 랩 타임 CSV 내보내기
  - 세션 데이터 JSON 내보내기

### 3. 기술 스택

#### 프론트엔드
- **컴포넌트**:
  - `client/src/components/dashboard/StopwatchCard.tsx` (메인 카드)
  - `client/src/components/stopwatch/StopwatchWidget.tsx` (플로팅 위젯)
  - `client/src/components/stopwatch/LapList.tsx` (랩 타임 리스트)
  - `client/src/components/stopwatch/StopwatchDisplay.tsx` (시간 표시)
  - `client/src/components/stopwatch/StatsPanel.tsx` (통계)

- **상태 관리**:
  - **Zustand**: 스톱워치 상태 (실행 중, 일시정지, 경과 시간, 랩 타임)
    - `client/src/store/useStopwatchStore.ts`
  - **TanStack Query**: 서버 상태 (저장된 세션, 통계)

- **API 서비스**: `client/src/services/api/stopwatchApi.ts`

- **스타일**: Mantine 컴포넌트 활용
  - `Card`, `Button`, `RingProgress`, `Text`, `Modal`
  - `ActionIcon`, `ThemeIcon`, `Stack`, `Group`, `ScrollArea`
  - `Table`, `Badge`

- **아이콘**: Tabler Icons
  - `IconStopwatch`, `IconPlayerPlay`, `IconPlayerPause`, `IconPlayerStop`
  - `IconFlag`, `IconRefresh`, `IconSettings`, `IconChartBar`

#### 백엔드
- **데이터베이스**: Prisma 스키마에 모델 추가
  - `StopwatchSession` (세션 기록)
  - `StopwatchLap` (랩 타임)
  - `StopwatchStats` (통계 집계)

- **API 엔드포인트**: `/api/stopwatch`
  - `GET /api/stopwatch/stats` - 통계 조회
  - `GET /api/stopwatch/sessions` - 세션 히스토리
  - `POST /api/stopwatch/sessions` - 세션 저장
  - `DELETE /api/stopwatch/sessions/:id` - 세션 삭제
  - `GET /api/stopwatch/sessions/:id` - 세션 상세 조회

- **검증**: Zod 스키마로 요청 검증

## 데이터베이스 스키마

```prisma
// 스톱워치 세션 기록
model StopwatchSession {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  duration    Int      // 총 경과 시간 (밀리초)
  lapCount    Int      @default(0) // 랩 개수

  // 선택적: 작업 연동
  taskName    String?
  tags        String[] // 태그 배열
  notes       String?  @db.Text

  // 메타데이터
  startedAt   DateTime @default(now())
  completedAt DateTime?

  // 랩 타임
  laps        StopwatchLap[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId, startedAt])
  @@map("stopwatch_sessions")
}

// 랩 타임 기록
model StopwatchLap {
  id               String   @id @default(cuid())
  sessionId        String
  session          StopwatchSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  lapNumber        Int      // 랩 번호 (1, 2, 3...)
  totalTime        Int      // 전체 경과 시간 (밀리초)
  lapTime          Int      // 이번 랩 소요 시간 (밀리초)

  createdAt        DateTime @default(now())

  @@index([sessionId, lapNumber])
  @@map("stopwatch_laps")
}

// User 모델에 관계 추가
model User {
  // ... 기존 필드들
  stopwatchSessions  StopwatchSession[]
}
```

## API 명세

### 1. GET /api/stopwatch/stats
**쿼리 파라미터**:
- `period`: 'today' | 'week' | 'month' | 'all'

**응답**:
```json
{
  "success": true,
  "data": {
    "totalSessions": 50,
    "totalDuration": 180000000, // 밀리초 (50시간)
    "averageDuration": 3600000, // 밀리초 (1시간)
    "longestDuration": 7200000, // 밀리초 (2시간)
    "todaySessions": 3,
    "todayDuration": 10800000 // 밀리초 (3시간)
  }
}
```

### 2. GET /api/stopwatch/sessions
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
        "duration": 3600000,
        "lapCount": 5,
        "taskName": "프로젝트 개발",
        "tags": ["개발", "코딩"],
        "startedAt": "2025-01-01T09:00:00Z",
        "completedAt": "2025-01-01T10:00:00Z",
        "laps": [
          {
            "lapNumber": 1,
            "totalTime": 600000,
            "lapTime": 600000
          }
        ]
      }
    ],
    "total": 50,
    "hasMore": true
  }
}
```

### 3. POST /api/stopwatch/sessions
**요청**:
```json
{
  "duration": 3600000,
  "lapCount": 5,
  "taskName": "프로젝트 개발",
  "tags": ["개발"],
  "notes": "React 컴포넌트 개발 완료",
  "startedAt": "2025-01-01T09:00:00Z",
  "completedAt": "2025-01-01T10:00:00Z",
  "laps": [
    {
      "lapNumber": 1,
      "totalTime": 600000,
      "lapTime": 600000
    }
  ]
}
```
**응답**: 생성된 세션 객체

### 4. GET /api/stopwatch/sessions/:id
**응답**: 세션 상세 정보 (랩 타임 포함)

### 5. DELETE /api/stopwatch/sessions/:id
**응답**: 삭제 성공 메시지

## 컴포넌트 구조

```
StopwatchCard (대시보드 카드)
├── StopwatchDisplay (시간 표시)
│   ├── RingProgress (원형 진행바 - 애니메이션)
│   ├── TimeText (HH:MM:SS.mmm)
│   └── StatusIndicator (실행/일시정지/정지)
├── StopwatchControls (제어 버튼)
│   ├── StartButton
│   ├── PauseButton
│   ├── ResumeButton
│   ├── LapButton (기록)
│   └── ResetButton
├── LapList (랩 타임 리스트)
│   ├── LapItem (개별 랩)
│   ├── FastestLapBadge (가장 빠른 랩)
│   └── SlowestLapBadge (가장 느린 랩)
└── QuickStats (간단한 통계)
    ├── TotalTimeDisplay
    └── LapCountDisplay

StopwatchWidget (플로팅 위젯)
├── CompactDisplay (간소화된 시간 표시)
├── QuickControls (최소한의 버튼)
└── MaximizeButton (대시보드로 이동)
```

## Zustand 스토어 구조

```typescript
interface Lap {
  id: string;
  lapNumber: number;
  totalTime: number; // 밀리초
  lapTime: number; // 밀리초
  timestamp: string; // ISO string
}

interface StopwatchState {
  // 타이머 상태
  status: 'idle' | 'running' | 'paused';
  elapsedTime: number; // 밀리초
  laps: Lap[];

  // 세션 정보
  sessionStartedAt: string | null; // ISO string
  lastTickAt: string | null; // ISO string

  // 위젯 표시
  isWidgetVisible: boolean;

  // 액션
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  recordLap: () => void;
  tick: () => void; // 10ms마다 호출
  saveSession: (taskName?: string, tags?: string[], notes?: string) => Promise<void>;
  restoreSession: () => void; // 새로고침 시 복원
  setWidgetVisible: (visible: boolean) => void;

  // 통계 계산
  getFastestLap: () => Lap | null;
  getSlowestLap: () => Lap | null;
  getAverageLapTime: () => number;
}
```

## 구현 순서

### Phase 1: 백엔드 구현 (DB + API)
1. **Prisma 스키마**
   - `StopwatchSession`, `StopwatchLap` 모델 추가
   - User 모델에 관계 추가
   - 마이그레이션 실행 (`db:generate` → `db:migrate`)

2. **Zod 검증**
   - `validators/stopwatchValidator.ts` 생성
   - 세션 생성/업데이트 스키마
   - 랩 타임 스키마

3. **서비스 레이어**
   - `services/stopwatchService.ts` 구현
   - CRUD 작업 (세션, 랩)
   - 통계 계산 로직

4. **컨트롤러**
   - `controllers/stopwatchController.ts` 구현
   - 모든 엔드포인트 핸들러

5. **라우트**
   - `routes/stopwatchRoutes.ts` 생성
   - `server/src/index.ts`에 라우트 등록

### Phase 2: 프론트엔드 - 기본 스톱워치 (카드 내 실행)
1. **타입 정의**
   - `client/src/types/stopwatch.ts`
   - Session, Lap, Stats 타입

2. **Zustand 스토어**
   - `client/src/store/useStopwatchStore.ts`
   - 스톱워치 로직 구현
   - localStorage 연동 (persist)

3. **API 서비스**
   - `client/src/services/api/stopwatchApi.ts`
   - TanStack Query 훅 생성

4. **기본 컴포넌트**
   - `StopwatchCard.tsx` (메인 카드)
   - 타이머 디스플레이
   - 시작/일시정지/재개/리셋/랩 버튼
   - 랩 타임 리스트 (최근 3개)

5. **대시보드 통합**
   - `DashboardPage.tsx`에 카드 추가
   - 포모도로 타이머 카드 옆에 배치

### Phase 3: 플로팅 위젯
1. **위젯 컴포넌트**
   - `StopwatchWidget.tsx` 구현
   - 간소화된 UI
   - 다른 페이지에서도 표시

2. **위젯 도크 통합**
   - WidgetDock에 스톱워치 아이콘 추가
   - 클릭 시 위젯 토글

### Phase 4: 고급 기능
1. **세션 저장 모달**
   - `SaveSessionModal.tsx` 구현
   - 작업명, 태그, 메모 입력

2. **히스토리 패널**
   - `HistoryPanel.tsx` (선택적)
   - 과거 세션 조회
   - 랩 타임 상세 보기

3. **통계 대시보드**
   - `StatsPanel.tsx` (선택적)
   - 차트/그래프
   - 분석 데이터

### Phase 5: 테스트 및 최적화
1. API 엔드포인트 테스트
2. 타이머 정확도 검증 (밀리초 단위)
3. 성능 최적화
4. 반응형 디자인 테스트

## 예상 파일 목록

### 서버
- `server/prisma/schema.prisma` (수정)
- `server/src/validators/stopwatchValidator.ts` (신규)
- `server/src/services/stopwatchService.ts` (신규)
- `server/src/controllers/stopwatchController.ts` (신규)
- `server/src/routes/stopwatchRoutes.ts` (신규)
- `server/src/index.ts` (수정 - 라우트 등록)

### 클라이언트
- `client/src/types/stopwatch.ts` (신규)
- `client/src/store/useStopwatchStore.ts` (신규)
- `client/src/services/api/stopwatchApi.ts` (신규)
- `client/src/components/dashboard/StopwatchCard.tsx` (신규)
- `client/src/components/stopwatch/StopwatchWidget.tsx` (신규)
- `client/src/components/stopwatch/StopwatchDisplay.tsx` (신규)
- `client/src/components/stopwatch/LapList.tsx` (신규)
- `client/src/components/stopwatch/SaveSessionModal.tsx` (신규)
- `client/src/components/stopwatch/StatsPanel.tsx` (신규, 선택적)
- `client/src/components/widget-dock/StopwatchDockIcon.tsx` (신규)
- `client/src/pages/DashboardPage.tsx` (수정 - 카드 추가)

## UI 레이아웃 예시

### 대시보드 통합
```
┌───────────────────────────────────────────────────────────────────────────────┐
│                     주요 기능                                                  │
│                                                                                │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐           │
│  │ 포모도로 타이머  │  │   스톱워치       │  │  (추가 기능)     │           │
│  │                  │  │                  │  │                  │           │
│  │  🍅 25:00       │  │  ⏱️ 00:00:00    │  │                  │           │
│  │                  │  │                  │  │                  │           │
│  │  ▶ 시작하기     │  │  ▶ 시작하기     │  │                  │           │
│  │  오늘: 2회 완료  │  │  랩: 0개        │  │                  │           │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘           │
└───────────────────────────────────────────────────────────────────────────────┘
```

### 스톱워치 실행 중 (카드 내)
```
┌────────────────────────────────┐
│        스톱워치                 │
│                                │
│      ╭────────────╮            │
│     ╱  01:23:45   ╲           │
│    │      .678      │          │
│     ╲              ╱           │
│      ╰────────────╯            │
│                                │
│   [⏸ 일시정지] [🚩 랩] [⏹ 중지]│
│                                │
│   랩 타임:                      │
│   #3  00:15:30  ⚡ 가장 빠름  │
│   #2  00:18:45                │
│   #1  00:20:12  🐌 가장 느림  │
│                                │
│   총 3개 랩 | 평균 18:09       │
└────────────────────────────────┘
```

### 플로팅 위젯 (실행 중)
```
┌──────────────────────┐
│ ⏱️ 스톱워치          │
│                      │
│     01:23:45.678     │
│   ━━━━━━━━━━━━━━━━  │
│                      │
│  [⏸] [🚩] [⏹] [⤢]  │
└──────────────────────┘
```

## 타이머 로직 상세

### setInterval 사용 (10ms 단위)
```typescript
// useStopwatchStore.ts에서
let intervalId: number | null = null;

const startTimer = () => {
  if (intervalId) return; // 이미 실행 중

  const now = new Date().toISOString();
  set({
    status: 'running',
    sessionStartedAt: get().sessionStartedAt || now,
    lastTickAt: now
  });

  // 10ms마다 업데이트 (더 정확한 시간 측정)
  intervalId = window.setInterval(() => {
    get().tick();
  }, 10);
};

const tick = () => {
  set((state) => ({
    elapsedTime: state.elapsedTime + 10,
    lastTickAt: new Date().toISOString()
  }));
};

const pauseTimer = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  set({ status: 'paused' });
};

const resetTimer = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  set({
    status: 'idle',
    elapsedTime: 0,
    laps: [],
    sessionStartedAt: null,
    lastTickAt: null,
  });
};

const recordLap = () => {
  const { elapsedTime, laps } = get();
  const lapNumber = laps.length + 1;
  const lastLapTime = laps.length > 0 ? laps[laps.length - 1].totalTime : 0;

  const newLap: Lap = {
    id: `lap-${Date.now()}`,
    lapNumber,
    totalTime: elapsedTime,
    lapTime: elapsedTime - lastLapTime,
    timestamp: new Date().toISOString(),
  };

  set((state) => ({
    laps: [...state.laps, newLap],
  }));
};
```

### 세션 복원 (새로고침 시)
```typescript
const restoreSession = () => {
  const { status, sessionStartedAt, lastTickAt, elapsedTime } = get();

  // running 또는 paused 상태이고 sessionStartedAt이 있으면 복원
  if ((status === 'running' || status === 'paused') && sessionStartedAt && lastTickAt) {
    const now = new Date();
    const lastTick = new Date(lastTickAt);
    const elapsedMs = now.getTime() - lastTick.getTime();

    // 경과 시간만큼 elapsedTime에 추가
    const newElapsedTime = elapsedTime + elapsedMs;

    console.log('[Stopwatch] Session restored:', {
      status,
      elapsedMs,
      oldElapsedTime: elapsedTime,
      newElapsedTime,
    });

    set({ elapsedTime: newElapsedTime });

    // running 상태였다면 타이머 재개
    if (status === 'running') {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }

      const now = new Date().toISOString();
      set({ lastTickAt: now });

      intervalId = window.setInterval(() => {
        get().tick();
      }, 10);

      console.log('[Stopwatch] Timer resumed after page reload');
    }
  }
};
```

### 세션 저장
```typescript
const saveSession = async (taskName?: string, tags?: string[], notes?: string) => {
  const { elapsedTime, laps, sessionStartedAt } = get();

  if (!sessionStartedAt) {
    console.error('No session to save');
    return;
  }

  try {
    await stopwatchApi.createSession({
      duration: elapsedTime,
      lapCount: laps.length,
      taskName,
      tags,
      notes,
      startedAt: sessionStartedAt,
      completedAt: new Date().toISOString(),
      laps: laps.map(lap => ({
        lapNumber: lap.lapNumber,
        totalTime: lap.totalTime,
        lapTime: lap.lapTime,
      })),
    });

    console.log('Stopwatch session saved successfully');

    // 저장 후 리셋
    get().resetTimer();
  } catch (error) {
    console.error('Failed to save stopwatch session:', error);
    throw error;
  }
};
```

## 시간 포맷팅

```typescript
/**
 * 밀리초를 HH:MM:SS.mmm 형식으로 변환
 */
const formatTime = (milliseconds: number): string => {
  const hours = Math.floor(milliseconds / 3600000);
  const minutes = Math.floor((milliseconds % 3600000) / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  const ms = Math.floor((milliseconds % 1000) / 10); // 10ms 단위

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms
      .toString()
      .padStart(2, '0')}`;
  }

  return `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
};

/**
 * 간소화된 포맷 (MM:SS)
 */
const formatTimeSimple = (milliseconds: number): string => {
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);

  return `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;
};
```

## 랩 타임 통계

```typescript
/**
 * 가장 빠른 랩 찾기
 */
const getFastestLap = (): Lap | null => {
  const { laps } = get();
  if (laps.length === 0) return null;

  return laps.reduce((fastest, lap) =>
    lap.lapTime < fastest.lapTime ? lap : fastest
  );
};

/**
 * 가장 느린 랩 찾기
 */
const getSlowestLap = (): Lap | null => {
  const { laps } = get();
  if (laps.length === 0) return null;

  return laps.reduce((slowest, lap) =>
    lap.lapTime > slowest.lapTime ? lap : slowest
  );
};

/**
 * 평균 랩 타임 계산
 */
const getAverageLapTime = (): number => {
  const { laps } = get();
  if (laps.length === 0) return 0;

  const totalLapTime = laps.reduce((sum, lap) => sum + lap.lapTime, 0);
  return totalLapTime / laps.length;
};
```

## 추가 고려사항

### 향후 개선 가능 기능
1. **작업 관리 통합**
   - 특정 작업/프로젝트에 스톱워치 연결
   - 작업별 총 시간 추적
   - 시간 기반 청구 (타임 트래킹)

2. **카운트다운 타이머 모드**
   - 스톱워치와 카운트다운 토글
   - 목표 시간 설정
   - 알림 기능

3. **다중 스톱워치**
   - 여러 개의 스톱워치 동시 실행
   - 각각 다른 작업 추적

4. **분석 대시보드**
   - 작업 패턴 분석
   - 시간대별 생산성
   - 주간/월간 리포트

5. **통합 기능**
   - 캘린더 연동
   - 할 일 목록 연동
   - 시간 추적 앱 연동 (Toggl, RescueTime 등)

### 성능 최적화
- `requestAnimationFrame` 사용 고려 (더 정확한 애니메이션)
- 랩 타임 리스트 가상화 (많은 랩 타임 처리)
- Web Worker로 타이머 로직 분리
- 메모이제이션을 통한 불필요한 재렌더링 방지

### 접근성
- 키보드 단축키 지원 (Space: 시작/일시정지, L: 랩, R: 리셋)
- ARIA 라벨 추가
- 고대비 모드 지원
- 스크린 리더 친화적인 시간 표시

### 데이터 프라이버시
- 사용자 데이터는 개인 정보로 취급
- 로컬 우선 저장 (오프라인 지원)
- 세션 삭제 기능 제공

## 예상 작업 시간

### Phase 1: 백엔드 (2-3시간)
- Prisma 스키마: 30분
- 검증 + 서비스: 1시간
- 컨트롤러 + 라우트: 1시간
- 테스트: 30분

### Phase 2: 프론트엔드 기본 (4-5시간)
- 타입 + 스토어: 1.5시간
- API 서비스: 30분
- 스톱워치 카드 컴포넌트: 2시간
- 랩 타임 리스트: 1시간
- 대시보드 통합: 30분

### Phase 3: 플로팅 위젯 (1-2시간)
- 위젯 컴포넌트: 1시간
- 위젯 도크 통합: 30분

### Phase 4: 고급 기능 (2-3시간)
- 세션 저장 모달: 1시간
- 히스토리 패널: 1시간
- 통계 패널: 1시간

### Phase 5: 테스트 및 버그 수정 (1-2시간)

**총 예상 시간**: 10-15시간

## 완료 조건 (MVP)

### 필수 기능
- [ ] 스톱워치 카드가 대시보드에 표시됨
- [ ] 시작/일시정지/재개/리셋 기능 작동
- [ ] 밀리초 단위 시간 표시 (HH:MM:SS.mmm)
- [ ] 랩 타임 기록 기능
- [ ] 최근 랩 타임 리스트 표시 (최소 3개)
- [ ] 가장 빠른/느린 랩 하이라이트
- [ ] 플로팅 위젯으로 다른 페이지에서도 접근 가능
- [ ] 새로고침 시 세션 복원
- [ ] 세션 저장 기능

### 선택적 기능 (Phase 2+)
- [ ] 세션 히스토리 조회
- [ ] 통계 대시보드
- [ ] 작업 연동
- [ ] CSV 내보내기
- [ ] 목표 시간 알림

## 참고 자료

### 디자인 참고
- [Online Stopwatch](https://www.online-stopwatch.com/)
- [Stopwatch Timer](https://stopwatchtimer.net/)
- iOS/Android 기본 스톱워치 앱

### 기술 참고
- [Performance API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Performance)
- [requestAnimationFrame - MDN](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)
- [Web Workers - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)

## 최소 기능 우선 구현 (MVP)

첫 번째 버전에서는 다음 기능만 구현:
1. ✅ 카드 내에서 스톱워치 실행
2. ✅ 시작/일시정지/재개/리셋 버튼
3. ✅ 밀리초 단위 시간 표시
4. ✅ 랩 타임 기록 및 리스트 표시
5. ✅ 가장 빠른/느린 랩 하이라이트
6. ✅ 플로팅 위젯
7. ✅ 새로고침 시 세션 복원
8. ✅ 기본 세션 저장

히스토리나 통계는 Phase 2에서 추가하여 점진적으로 개선합니다.

## 포모도로 타이머와의 차이점

| 기능 | 포모도로 타이머 | 스톱워치 |
|------|----------------|----------|
| 타이머 방식 | 카운트다운 (25분 → 0) | 카운트업 (0 → ∞) |
| 주요 목적 | 집중 시간 관리 | 시간 측정 및 추적 |
| 자동 전환 | 집중 ↔ 휴식 자동 전환 | 없음 (수동 제어) |
| 기록 단위 | 세션 (완료/미완료) | 랩 타임 |
| 알림 | 세션 완료 시 | 없음 (선택적) |
| 색상 테마 | 빨간색/녹색 | 파란색 |
| 진행률 표시 | 원형 진행바 (감소) | 원형 애니메이션 (무한) |

## 포모도로 타이머와 병행 사용 시나리오

1. **포모도로로 집중 시간 관리, 스톱워치로 세부 작업 측정**
   - 포모도로: 25분 집중 시간 설정
   - 스톱워치: 그 안에서 각 작업의 실제 소요 시간 측정

2. **다른 용도로 활용**
   - 포모도로: 공부/업무용
   - 스톱워치: 운동/요리 등 일상 활동

3. **데이터 분석**
   - 포모도로 완료 횟수와 스톱워치 측정 시간을 비교
   - 실제 생산 시간 분석
