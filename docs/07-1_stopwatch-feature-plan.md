# 스톱워치 기능 구현 계획서

## 개요
포모도로 타이머 옆에 스톱워치 기능을 추가합니다.
시간을 측정하고, 랩 타임을 기록하며, 작업 시간을 추적할 수 있는 인터랙티브 위젯입니다.

> **중요**: 스톱워치는 **프론트엔드 전용** 기능으로 구현합니다. 백엔드 저장 없이 localStorage만 사용합니다.

## 아키텍처 결정

### 왜 프론트엔드 전용인가?

**포모도로 타이머와의 차이**:
- **포모도로**: 생산성 추적, 장기 통계, 연속 달성 일수 → 서버 저장 필요 ✅
- **스톱워치**: 단순 시간 측정, 일회성 사용 → localStorage 충분 ✅

**프론트엔드 전용 장점**:
1. ✅ **서버 비용 절감**: 100명 × 100회 = 10,000 rows 방지
2. ✅ **빠른 성능**: 서버 통신 없음, 즉각 반응
3. ✅ **오프라인 지원**: 인터넷 없이도 작동
4. ✅ **개발 시간 단축**: 백엔드 구현 2-3시간 절약
5. ✅ **프라이버시**: 사용자 데이터가 서버로 전송 안 됨

**데이터 저장**:
- `localStorage`: 모든 스톱워치 상태 및 랩 타임
- `Zustand persist`: 자동으로 localStorage 동기화
- 선택적: IndexedDB (대용량 히스토리)

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

#### 기본 기능 (MVP)
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

- **플로팅 위젯**:
  - 다른 페이지에서도 계속 표시
  - 최소화/최대화 기능
  - 위젯 닫기

- **세션 복원**:
  - 페이지 새로고침 시 타이머 상태 복원
  - 랩 타임 유지

#### 고급 기능 (Phase 2)
- **로컬 히스토리**:
  - 과거 세션 조회 (localStorage)
  - 세션별 이름/메모 추가 가능
  - 히스토리 삭제

- **알림 기능**:
  - 특정 시간 도달 시 알림 (예: 1시간)
  - 목표 시간 설정 및 알림
  - 브라우저 알림

- **내보내기**:
  - 랩 타임 CSV 내보내기
  - 세션 데이터 JSON 내보내기

### 3. 기술 스택

#### 프론트엔드 (전체 구현)
- **컴포넌트**:
  - `client/src/components/dashboard/StopwatchCard.tsx` (메인 카드)
  - `client/src/components/stopwatch/StopwatchWidget.tsx` (플로팅 위젯)
  - `client/src/components/stopwatch/LapList.tsx` (랩 타임 리스트)
  - `client/src/components/stopwatch/StopwatchDisplay.tsx` (시간 표시)

- **상태 관리**:
  - **Zustand + persist**: 스톱워치 모든 상태
    - `client/src/store/useStopwatchStore.ts`
    - localStorage 자동 동기화
    - 타이머 상태, 랩 타임, 히스토리 등

- **스타일**: Mantine 컴포넌트
  - `Card`, `Button`, `RingProgress`, `Text`
  - `ActionIcon`, `ThemeIcon`, `Stack`, `Group`, `ScrollArea`
  - `Table`, `Badge`

- **아이콘**: Tabler Icons
  - `IconStopwatch`, `IconPlayerPlay`, `IconPlayerPause`, `IconPlayerStop`
  - `IconFlag`, `IconRefresh`, `IconMaximize`, `IconX`

#### 백엔드
- **없음** ❌ (프론트엔드 전용)

## 데이터 구조 (localStorage)

