# WorkLife Dashboard - 메모 앱 구현 체크리스트

**버전**: 1.0
**날짜**: 2025-01-26
**상태**: 진행 중
**전체 개발 기간**: 4주

---

## 📊 전체 진행률

- **Phase 1 (1주차)**: 0% (0/20)
- **Phase 2 (2주차)**: 0% (0/19)
- **Phase 3 (3주차)**: 0% (0/22)
- **Phase 4 (4주차)**: 0% (0/29)

**총 진행률**: 0% (0/90)

---

## Phase 1: 기반 구축 및 기본 CRUD (1주차)

### 🗄️ 데이터베이스 설정 (5/5)

- [ ] notes 테이블 생성
- [ ] folders 테이블 생성
- [ ] tags 테이블 생성
- [ ] note_tags 연결 테이블 생성
- [ ] checklist_items 테이블 생성
- [ ] note_templates 테이블 생성
- [ ] note_attachments 테이블 생성
- [ ] note_transactions 연결 테이블 생성
- [ ] Prisma 스키마 업데이트 완료
- [ ] 마이그레이션 실행 (`npm run db:migrate`)
- [ ] 시드 데이터 작성 (샘플 메모, 기본 폴더)

### 🔙 백엔드 - 메모 CRUD API (5/5)

#### 서비스 레이어
- [ ] `server/src/services/noteService.ts` 생성
  - [ ] `createNote()` 구현
  - [ ] `updateNote()` 구현
  - [ ] `deleteNote()` 구현 (소프트 삭제)
  - [ ] `getNotes()` 구현 (페이지네이션)
  - [ ] `getNoteById()` 구현

#### Zod 검증
- [ ] `server/src/validators/noteValidator.ts` 생성
  - [ ] 메모 생성 스키마
  - [ ] 메모 수정 스키마
  - [ ] 쿼리 파라미터 검증

#### 컨트롤러
- [ ] `server/src/controllers/noteController.ts` 생성
  - [ ] POST `/api/notes` - 메모 생성
  - [ ] PUT `/api/notes/:id` - 메모 수정
  - [ ] DELETE `/api/notes/:id` - 메모 삭제
  - [ ] GET `/api/notes` - 메모 목록
  - [ ] GET `/api/notes/:id` - 메모 상세

#### 라우트
- [ ] `server/src/routes/noteRoutes.ts` 생성 및 설정
- [ ] 에러 핸들링 추가

### 🎨 프론트엔드 - 기본 UI 구조 (10/10)

#### 타입 정의
- [ ] `client/src/types/note.ts` 생성
  - [ ] Note 인터페이스
  - [ ] NoteType enum
  - [ ] CreateNoteDto, UpdateNoteDto

#### API 서비스
- [ ] `client/src/services/api/noteApi.ts` 생성
  - [ ] `getNotes()`
  - [ ] `getNoteById()`
  - [ ] `createNote()`
  - [ ] `updateNote()`
  - [ ] `deleteNote()`

#### 레이아웃
- [ ] `client/src/pages/NotesPage.tsx` 생성
- [ ] `client/src/components/notes/NoteLayout.tsx` (AppShell 기반)
- [ ] 사이드바 컴포넌트 구조
- [ ] 메인 콘텐츠 영역 구조

#### 메모 목록
- [ ] `client/src/components/notes/NoteList/NoteList.tsx`
- [ ] `client/src/components/notes/NoteList/NoteCard.tsx`
- [ ] `client/src/components/notes/NoteList/EmptyState.tsx`

#### 에디터
- [ ] `client/src/components/notes/NoteEditor/TextEditor.tsx`
- [ ] 자동 저장 구현 (`useDebouncedValue` 사용)
- [ ] 문자 수 카운터 추가

#### 상태 관리
- [ ] `client/src/hooks/useNotes.ts` (TanStack Query)
- [ ] 라우트 추가 (`client/src/App.tsx`)

---

## Phase 2: 폴더/태그 시스템 및 검색 (2주차)

### 🔙 백엔드 - 폴더 & 태그 API (9/9)

