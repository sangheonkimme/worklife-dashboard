# 스톱워치 기능 구현 체크리스트

> **프론트엔드 전용 기능** - 백엔드 구현 불필요 (localStorage 사용)

## Phase 1: 기본 스톱워치 구현 (4-5시간)

### 타입 정의 (30분)
- [ ] `client/src/types/stopwatch.ts` 파일 생성
- [ ] `Lap` 인터페이스 정의
  - [ ] id, lapNumber, totalTime, lapTime, timestamp
- [ ] `SavedSession` 인터페이스 정의
  - [ ] id, duration, laps, name, notes, createdAt
- [ ] `StopwatchStatus` 타입 정의 ('idle' | 'running' | 'paused')

### Zustand 스토어 (1.5시간)
- [ ] `client/src/store/useStopwatchStore.ts` 파일 생성
- [ ] 기본 상태 정의
  - [ ] status, elapsedTime, laps
  - [ ] sessionStartedAt, lastTickAt
  - [ ] isWidgetVisible, savedSessions
- [ ] 타이머 제어 액션 구현
  - [ ] `startTimer()` - 타이머 시작 (10ms interval)
  - [ ] `pauseTimer()` - 타이머 일시정지
  - [ ] `resumeTimer()` - 타이머 재개
  - [ ] `resetTimer()` - 타이머 리셋
  - [ ] `tick()` - 10ms마다 elapsedTime 증가
- [ ] 랩 타임 기능 구현
  - [ ] `recordLap()` - 랩 타임 기록
  - [ ] `getFastestLap()` - 가장 빠른 랩 찾기
  - [ ] `getSlowestLap()` - 가장 느린 랩 찾기
  - [ ] `getAverageLapTime()` - 평균 랩 타임 계산
- [ ] 히스토리 관리 (Phase 3에서 사용)
  - [ ] `saveCurrentSession()` - 현재 세션 저장 (최대 100개)
  - [ ] `deleteSavedSession()` - 세션 삭제
  - [ ] `clearHistory()` - 전체 히스토리 삭제
- [ ] 세션 복원
  - [ ] `restoreSession()` - 새로고침 시 타이머 상태 복원
  - [ ] `setWidgetVisible()` - 위젯 표시/숨김
- [ ] Zustand persist 설정
  - [ ] localStorage 자동 동기화 (`stopwatch-storage` 키)
  - [ ] 필요한 상태만 선택적으로 저장 (partialize)

### 유틸리티 함수 (30분)
- [ ] `client/src/utils/timeFormat.ts` 파일 생성
- [ ] `formatTime()` - 밀리초를 HH:MM:SS.mmm 형식으로 변환
- [ ] `formatTimeSimple()` - 밀리초를 MM:SS 형식으로 변환

### 기본 컴포넌트 - 대시보드 카드 (2-2.5시간)
- [ ] `client/src/components/dashboard/StopwatchCard.tsx` 파일 생성
- [ ] 카드 레이아웃 구현
  - [ ] 상단: 스톱워치 아이콘 + 제목
  - [ ] 중앙: 타이머 디스플레이 (RingProgress + 시간)
  - [ ] 하단: 컨트롤 버튼
- [ ] 타이머 디스플레이
  - [ ] 경과 시간 표시 (HH:MM:SS.mmm 또는 MM:SS.mm)
  - [ ] RingProgress 애니메이션 (무한 회전 또는 시각적 효과)
  - [ ] 상태별 색상 변경 (파란색/노란색/회색)
- [ ] 컨트롤 버튼
  - [ ] 시작 버튼 (status === 'idle')
  - [ ] 일시정지 버튼 (status === 'running')
  - [ ] 재개 버튼 (status === 'paused')
  - [ ] 랩 기록 버튼 (status === 'running')
  - [ ] 리셋 버튼 (status !== 'idle')
