# 위젯 독(Widget Dock) 구현 계획

## 1. 전체 아키텍처 설계

### 프로젝트 구조

```
client/src/
├── components/
│   ├── widget-dock/                    # 새로운 위젯 독 시스템
│   │   ├── WidgetDock.tsx             # 우측 아이콘 메뉴바
│   │   ├── WidgetModal.tsx            # 위젯을 표시할 모달
│   │   └── WidgetRegistry.tsx         # 위젯 등록 및 관리
│   ├── widgets/
│   │   ├── ImageToPdfWidget/          # 기존 (리팩토링 필요)
│   │   ├── QuickMemoWidget/           # 빠른 메모 (예정)
│   │   ├── StickerNoteWidget/         # 스티커 노트 (예정)
│   │   └── TimerWidget/               # 타이머 및 알람 (예정)
│   └── DashboardLayout.tsx            # 위젯 독 통합
├── store/
│   └── useWidgetStore.ts              # 위젯 상태 관리 (Zustand)
└── types/
    └── widget.ts                       # 위젯 타입 확장
```

## 2. 주요 컴포넌트 설계

### 2.1 WidgetDock (우측 아이콘 메뉴바)

**위치**: 화면 우측 고정

**기능**:
- 등록된 위젯 아이콘 표시
- 아이콘 클릭 시 모달 오픈
- 호버 시 툴팁 표시
- 모바일에서는 하단 플로팅 버튼으로 전환

**디자인**:
```
┌─────┐
│ 📄  │ ← Image to PDF
├─────┤
│ 📝  │ ← Quick Memo
├─────┤
│ 📌  │ ← Sticker Note
├─────┤
│ ⏰  │ ← Timer
├─────┤
│ 🔧  │ ← Settings
└─────┘
```

**스타일**:
- 고정 위치 (position: fixed)
- 우측에서 16px 간격
- 반투명 배경
- 그림자 효과
- z-index 높게 설정

### 2.2 WidgetModal (위젯 표시 모달)

**특징**:
- 큰 사이즈 모달 (lg, xl, full 옵션)
- 각 위젯의 콘텐츠를 동적으로 로드
- ESC 키로 닫기
- 모달 외부 클릭으로 닫기
- 애니메이션 전환 효과

**레이아웃**:
```
┌───────────────────────────────┐
│ [제목]                    [X] │
├───────────────────────────────┤
│                               │
│     위젯 콘텐츠 영역          │
│                               │
│                               │
└───────────────────────────────┘
```

### 2.3 WidgetRegistry (위젯 등록 시스템)

**역할**:
- 위젯 메타데이터 관리
- 동적 위젯 로딩
- 위젯 권한 관리 (선택사항)

**등록 형식**:
```typescript
{
  id: string,
  name: string,
  icon: Component,
  component: Component,
  displayMode: 'modal',
  modalSize: 'lg',
  color: string,
  order: number,
  enabled: boolean
}
```

## 3. 타입 정의 확장

### types/widget.ts에 추가

```typescript
export interface WidgetConfig {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  component: React.ComponentType<WidgetProps>;
  displayMode: 'modal' | 'page' | 'inline';
  modalSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  color: string;
  order: number;
  enabled: boolean;
}

export interface WidgetProps {
  onClose?: () => void;
}

export interface WidgetState {
  activeWidgetId: string | null;
  openWidget: (widgetId: string) => void;
  closeWidget: () => void;
  isWidgetOpen: (widgetId: string) => boolean;
}
```

## 4. Zustand 스토어 설계

### store/useWidgetStore.ts

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WidgetStoreState {
  activeWidgetId: string | null;
  widgetHistory: string[];
  preferences: {
    dockPosition: 'right' | 'left';
    autoClose: boolean;
  };
  openWidget: (widgetId: string) => void;
  closeWidget: () => void;
  toggleWidget: (widgetId: string) => void;
}