#### 폴더 API
- [ ] `server/src/services/folderService.ts` 생성
- [ ] `server/src/controllers/folderController.ts` 생성
- [ ] `server/src/validators/folderValidator.ts` 생성
- [ ] GET `/api/folders` - 폴더 목록
- [ ] POST `/api/folders` - 폴더 생성
- [ ] PUT `/api/folders/:id` - 폴더 수정
- [ ] DELETE `/api/folders/:id` - 폴더 삭제
- [ ] POST `/api/folders/:id/move` - 폴더 이동
- [ ] 중첩 폴더 로직 구현 (최대 3단계)

#### 태그 API
- [ ] `server/src/services/tagService.ts` 생성
- [ ] `server/src/controllers/tagController.ts` 생성
- [ ] `server/src/validators/tagValidator.ts` 생성
- [ ] GET `/api/tags` - 태그 목록
- [ ] POST `/api/tags` - 태그 생성
- [ ] PUT `/api/tags/:id` - 태그 수정
- [ ] DELETE `/api/tags/:id` - 태그 삭제
- [ ] GET `/api/tags/suggest` - 태그 자동완성
- [ ] 메모-태그 연결 로직

#### 검색 API
- [ ] `server/src/services/searchService.ts` 생성
- [ ] GET `/api/notes/search` - 전문 검색
- [ ] PostgreSQL Full-Text Search 설정
- [ ] 필터링 로직 (태그, 날짜, 타입)

### 🎨 프론트엔드 - 폴더/태그 UI (10/10)

#### 타입 & API
- [ ] `client/src/types/folder.ts` 생성
- [ ] `client/src/types/tag.ts` 생성
- [ ] `client/src/services/api/folderApi.ts` 생성
- [ ] `client/src/services/api/tagApi.ts` 생성

#### 폴더 UI
- [ ] `client/src/components/notes/NoteSidebar/FolderTree.tsx`
- [ ] `client/src/components/notes/FolderModal.tsx` (생성/수정/삭제)
- [ ] 폴더 아이콘 및 색상 선택
- [ ] (선택) 드래그 앤 드롭 구현

#### 태그 UI
- [ ] `client/src/components/notes/NoteSidebar/TagList.tsx`
- [ ] `client/src/components/notes/TagInput.tsx` (MultiSelect)
- [ ] `client/src/components/notes/TagManager.tsx`
- [ ] 태그 색상 선택기 (ColorPicker)

#### 검색 UI
- [ ] `client/src/components/notes/NoteSearch/SearchBar.tsx`
- [ ] Spotlight 통합 (Ctrl+K)
- [ ] `client/src/components/notes/NoteSearch/SearchFilters.tsx`
- [ ] 검색 결과 하이라이팅 (Highlight 컴포넌트)
- [ ] 최근 검색어 저장 (localStorage)

#### 필터링
- [ ] `client/src/hooks/useNoteFilters.ts`
- [ ] 폴더별 필터
- [ ] 태그별 필터
- [ ] 조합 필터

---

## Phase 3: 고급 기능 및 가계부 연동 (3주차)

### 🔙 백엔드 - 고급 기능 API (12/12)

#### 체크리스트 API
- [ ] `server/src/services/checklistService.ts` 생성
- [ ] `server/src/controllers/checklistController.ts` 생성
- [ ] POST `/api/notes/:id/checklist` - 항목 추가
- [ ] PUT `/api/checklist/:id` - 항목 수정
- [ ] DELETE `/api/checklist/:id` - 항목 삭제
- [ ] POST `/api/checklist/:id/toggle` - 완료 토글

#### 메모 액션 API
- [ ] POST `/api/notes/:id/pin` - 메모 고정
- [ ] POST `/api/notes/:id/favorite` - 즐겨찾기
- [ ] POST `/api/notes/:id/archive` - 보관함 이동
- [ ] GET `/api/notes/trash` - 휴지통 목록
- [ ] POST `/api/notes/:id/restore` - 복구
- [ ] DELETE `/api/notes/:id/permanent` - 영구 삭제

#### 템플릿 API
- [ ] `server/src/services/templateService.ts` 생성
- [ ] GET `/api/templates` - 템플릿 목록
- [ ] POST `/api/templates` - 템플릿 생성
- [ ] PUT `/api/templates/:id` - 템플릿 수정
- [ ] DELETE `/api/templates/:id` - 템플릿 삭제
- [ ] 기본 템플릿 시드 데이터