- [ ] 랩 타임 리스트 (최근 3개만 표시)
  - [ ] 랩 번호, 총 시간, 랩 시간 표시
  - [ ] 가장 빠른 랩 하이라이트 (⚡)
  - [ ] 가장 느린 랩 하이라이트 (🐌)
- [ ] 간단한 통계
  - [ ] 총 랩 개수 표시
  - [ ] 평균 랩 타임 표시 (랩이 있을 때만)
- [ ] 스타일링
  - [ ] 호버 효과 (카드 올라오기)
  - [ ] 반응형 디자인
  - [ ] 색상 테마 적용 (파란색 계열)
- [ ] useEffect 설정
  - [ ] 컴포넌트 마운트 시 `restoreSession()` 호출
  - [ ] 컴포넌트 언마운트 시 타이머 정리

### 대시보드 통합 (30분)
- [ ] `client/src/pages/DashboardPage.tsx` 수정
- [ ] StopwatchCard import
- [ ] "주요 기능" 섹션 SimpleGrid에 StopwatchCard 추가
- [ ] 포모도로 타이머 옆에 배치 확인
- [ ] 그리드 레이아웃 확인 (cols={{ base: 1, sm: 2, lg: 3 }})

### Phase 1 테스트
- [ ] 타이머 시작/일시정지/재개/리셋 기능 확인
- [ ] 시간 표시 정확도 확인 (10ms 단위)
- [ ] 랩 타임 기록 기능 확인
- [ ] 가장 빠른/느린 랩 하이라이트 확인
- [ ] 평균 랩 타임 계산 확인
- [ ] localStorage 저장 확인
- [ ] 새로고침 시 세션 복원 확인
-[ ] 반응형 디자인 확인 (모바일/태블릿/데스크톱)

---

## Phase 2: 플로팅 위젯 (1-2시간)

### 위젯 컴포넌트 (1시간)
- [ ] `client/src/components/stopwatch/StopwatchWidget.tsx` 파일 생성
- [ ] 간소화된 UI 디자인
  - [ ] 상단: 스톱워치 아이콘 + 타이틀
  - [ ] 중앙: 시간 표시 (MM:SS.mm 또는 HH:MM:SS)
  - [ ] 하단: 최소한의 버튼 (시작/일시정지, 랩, 리셋)
- [ ] 위젯 제어
  - [ ] 최대화 버튼 (대시보드로 이동)
  - [ ] 닫기 버튼 (위젯 숨김)
- [ ] 플로팅 스타일
  - [ ] position: fixed
  - [ ] bottom: 20px, right: 20px
  - [ ] z-index: 1000
  - [ ] 그림자 효과
- [ ] 위젯 표시 조건
  - [ ] status !== 'idle' 또는 랩이 있을 때 표시
  - [ ] isWidgetVisible === true일 때만 표시
  - [ ] 대시보드 페이지에서는 숨김
- [ ] Progress 바 추가 (선택적)
  - [ ] 간단한 선형 프로그레스

### 위젯 도크 통합 (30분)
- [ ] `client/src/components/widget-dock/StopwatchDockIcon.tsx` 파일 생성
- [ ] 스톱워치 아이콘 버튼 구현
  - [ ] IconStopwatch 사용
  - [ ] 클릭 시 위젯 표시/숨김 토글
- [ ] `client/src/components/widget-dock/WidgetRegistry.tsx` 수정
  - [ ] StopwatchDockIcon 등록
- [ ] 아이콘 상태 표시
  - [ ] 타이머 실행 중일 때 색상 변경
  - [ ] Badge로 현재 시간 표시 (선택적)

### Phase 2 테스트
- [ ] 위젯이 다른 페이지에서도 표시되는지 확인
- [ ] 위젯 닫기/열기 기능 확인
- [ ] 대시보드로 이동 기능 확인
- [ ] 위젯 도크 아이콘 클릭 시 토글 확인
- [ ] 위젯 위치 및 z-index 확인

---