export const useWidgetStore = create<WidgetStoreState>()(
  persist(
    (set, get) => ({
      activeWidgetId: null,
      widgetHistory: [],
      preferences: {
        dockPosition: 'right',
        autoClose: false,
      },
      openWidget: (widgetId) => set({ activeWidgetId: widgetId }),
      closeWidget: () => set({ activeWidgetId: null }),
      toggleWidget: (widgetId) => {
        const { activeWidgetId } = get();
        set({
          activeWidgetId: activeWidgetId === widgetId ? null : widgetId
        });
      },
    }),
    {
      name: 'widget-store',
    }
  )
);
```

## 5. 구현 단계

### Phase 1: 위젯 독 기본 구조 (2-3시간)

1. **타입 정의 확장**
   - `types/widget.ts`에 WidgetConfig, WidgetProps 등 추가
   - 기존 타입과 호환성 유지

2. **Zustand 스토어 생성**
   - `store/useWidgetStore.ts` 생성
   - 위젯 열기/닫기 상태 관리
   - localStorage 연동

3. **WidgetDock 컴포넌트**
   - 우측 고정 위치 스타일링
   - Affix 또는 fixed position 사용
   - 아이콘 버튼 배치
   - 툴팁 추가

4. **DashboardLayout 통합**
   - WidgetDock 추가
   - z-index 조정

### Phase 2: 위젯 모달 시스템 (2-3시간)

1. **WidgetModal 컴포넌트**
   - Mantine Modal 기반
   - 동적 크기 조정 (sm, md, lg, xl, full)
   - 애니메이션 효과
   - 키보드 단축키 (ESC)

2. **WidgetRegistry 구현**
   - 위젯 메타데이터 배열
   - 동적 컴포넌트 로딩
   - 활성화/비활성화 관리

3. **모달과 독 연동**
   - 아이콘 클릭 시 모달 오픈
   - 모달 닫기 시 상태 초기화

### Phase 3: 기존 위젯 리팩토링 (1-2시간)

1. **ImageToPdfWidget 수정**
   - Card 래퍼 제거
   - WidgetProps 인터페이스 구현
   - onClose 핸들러 추가
   - 순수 콘텐츠만 렌더링

2. **대시보드 정리**
   - DashboardPage에서 ImageToPdfWidget 제거
   - 필요시 간단한 프리뷰 카드로 대체

3. **위젯 등록**
   - WidgetRegistry에 ImageToPdfWidget 등록

### Phase 4: 반응형 및 모바일 대응 (2-3시간)

1. **모바일 레이아웃**
   - 화면 크기에 따라 독 위치 변경
   - 하단 플로팅 버튼으로 전환
   - 햄버거 메뉴 방식

2. **터치 제스처**
   - 스와이프로 모달 닫기
   - 터치 친화적 버튼 크기

3. **모달 크기 조정**
   - 작은 화면에서 fullScreen 자동 적용
   - 패딩 및 여백 조정

### Phase 5: 추가 위젯 구현 (위젯당 2-4시간)

#### 5.1 QuickMemoWidget (빠른 메모)

**기능**:
- 간단한 텍스트 입력
- 마크다운 지원
- 자동 저장
- 로컬스토리지 또는 서버 연동

**UI**:
- 텍스트 에디터
- 저장 버튼
- 최근 메모 목록

#### 5.2 StickerNoteWidget (스티커 노트)

**기능**:
- 화면에 붙이는 포스트잇
- 드래그 가능
- 색상 변경
- 여러 개 동시 표시

**UI**:
- 작은 카드 형태
- 드래그 핸들
- 색상 선택 팔레트

#### 5.3 TimerWidget (타이머 및 알람)

**기능**:
- 카운트다운 타이머
- 스톱워치
- 알람 설정
- 브라우저 알림

**UI**:
- 디지털 시계 표시
- 시작/정지/리셋 버튼
- 알람 목록

### Phase 6: 개선 및 최적화 (2-3시간)

1. **키보드 단축키**
   - Cmd/Ctrl + 1: 첫 번째 위젯
   - Cmd/Ctrl + 2: 두 번째 위젯
   - Cmd/Ctrl + K: 위젯 검색

2. **위젯 검색**
   - Cmd/Ctrl + K로 검색창 오픈
   - 위젯 이름으로 검색
   - 최근 사용한 위젯 표시

3. **애니메이션 개선**
   - 부드러운 전환 효과
   - 마이크로 인터랙션
   - 로딩 상태 표시

4. **성능 최적화**
   - 레이지 로딩
   - 메모이제이션
   - 불필요한 리렌더링 방지

**총 예상 시간: 11-18시간**

## 6. 위젯 독 레이아웃 통합

### DashboardLayout.tsx 수정

```typescript
<AppShell
  header={{ height: 60 }}
  navbar={{
    width: 300,
    breakpoint: "sm",
    collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
  }}
  padding="md"
>
  {/* 기존 헤더, 네비게이션 */}

  <AppShell.Main>
    {children}
  </AppShell.Main>

  {/* 새로운 위젯 독 */}
  <WidgetDock />

  {/* 위젯 모달 */}
  <WidgetModal />
</AppShell>
```

## 7. 위젯 등록 예시

### components/widget-dock/WidgetRegistry.tsx

```typescript
import {
  IconFileTypePdf,
  IconNotes,
  IconPin,
  IconClock
} from '@tabler/icons-react';
import { ImageToPdfWidget } from '@/components/widgets/ImageToPdfWidget';

export const WIDGETS: WidgetConfig[] = [
  {
    id: 'image-to-pdf',
    name: '이미지 → PDF',
    icon: IconFileTypePdf,
    description: '여러 이미지를 하나의 PDF로 변환',
    component: ImageToPdfWidget,
    displayMode: 'modal',
    modalSize: 'lg',
    color: 'blue',
    order: 1,
    enabled: true,
  },
  // 추가 위젯은 여기에 등록
];
```

## 8. 주요 장점

1. **확장성**: 새 위젯 추가가 매우 쉬움 (WIDGETS 배열에 추가만)
2. **일관성**: 모든 위젯이 동일한 UX 패턴 사용
3. **접근성**: 어느 페이지에서든 위젯 사용 가능
4. **깔끔한 UI**: 대시보드가 복잡하지 않음
5. **사용자 경험**: 작업 흐름을 방해하지 않음

## 9. 향후 확장 가능성

- 위젯 즐겨찾기
- 위젯 드래그 앤 드롭 순서 변경
- 위젯 단축키 커스터마이징
- 위젯 멀티 오픈 (탭 형태)
- 위젯 팝아웃 (별도 창으로)
- 위젯 공유 기능
- 위젯 템플릿 마켓플레이스

## 10. 기술 스택

- **React 19**: 최신 React 기능 활용
- **TypeScript**: 타입 안전성
- **Mantine v7**: UI 컴포넌트 라이브러리
- **Zustand**: 경량 상태 관리
- **React Router**: 라우팅 (필요시)
- **Tabler Icons**: 아이콘

## 11. 주의사항

### 성능
- 모든 위젯을 한 번에 로드하지 않고 레이지 로딩
- 큰 위젯은 코드 스플리팅
- 메모이제이션으로 불필요한 리렌더링 방지

### 접근성
- 키보드 내비게이션 지원
- ARIA 레이블 추가
- 포커스 관리

### 모바일
- 터치 친화적 UI
- 작은 화면 최적화
- 제스처 지원

### 보안
- XSS 공격 방지
- 사용자 입력 검증
- 안전한 데이터 저장