### Zustand Store 상태
```typescript
interface Lap {
  id: string;
  lapNumber: number;
  totalTime: number; // 밀리초
  lapTime: number; // 밀리초
  timestamp: string; // ISO string
}

interface SavedSession {
  id: string;
  duration: number; // 밀리초
  laps: Lap[];
  name?: string;
  notes?: string;
  createdAt: string; // ISO string
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

  // 로컬 히스토리 (최대 100개)
  savedSessions: SavedSession[];

  // 액션
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  recordLap: () => void;
  tick: () => void; // 10ms마다 호출

  // 히스토리 관리
  saveCurrentSession: (name?: string, notes?: string) => void;
  deleteSavedSession: (id: string) => void;
  clearHistory: () => void;

  // 세션 복원
  restoreSession: () => void;
  setWidgetVisible: (visible: boolean) => void;

  // 통계 계산
  getFastestLap: () => Lap | null;
  getSlowestLap: () => Lap | null;
  getAverageLapTime: () => number;
}
```

### localStorage 키
- `stopwatch-storage`: Zustand persist 데이터 (모든 상태)

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
├── LapList (랩 타임 리스트 - 최근 3개)
│   ├── LapItem (개별 랩)
│   ├── FastestLapBadge (가장 빠른 랩)
│   └── SlowestLapBadge (가장 느린 랩)
└── QuickStats (간단한 통계)
    ├── TotalTimeDisplay
    └── LapCountDisplay

StopwatchWidget (플로팅 위젯)
├── CompactDisplay (간소화된 시간 표시)
├── QuickControls (최소한의 버튼)
├── MaximizeButton (대시보드로 이동)
└── CloseButton (위젯 닫기)
```

## 구현 순서

### Phase 1: 기본 스톱워치 (4-5시간)
1. **타입 정의** (30분)
   - `client/src/types/stopwatch.ts`
   - Lap, SavedSession 타입

2. **Zustand 스토어** (1.5시간)
   - `client/src/store/useStopwatchStore.ts`
   - 타이머 로직 구현 (10ms 간격)
   - localStorage 연동 (persist)
   - 랩 타임 기록 로직

3. **기본 컴포넌트** (2-2.5시간)
   - `StopwatchCard.tsx` (메인 카드)
   - 타이머 디스플레이
   - 시작/일시정지/재개/리셋/랩 버튼
   - 랩 타임 리스트 (최근 3개)

4. **대시보드 통합** (30분)
   - `DashboardPage.tsx`에 카드 추가
   - 포모도로 타이머 카드 옆에 배치

### Phase 2: 플로팅 위젯 (1-2시간)
1. **위젯 컴포넌트** (1시간)
   - `StopwatchWidget.tsx` 구현
   - 간소화된 UI
   - 다른 페이지에서도 표시

2. **위젯 도크 통합** (30분)
   - WidgetDock에 스톱워치 아이콘 추가
   - 클릭 시 위젯 토글

### Phase 3: 히스토리 & 고급 기능 (2-3시간)
1. **로컬 히스토리** (1.5시간)
   - 세션 저장 모달
   - 히스토리 패널
   - 세션 조회/삭제

2. **내보내기 기능** (1시간)
   - CSV 내보내기
   - JSON 내보내기

3. **알림 기능** (30분)
   - 목표 시간 알림
   - 브라우저 알림

### Phase 4: 테스트 및 최적화 (1시간)
1. 타이머 정확도 검증 (밀리초 단위)
2. 성능 최적화
3. 반응형 디자인 테스트

## 예상 파일 목록

### 클라이언트 (전체)
- `client/src/types/stopwatch.ts` (신규)
- `client/src/store/useStopwatchStore.ts` (신규)
- `client/src/components/dashboard/StopwatchCard.tsx` (신규)
- `client/src/components/stopwatch/StopwatchWidget.tsx` (신규)
- `client/src/components/stopwatch/StopwatchDisplay.tsx` (신규)
- `client/src/components/stopwatch/LapList.tsx` (신규)
- `client/src/components/stopwatch/SaveSessionModal.tsx` (신규, Phase 3)
- `client/src/components/stopwatch/HistoryPanel.tsx` (신규, Phase 3)
- `client/src/components/widget-dock/StopwatchDockIcon.tsx` (신규)
- `client/src/pages/DashboardPage.tsx` (수정 - 카드 추가)
- `client/src/utils/timeFormat.ts` (신규 - 시간 포맷팅 유틸)
- `client/src/utils/exportData.ts` (신규, Phase 3 - CSV/JSON 내보내기)

### 서버
- **없음** ❌

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
│   [⏸ 일시정지] [🚩 랩] [⏹ 리셋]│
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

### 로컬 히스토리 저장
```typescript
const saveCurrentSession = (name?: string, notes?: string) => {
  const { elapsedTime, laps, sessionStartedAt, savedSessions } = get();

  if (!sessionStartedAt) {
    console.error('No session to save');
    return;
  }

  const newSession: SavedSession = {
    id: `session-${Date.now()}`,
    duration: elapsedTime,
    laps: [...laps],
    name,
    notes,
    createdAt: new Date().toISOString(),
  };

  // 최대 100개 세션만 유지
  const updatedSessions = [newSession, ...savedSessions].slice(0, 100);

  set({ savedSessions: updatedSessions });

  console.log('Stopwatch session saved to localStorage');

  // 저장 후 리셋
  get().resetTimer();
};