## Phase 3: 히스토리 & 고급 기능 (2-3시간)

### 로컬 히스토리 (1.5시간)
- [ ] `client/src/components/stopwatch/SaveSessionModal.tsx` 파일 생성
- [ ] 세션 저장 모달 UI
  - [ ] 세션 이름 입력 필드
  - [ ] 메모 입력 필드 (Textarea)
  - [ ] 저장 버튼
  - [ ] 취소 버튼
- [ ] 세션 저장 로직
  - [ ] `saveCurrentSession()` 호출
  - [ ] 저장 후 리셋 확인
  - [ ] 성공 알림 (Notification)
- [ ] `client/src/components/stopwatch/HistoryPanel.tsx` 파일 생성
- [ ] 히스토리 패널 UI
  - [ ] 저장된 세션 목록 (Table 또는 List)
  - [ ] 각 세션: 이름, 시간, 랩 개수, 날짜
  - [ ] 세션 삭제 버튼
  - [ ] 전체 히스토리 삭제 버튼
- [ ] 세션 상세 보기 (선택적)
  - [ ] 클릭 시 랩 타임 리스트 표시
  - [ ] 랩 통계 표시
- [ ] StopwatchCard에 히스토리 버튼 추가
  - [ ] 히스토리 패널 열기 버튼
  - [ ] 저장된 세션 개수 Badge

### 내보내기 기능 (1시간)
- [ ] `client/src/utils/exportData.ts` 파일 생성
- [ ] CSV 내보내기 함수
  - [ ] `exportLapsToCSV()` - 랩 타임 CSV로 내보내기
  - [ ] 헤더: 랩 번호, 총 시간, 랩 시간, 타임스탬프
  - [ ] Blob + 다운로드 링크 생성
- [ ] JSON 내보내기 함수
  - [ ] `exportSessionToJSON()` - 세션 전체 JSON으로 내보내기
  - [ ] 랩 타임 포함
- [ ] UI에 내보내기 버튼 추가
  - [ ] StopwatchCard에 "내보내기" 버튼 (Menu)
  - [ ] CSV 내보내기 옵션
  - [ ] JSON 내보내기 옵션

### 알림 기능 (30분)
- [ ] 목표 시간 설정 UI
  - [ ] Settings 모달 또는 간단한 입력 필드
  - [ ] 1시간, 2시간 등 프리셋
- [ ] 목표 시간 도달 시 알림
  - [ ] 브라우저 알림 (Notification API)
  - [ ] 알림 권한 요청
  - [ ] 소리 재생 (선택적)
- [ ] 알림 설정 저장
  - [ ] Zustand 스토어에 목표 시간 상태 추가
  - [ ] localStorage에 저장

### Phase 3 테스트
- [ ] 세션 저장 기능 확인
- [ ] 히스토리 조회 기능 확인
- [ ] 세션 삭제 기능 확인
- [ ] CSV 내보내기 확인 (다운로드 파일 열어보기)
- [ ] JSON 내보내기 확인
- [ ] 목표 시간 알림 확인
- [ ] localStorage 용량 확인 (100개 세션 제한)

---

## Phase 4: 테스트 및 최적화 (1시간)

### 정확도 및 성능 테스트
- [ ] 타이머 정확도 검증
  - [ ] 10초, 1분, 10분 측정 후 실제 시간과 비교
  - [ ] 10ms 단위 정확도 확인
- [ ] 페이지 전환 시 타이머 작동 확인
  - [ ] 다른 페이지로 이동해도 타이머 계속 작동
  - [ ] 위젯이 정상적으로 표시됨
- [ ] 새로고침 시 복원 확인
  - [ ] running 상태에서 새로고침
  - [ ] paused 상태에서 새로고침
  - [ ] 경과 시간 정확히 복원됨
- [ ] localStorage 용량 확인
  - [ ] 100개 세션 저장 시 용량
  - [ ] 999개 랩 타임 저장 시 용량
  - [ ] 5MB 제한 초과 여부

