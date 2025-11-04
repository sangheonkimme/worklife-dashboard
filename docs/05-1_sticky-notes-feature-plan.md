# 대시보드 스티커 메모 기능 작업 계획서

## 개요
대시보드의 "대시보드 개요" 섹션 하단에 빠른 접근이 가능한 스티커 메모 기능을 추가합니다.
메모장처럼 간단하게 텍스트를 작성하고 자동 저장되는 기능을 제공합니다.

## 주요 요구사항

### 1. UI/UX 요구사항
- **레이아웃**
  - 최대 4개의 스티커 메모를 가로로 나란히 표시 (1x4 그리드)
  - 각 메모는 포스트잇 스타일의 카드 형태
  - 메모가 없을 경우: 4개의 "+" 아이콘 표시
  - 1개 생성 시: 첫 번째 메모 + 3개의 "+" 아이콘
  - 4개 모두 생성 시: "+" 아이콘 없음

- **스타일링**
  - 배경색: 노트 느낌의 연한 색상 (파스텔톤)
  - 각 메모마다 다른 색상 옵션 제공
    - 옵션 1: 연한 노란색 (#FFF9C4)
    - 옵션 2: 연한 핑크색 (#FCE4EC)
    - 옵션 3: 연한 하늘색 (#E1F5FE)
    - 옵션 4: 연한 민트색 (#E0F2F1)
  - 글씨색: 진한 회색/검정 (가독성 확보)
  - 그림자 효과로 입체감 표현
  - 호버 시 살짝 올라오는 애니메이션

- **입력 필드**
  - Textarea 형태
  - Placeholder: "메모를 입력하세요..."
  - 높이: 약 150-200px (고정)
  - 스크롤 가능

### 2. 기능 요구사항
- **자동 저장**
  - 포커스를 잃으면 자동으로 저장 (onBlur)
  - Debounce 적용 (불필요한 API 호출 방지)
  - 저장 중 로딩 인디케이터 표시 (선택적)

- **생성/삭제**
  - "+" 버튼 클릭으로 새 메모 생성
  - 각 메모 우측 상단에 삭제(X) 버튼
  - 삭제 시 확인 모달 (선택적)

- **고정 기능**
  - 대시보드에 항상 고정 표시
  - 빠른 접근성 제공

### 3. 기술 스택

#### 프론트엔드
- **컴포넌트**: `client/src/components/dashboard/StickyNotes.tsx`
- **스타일**: Mantine `Card`, `Textarea`, `ActionIcon` 컴포넌트 활용
- **상태 관리**: TanStack Query (서버 상태)
- **API 서비스**: `client/src/services/api/stickyNotesApi.ts`

#### 백엔드
- **데이터베이스**: Prisma 스키마에 `StickyNote` 모델 추가
- **API 엔드포인트**: `/api/sticky-notes`
  - `GET /api/sticky-notes` - 사용자의 모든 스티커 메모 조회
  - `POST /api/sticky-notes` - 새 스티커 메모 생성
  - `PUT /api/sticky-notes/:id` - 메모 내용 수정
  - `DELETE /api/sticky-notes/:id` - 메모 삭제
- **검증**: Zod 스키마로 요청 검증

## 데이터베이스 스키마

```prisma
model StickyNote {
  id        String   @id @default(cuid())
  content   String   @db.Text
  color     String   @default("#FFF9C4") // 배경색
  position  Int      @default(0) // 표시 순서 (0-3)
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@map("sticky_notes")
}
```

User 모델에 관계 추가:
```prisma
model User {
  // ... 기존 필드들
  stickyNotes StickyNote[]
}
```

## API 명세

### 1. GET /api/sticky-notes
**응답**:
```json
{
  "success": true,
  "data": [
    {
      "id": "clx123...",
      "content": "할 일 메모",
      "color": "#FFF9C4",
      "position": 0,
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

### 2. POST /api/sticky-notes
**요청**:
```json
{
  "content": "",
  "color": "#FFF9C4",
  "position": 0
}
```
**응답**: 생성된 스티커 메모 객체

### 3. PUT /api/sticky-notes/:id
**요청**:
```json
{
  "content": "수정된 내용",
  "color": "#FCE4EC"
}
```
**응답**: 수정된 스티커 메모 객체

### 4. DELETE /api/sticky-notes/:id
**응답**:
```json
{
  "success": true,
  "message": "Sticky note deleted successfully"
}
```

## 컴포넌트 구조

```
StickyNotes (컨테이너)
├── StickyNoteCard (개별 메모 카드) x4
│   ├── Textarea (메모 입력)
│   └── ActionIcon (삭제 버튼)
└── CreateStickyNoteButton (생성 버튼)
```

## 구현 순서

### Phase 1: 백엔드 구현
1. Prisma 스키마에 `StickyNote` 모델 추가
2. 마이그레이션 실행 (`db:generate` → `db:migrate`)
3. Zod 검증 스키마 생성 (`validators/stickyNoteValidator.ts`)
4. 서비스 레이어 구현 (`services/stickyNoteService.ts`)
5. 컨트롤러 구현 (`controllers/stickyNoteController.ts`)
6. 라우트 추가 (`routes/stickyNoteRoutes.ts`)
7. `server/src/index.ts`에 라우트 등록

### Phase 2: 프론트엔드 구현
1. TypeScript 타입 정의 (`types/stickyNote.ts`)
2. API 서비스 함수 생성 (`services/api/stickyNotesApi.ts`)
3. 컴포넌트 구현
   - `StickyNoteCard.tsx` (개별 카드)
   - `CreateStickyNoteButton.tsx` (생성 버튼)
   - `StickyNotes.tsx` (메인 컨테이너)
4. 대시보드 페이지에 통합 (`pages/Dashboard.tsx`)
5. TanStack Query 훅 설정
   - `useQuery` (메모 목록 조회)
   - `useMutation` (생성/수정/삭제)

### Phase 3: 테스트 및 최적화
1. API 엔드포인트 테스트
2. UI/UX 테스트
3. 자동 저장 동작 확인
4. 성능 최적화 (debounce, optimistic updates)

## 예상 파일 목록

### 서버
- `server/prisma/schema.prisma` (수정)
- `server/src/validators/stickyNoteValidator.ts` (신규)
- `server/src/services/stickyNoteService.ts` (신규)
- `server/src/controllers/stickyNoteController.ts` (신규)
- `server/src/routes/stickyNoteRoutes.ts` (신규)
- `server/src/index.ts` (수정)

### 클라이언트
- `client/src/types/stickyNote.ts` (신규)
- `client/src/services/api/stickyNotesApi.ts` (신규)
- `client/src/components/dashboard/StickyNoteCard.tsx` (신규)
- `client/src/components/dashboard/CreateStickyNoteButton.tsx` (신규)
- `client/src/components/dashboard/StickyNotes.tsx` (신규)
- `client/src/pages/Dashboard.tsx` (수정)

## UI 레이아웃 예시

```
┌───────────────────────────────────────────────────────────────────────┐
│                     대시보드 개요                                      │
│  [사용자] [주문] [매출] [완성 제작]                                    │
└───────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────┐
│                     주요 기능                                          │
│  [연봉 계산기] ...                                                     │
└───────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────┐
│                  스티커 메모                                           │
│                                                                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │  메모 1  │  │    +     │  │    +     │  │    +     │            │
│  │ (연한노랑)│  │  새 메모 │  │  새 메모 │  │  새 메모 │            │
│  │          │  │          │  │          │  │          │            │
│  │          │  │          │  │          │  │          │            │
│  │          │  │          │  │          │  │          │            │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘            │
└───────────────────────────────────────────────────────────────────────┘
```

## 추가 고려사항

### 향후 개선 가능 기능
1. 드래그 앤 드롭으로 순서 변경
2. 메모 확장/축소 기능
3. 리치 텍스트 에디터 지원 (마크다운)
4. 메모 검색 기능
5. 메모 카테고리/태그
6. 색상 커스터마이징 UI
7. 메모 공유 기능

### 성능 최적화
- Debounce를 통한 자동 저장 최적화 (500ms)
- Optimistic updates로 UX 개선
- 메모가 4개로 제한되어 있어 페이지네이션 불필요

### 접근성
- 키보드 네비게이션 지원
- ARIA 라벨 추가
- 색상 대비 확보 (WCAG AA 기준)

## 예상 작업 시간
- 백엔드 구현: 2-3시간
- 프론트엔드 구현: 3-4시간
- 테스트 및 버그 수정: 1-2시간
- **총 예상 시간**: 6-9시간

## 완료 조건
- [ ] 4개의 스티커 메모 슬롯 표시
- [ ] "+" 버튼으로 메모 생성
- [ ] 메모 내용 입력 및 자동 저장
- [ ] 메모 삭제 기능
- [ ] 연한 색상 배경 + 가독성 있는 텍스트
- [ ] 대시보드 페이지에서 즉시 접근 가능
- [ ] 반응형 디자인 (모바일 대응)
- [ ] API 에러 핸들링

## 참고사항
- 기존 Note 기능과는 별도로 동작 (더 간단하고 빠른 접근)
- 대시보드에 고정되어 항상 보이는 것이 핵심
- 최소한의 기능으로 시작하여 점진적 개선