#### 가계부 연동 API
- [ ] POST `/api/notes/:id/link-transaction` - 거래 연결
- [ ] DELETE `/api/notes/:id/unlink/:tid` - 거래 연결 해제
- [ ] GET `/api/transactions/:id/notes` - 거래별 메모 조회

#### 파일 업로드 API
- [ ] Multer 설정 (`server/src/middlewares/upload.ts`)
- [ ] POST `/api/notes/:id/attachments` - 파일 업로드
- [ ] DELETE `/api/attachments/:id` - 파일 삭제
- [ ] 이미지 최적화 (선택)

### 🎨 프론트엔드 - 고급 기능 UI (10/10)

#### 체크리스트
- [ ] `client/src/components/notes/NoteEditor/ChecklistEditor.tsx`
- [ ] 드래그 앤 드롭 정렬 (DnD Kit)
- [ ] 진행률 표시 (Progress 컴포넌트)

#### 마크다운
- [ ] `client/src/components/notes/NoteEditor/MarkdownEditor.tsx`
- [ ] RichTextEditor 설정
- [ ] 미리보기 토글
- [ ] 툴바 구현 (EditorToolbar)

#### 빠른 메모
- [ ] `client/src/components/notes/QuickNote.tsx`
- [ ] 플로팅 위젯 (Affix)
- [ ] 자동 저장

#### 템플릿
- [ ] `client/src/components/notes/NoteModals/TemplateModal.tsx`
- [ ] 템플릿 선택 UI
- [ ] 커스텀 템플릿 생성
- [ ] `client/src/services/api/templateApi.ts`

#### 가계부 연동
- [ ] `client/src/components/notes/NoteModals/LinkTransactionModal.tsx`
- [ ] 거래 선택 UI
- [ ] 연결된 거래 표시 (Card)
- [ ] 거래 정보 미리보기

#### 파일 첨부
- [ ] `client/src/components/notes/Attachments/AttachmentUpload.tsx`
- [ ] Dropzone 컴포넌트
- [ ] 이미지 미리보기
- [ ] 파일 목록 관리
- [ ] `client/src/services/api/attachmentApi.ts`

---

## Phase 4: 최적화, 테스트 및 마무리 (4주차)

### ⚡ 성능 최적화 (7/7)

- [ ] 메모 목록 가상화 (react-window 또는 Mantine 가상화)
- [ ] 이미지 lazy loading
- [ ] 검색 디바운싱 (useDebouncedValue)
- [ ] 자동 저장 최적화 (로컬 스토리지 백업)
- [ ] 메모 내용 압축 (긴 메모, 선택 사항)
- [ ] 데이터베이스 인덱스 최적화
  - [ ] 검색 인덱스 (Full-Text Search)
  - [ ] 날짜 인덱스 (created_at, updated_at)
  - [ ] 사용자별 인덱스 (user_id)

### 🎨 UI/UX 개선 (12/12)

#### 로딩 상태
- [ ] Skeleton 로더 (메모 목록)
- [ ] 저장 중 인디케이터
- [ ] 로딩 오버레이 (LoadingOverlay)

#### 애니메이션
- [ ] 페이지 전환 애니메이션
- [ ] 메모 추가/삭제 애니메이션
- [ ] 폴더 확장/축소 애니메이션

#### 단축키
- [ ] 새 메모 (Ctrl+N)
- [ ] 검색 (Ctrl+K)
- [ ] 저장 (Ctrl+S)
- [ ] 삭제 (Delete)
- [ ] 단축키 도움말 모달

#### 모바일 최적화
- [ ] 스와이프 제스처 (삭제, 고정)
- [ ] 하단 시트 (Sheet)
- [ ] 플로팅 액션 버튼 (Affix)
- [ ] 터치 최적화

#### 테마
- [ ] 다크/라이트 테마 통합
- [ ] 에디터 테마 설정
- [ ] 코드 하이라이팅 (마크다운)

### 📱 반응형 테스트 (3/3)