### UI/UX 개선
- [ ] 반응형 디자인 확인
  - [ ] 모바일 (< 768px)
  - [ ] 태블릿 (768px - 1024px)
  - [ ] 데스크톱 (> 1024px)
- [ ] 접근성 확인
  - [ ] 키보드 단축키 (Space: 시작/일시정지, L: 랩, R: 리셋)
  - [ ] ARIA 라벨 추가
  - [ ] 스크린 리더 테스트
- [ ] 애니메이션 최적화
  - [ ] 부드러운 전환 효과
  - [ ] 성능 프로파일링 (React DevTools)
- [ ] 에러 핸들링
  - [ ] localStorage 쓰기 실패 처리
  - [ ] 잘못된 데이터 복원 시 초기화

### 코드 품질
- [ ] 타입 체크 (`npm run build` 확인)
- [ ] 린트 확인 (`npm run lint`)
- [ ] 불필요한 console.log 제거
- [ ] 주석 추가 (복잡한 로직)
- [ ] 코드 리뷰 (선택적)

---

## 완료 조건 체크

### MVP 필수 기능
- [ ] ✅ 스톱워치 카드가 대시보드에 표시됨
- [ ] ✅ 시작/일시정지/재개/리셋 기능 작동
- [ ] ✅ 밀리초 단위 시간 표시 (HH:MM:SS.mmm 또는 MM:SS.mm)
- [ ] ✅ 랩 타임 기록 기능
- [ ] ✅ 최근 랩 타임 리스트 표시 (최소 3개)
- [ ] ✅ 가장 빠른/느린 랩 하이라이트
- [ ] ✅ 평균 랩 타임 계산
- [ ] ✅ 플로팅 위젯으로 다른 페이지에서도 접근 가능
- [ ] ✅ 새로고침 시 세션 복원
- [ ] ✅ localStorage 자동 저장

### 선택적 기능 (Phase 2+)
- [ ] 🎯 로컬 히스토리 조회
- [ ] 🎯 세션 이름/메모 추가
- [ ] 🎯 CSV/JSON 내보내기
- [ ] 🎯 목표 시간 알림

---

## 추가 개선 사항 (Phase 3+)

### 향후 고려 사항
- [ ] 다중 스톱워치 기능
- [ ] 카운트다운 타이머 모드
- [ ] 분석 대시보드 (차트/그래프)
- [ ] 선택적 서버 동기화 ("중요 세션으로 저장" 기능)
- [ ] 데이터 백업/복원 기능
- [ ] 테마 커스터마이징 (색상 선택)
- [ ] 소리 효과 추가 (랩 기록 시)

---

## 참고 사항

### 개발 팁
- 타이머 정확도를 위해 `setInterval` 10ms 사용
- `requestAnimationFrame` 고려 (더 정확하지만 복잡함)
- localStorage는 동기 API이므로 대용량 데이터 주의
- 100개 세션 제한으로 용량 관리
- 페이지 언마운트 시 타이머 interval 정리 필수

### 디버깅 체크리스트
- [ ] 콘솔 에러 없음
- [ ] localStorage에 데이터 정상 저장 확인
- [ ] 메모리 누수 확인 (DevTools Memory 프로파일)
- [ ] 타이머 interval이 중복 생성되지 않는지 확인
- [ ] 새로고침 시 경과 시간 정확히 복원되는지 확인

---

## 예상 작업 시간 요약

- **Phase 1**: 4-5시간 (기본 스톱워치)
- **Phase 2**: 1-2시간 (플로팅 위젯)
- **Phase 3**: 2-3시간 (히스토리 & 고급 기능)
- **Phase 4**: 1시간 (테스트 & 최적화)

**총 예상 시간**: 8-11시간

**백엔드 불필요로 절약**: 2-3시간 ✅
**서버 비용 절감**: 무제한 사용 가능 (0원) ✅