const deleteSavedSession = (id: string) => {
  set((state) => ({
    savedSessions: state.savedSessions.filter(s => s.id !== id),
  }));
};

const clearHistory = () => {
  set({ savedSessions: [] });
};
```

## 시간 포맷팅

```typescript
/**
 * 밀리초를 HH:MM:SS.mmm 형식으로 변환
 */
export const formatTime = (milliseconds: number): string => {
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
export const formatTimeSimple = (milliseconds: number): string => {
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

## CSV/JSON 내보내기

```typescript
/**
 * 랩 타임 CSV 내보내기
 */
export const exportLapsToCSV = (laps: Lap[], sessionName?: string) => {
  const headers = ['랩 번호', '총 시간', '랩 시간', '타임스탬프'];
  const rows = laps.map(lap => [
    lap.lapNumber,
    formatTime(lap.totalTime),
    formatTime(lap.lapTime),
    new Date(lap.timestamp).toLocaleString('ko-KR'),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `stopwatch-laps-${sessionName || Date.now()}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * 세션 JSON 내보내기
 */
export const exportSessionToJSON = (session: SavedSession) => {
  const jsonContent = JSON.stringify(session, null, 2);

  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `stopwatch-session-${session.name || Date.now()}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
```

## 추가 고려사항

### 향후 개선 가능 기능 (Phase 3+)
1. **다중 스톱워치**
   - 여러 개의 스톱워치 동시 실행
   - 각각 다른 작업 추적

2. **카운트다운 타이머 모드**
   - 스톱워치 ↔ 카운트다운 토글
   - 목표 시간 설정
   - 알림 기능

3. **분석 대시보드**
   - localStorage 히스토리 기반 통계
   - 시간대별 패턴 분석
   - 차트/그래프

4. **선택적 서버 동기화**
   - 사용자가 원하는 세션만 서버에 저장
   - "중요 세션으로 저장" 버튼
   - 여러 디바이스 간 동기화

### 성능 최적화
- `requestAnimationFrame` 사용 고려 (더 정확한 애니메이션)
- 랩 타임 리스트 가상화 (많은 랩 타임 처리)
- 메모이제이션을 통한 불필요한 재렌더링 방지
- localStorage 크기 모니터링 (5MB 제한)

### 접근성
- 키보드 단축키 지원 (Space: 시작/일시정지, L: 랩, R: 리셋)
- ARIA 라벨 추가
- 고대비 모드 지원
- 스크린 리더 친화적인 시간 표시

### 데이터 관리
- localStorage 용량 관리 (히스토리 100개 제한)
- 자동 정리 옵션 (30일 이상 된 세션 삭제)
- 데이터 백업/복원 기능

## 예상 작업 시간

### Phase 1: 기본 스톱워치 (4-5시간)
- 타입 + 스토어: 2시간
- 기본 컴포넌트: 2-2.5시간
- 대시보드 통합: 30분

### Phase 2: 플로팅 위젯 (1-2시간)
- 위젯 컴포넌트: 1시간
- 위젯 도크 통합: 30분

### Phase 3: 히스토리 & 고급 기능 (2-3시간)
- 로컬 히스토리: 1.5시간
- 내보내기 기능: 1시간
- 알림 기능: 30분

### Phase 4: 테스트 및 버그 수정 (1시간)

**총 예상 시간**: 8-11시간
**백엔드 제거로 절약**: 2-3시간 ✅

## 완료 조건 (MVP)

### 필수 기능
- [ ] 스톱워치 카드가 대시보드에 표시됨
- [ ] 시작/일시정지/재개/리셋 기능 작동
- [ ] 밀리초 단위 시간 표시 (HH:MM:SS.mmm)
- [ ] 랩 타임 기록 기능
- [ ] 최근 랩 타임 리스트 표시 (최소 3개)
- [ ] 가장 빠른/느린 랩 하이라이트
- [ ] 평균 랩 타임 계산
- [ ] 플로팅 위젯으로 다른 페이지에서도 접근 가능
- [ ] 새로고침 시 세션 복원
- [ ] localStorage 자동 저장

### 선택적 기능 (Phase 2+)
- [ ] 로컬 히스토리 조회
- [ ] 세션 이름/메모 추가
- [ ] CSV/JSON 내보내기
- [ ] 목표 시간 알림

## 참고 자료

### 디자인 참고
- [Online Stopwatch](https://www.online-stopwatch.com/)
- [Stopwatch Timer](https://stopwatchtimer.net/)
- iOS/Android 기본 스톱워치 앱

### 기술 참고
- [Performance API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Performance)
- [requestAnimationFrame - MDN](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)
- [localStorage - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [IndexedDB - MDN](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)

## 포모도로 타이머와의 비교

| 기능 | 포모도로 타이머 | 스톱워치 |
|------|----------------|----------|
| 타이머 방식 | 카운트다운 (25분 → 0) | 카운트업 (0 → ∞) |
| 주요 목적 | 집중 시간 관리 | 시간 측정 및 추적 |
| 데이터 저장 | 서버 (통계 중요) ✅ | localStorage (로컬만) ✅ |
| 자동 전환 | 집중 ↔ 휴식 자동 전환 | 없음 (수동 제어) |
| 기록 단위 | 세션 (완료/미완료) | 랩 타임 |
| 알림 | 세션 완료 시 | 선택적 (목표 시간) |
| 색상 테마 | 빨간색/녹색 | 파란색 |
| 서버 비용 | 필요 (통계 추적) | 불필요 (0원) ✅ |

## 병행 사용 시나리오

1. **포모도로로 집중 시간 관리, 스톱워치로 세부 작업 측정**
   - 포모도로: 25분 집중 시간 설정
   - 스톱워치: 그 안에서 각 작업의 실제 소요 시간 측정

2. **다른 용도로 활용**
   - 포모도로: 공부/업무용
   - 스톱워치: 운동/요리 등 일상 활동

3. **로컬 데이터 vs 서버 데이터**
   - 포모도로: 서버에 장기 통계 저장
   - 스톱워치: 로컬에만 저장하여 빠른 성능

## 최소 기능 우선 구현 (MVP)

첫 번째 버전에서는 다음 기능만 구현:
1. ✅ 카드 내에서 스톱워치 실행
2. ✅ 시작/일시정지/재개/리셋 버튼
3. ✅ 밀리초 단위 시간 표시
4. ✅ 랩 타임 기록 및 리스트 표시
5. ✅ 가장 빠른/느린 랩 하이라이트
6. ✅ 플로팅 위젯
7. ✅ 새로고침 시 세션 복원
8. ✅ localStorage 자동 저장

히스토리와 내보내기는 Phase 2에서 추가하여 점진적으로 개선합니다.