- [ ] 모바일 (320px - 768px)
  - [ ] 에디터 레이아웃
  - [ ] 메모 목록
  - [ ] 검색 인터페이스
- [ ] 태블릿 (768px - 1024px)
  - [ ] 분할 뷰
  - [ ] 사이드바 토글
- [ ] 데스크톱 (1024px+)
  - [ ] 3컬럼 레이아웃

### 🧪 테스트 (3/3)

#### 단위 테스트
- [ ] 메모 서비스 테스트 (`server/src/__tests__/services/noteService.test.ts`)
- [ ] 검색 로직 테스트
- [ ] 자동 저장 훅 테스트

#### 통합 테스트
- [ ] API 엔드포인트 테스트
- [ ] 가계부 연동 테스트
- [ ] 파일 업로드 테스트

#### E2E 테스트 (선택)
- [ ] 메모 작성 플로우
- [ ] 검색 및 필터
- [ ] 태그/폴더 관리

### 🚀 배포 준비 (4/4)

- [ ] 환경 변수 설정 (파일 업로드 경로, 검색 설정)
- [ ] 데이터베이스 마이그레이션 실행
- [ ] 기존 시스템 통합 테스트
- [ ] 성능 벤치마크
  - [ ] 1000개 메모 로딩 < 1초
  - [ ] 검색 응답 시간 < 500ms
  - [ ] 자동 저장 < 300ms

### 📝 문서화 (2/2)

- [ ] API 문서 업데이트 (Swagger/OpenAPI, 선택)
- [ ] 사용자 가이드
  - [ ] 메모 작성 가이드
  - [ ] 단축키 목록
  - [ ] 템플릿 사용법
- [ ] 개발자 문서
  - [ ] 컴포넌트 문서
  - [ ] 훅 사용법
  - [ ] 상태 관리 구조

### 🐛 버그 수정 및 마무리 (2/2)

- [ ] 엣지 케이스 처리
  - [ ] 빈 메모 저장
  - [ ] 동시 편집 충돌
  - [ ] 대용량 파일 업로드
- [ ] 에러 메시지 개선 (한글 메시지)
- [ ] 접근성 개선
  - [ ] ARIA 레이블
  - [ ] 키보드 네비게이션
  - [ ] 스크린 리더 지원
- [ ] 보안 검토
  - [ ] XSS 방지
  - [ ] 파일 업로드 검증
  - [ ] 권한 체크

---

## 🎯 완료 기준

### 필수 기능
- [ ] 메모 CRUD 100% 구현
- [ ] 폴더/태그 시스템 완성
- [ ] 검색 기능 정상 작동
- [ ] 가계부 연동 완료
- [ ] 모든 메모 타입 지원 (텍스트, 체크리스트, 마크다운, 빠른 메모)
- [ ] 자동 저장 안정화
- [ ] 모바일 반응형 완벽 지원

### 성능 목표
- [ ] 메모 로딩 < 1초
- [ ] 검색 응답 < 500ms
- [ ] 자동 저장 < 300ms

### 통합 테스트
- [ ] 기존 대시보드와 원활한 연동
- [ ] 사용자 인증 흐름 정상
- [ ] 가계부 데이터 연결 확인
- [ ] 전체 시스템 안정성

---

## 📌 참고사항

### 기술 스택
- **프론트엔드**: React 19, TypeScript, Mantine v7, TanStack Query, Redux Toolkit
- **백엔드**: Express 5, TypeScript, Prisma, PostgreSQL
- **인증**: JWT (액세스 토큰 + 리프레시 토큰)

### 주요 Mantine 컴포넌트
- AppShell, NavLink, Card, Paper, Textarea, RichTextEditor
- MultiSelect, ColorPicker, Badge, Tooltip, ActionIcon
- Spotlight, Highlight, Dropzone, Progress, LoadingOverlay

### 개발 팁
```bash
# 서버 개발
cd server
npm run dev              # 개발 서버
npm run db:generate      # Prisma Client 생성
npm run db:migrate       # 마이그레이션
npm test                 # 테스트

# 클라이언트 개발
cd client
npm run dev              # 개발 서버
npm run build            # 빌드
```

---

**마지막 업데이트**: 2025-01-26
**총 작업 항목**: 90개
