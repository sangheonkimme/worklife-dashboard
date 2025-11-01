# WorkLife Dashboard - 메모 앱 확장 기능 PRD

**버전**: 1.0  
**날짜**: 2025-01-23  
**작성자**: 개발팀  
**상태**: 초안  
**프로젝트 단계**: Phase 1.5 (확장 기능)

---

## 1. 제품 개요

### 1.1 기능 소개
WorkLife Dashboard의 확장 기능으로 **스마트 메모 앱**을 추가합니다. 단순한 메모 작성을 넘어 태그 시스템, 검색, 마크다운 지원, 가계부 연동 등 직장인의 업무와 일상을 효율적으로 관리할 수 있는 통합 메모 시스템입니다.

### 1.2 핵심 가치 제안
- **통합 관리**: 가계부, 급여계산기와 연동되는 메모 시스템
- **스마트 정리**: 태그, 폴더, 검색을 통한 체계적인 메모 관리
- **빠른 접근**: 단축키, 빠른 메모, 고정 메모 기능
- **다양한 포맷**: 텍스트, 마크다운, 체크리스트, 이미지 지원

### 1.3 목표 사용자
- 기존 WorkLife Dashboard 사용자
- 업무 메모와 개인 메모를 통합 관리하고 싶은 직장인
- 가계부 거래에 상세 메모를 남기고 싶은 사용자
- 할 일과 아이디어를 체계적으로 정리하고 싶은 사용자

### 1.4 성공 지표
- [ ] 기존 사용자의 70% 이상 메모 기능 사용
- [ ] 사용자당 평균 주 10개 이상 메모 작성
- [ ] 메모-가계부 연동 사용률 30% 이상
- [ ] 검색 기능 일 평균 사용 5회 이상
- [ ] 메모 기능 관련 버그 5개 이하

---

## 2. 기능 요구사항

### 2.1 메모 관리 핵심 기능

#### 2.1.1 메모 CRUD
**우선순위**: P0 (필수)

**기능 상세**:
- 메모 작성/수정/삭제
- 자동 저장 (3초 디바운스)
- 실시간 문자 수 표시
- 작성/수정 시간 자동 기록
- 삭제 시 휴지통으로 이동 (30일 보관)

**Mantine 컴포넌트**:
```javascript
- Textarea (기본 에디터)
- RichTextEditor (마크다운 에디터)
- ActionIcon (저장/삭제)
- Badge (상태 표시)
- Tooltip (도움말)
```

#### 2.1.2 메모 타입
**우선순위**: P0 (필수)

**지원 타입**:
1. **일반 메모**: 기본 텍스트 메모
2. **체크리스트**: 할 일 목록
3. **마크다운 메모**: 서식 있는 문서
4. **빠른 메모**: 임시 메모 (스티커 형태)
5. **가계부 연동 메모**: 거래에 연결된 메모

**UI 구성**:
```javascript
- SegmentedControl (타입 선택)
- Checkbox (체크리스트)
- Card (메모 카드)
- Paper (빠른 메모)
```

#### 2.1.3 폴더 & 태그 시스템
**우선순위**: P1 (높음)

**기능 상세**:
- 폴더 생성/수정/삭제
- 중첩 폴더 지원 (최대 3단계)
- 태그 생성 및 관리
- 태그 자동 완성
- 다중 태그 지원
- 태그별 색상 지정

**Mantine 컴포넌트**:
```javascript
- NavLink (폴더 트리)
- MultiSelect (태그 선택)
- ColorPicker (태그 색상)
- Badge (태그 표시)
- Tree (폴더 구조) // 커스텀 구현
```

### 2.2 검색 및 필터링

#### 2.2.1 스마트 검색
**우선순위**: P1 (높음)

**기능 상세**:
- 전문 검색
- 태그 필터링
- 날짜 범위 검색
- 메모 타입 필터
- 검색어 하이라이팅
- 최근 검색어 저장

**Mantine 컴포넌트**:
```javascript
- Spotlight (전역 검색)
- TextInput (검색 바)
- DateRangePicker (날짜 필터)
- Chip.Group (필터 선택)
- Highlight (검색어 강조)
```

#### 2.2.2 정렬 및 보기 옵션
**우선순위**: P2 (보통)

**옵션**:
- 정렬: 최신순/오래된순/이름순/수정일순
- 보기: 그리드/리스트/카드
- 메모 미리보기 on/off
- 태그 표시 on/off

### 2.3 가계부 연동 기능

#### 2.3.1 거래 메모 연결
**우선순위**: P1 (높음)

**기능 상세**:
- 거래 항목에 메모 연결
- 메모에서 거래 정보 참조
- 영수증 이미지 첨부
- 관련 거래 자동 추천

**UI 구성**:
```javascript
- Modal (거래 선택)
- Card (연결된 거래 정보)
- Dropzone (이미지 업로드)
- Anchor (거래 링크)
```

#### 2.3.2 예산 메모
**우선순위**: P2 (보통)

**기능 상세**:
- 월별 예산 계획 메모
- 지출 목표 메모
- 저축 목표 추적

### 2.4 고급 기능

#### 2.4.1 메모 템플릿
**우선순위**: P2 (보통)

**기본 템플릿**:
- 회의록
- 일일 업무 일지
- 주간 계획
- 쇼핑 리스트
- 프로젝트 계획

**Mantine 컴포넌트**:
```javascript
- Select (템플릿 선택)
- Card (템플릿 미리보기)
- Button (템플릿 적용)
```

#### 2.4.2 공유 및 내보내기
**우선순위**: P2 (보통)

**기능 상세**:
- 메모 공유 링크 생성
- PDF 내보내기
- Markdown 내보내기
- 인쇄 미리보기

#### 2.4.3 메모 고정 및 즐겨찾기
**우선순위**: P1 (높음)

**기능 상세**:
- 상단 고정 메모 (최대 5개)
- 즐겨찾기 등록
- 빠른 접근 사이드바

---

## 3. 기술 구현 사항

### 3.1 데이터베이스 스키마

```sql
-- 메모 테이블
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
  title VARCHAR(255),
  content TEXT,
  type ENUM('text', 'checklist', 'markdown', 'quick', 'linked') DEFAULT 'text',
  is_pinned BOOLEAN DEFAULT false,
  is_favorite BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP NULL
);

-- 폴더 테이블
CREATE TABLE folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(20) DEFAULT 'blue',
  icon VARCHAR(50) DEFAULT 'IconFolder',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 태그 테이블
CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  color VARCHAR(20) DEFAULT 'gray',
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- 메모-태그 연결 테이블
CREATE TABLE note_tags (
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (note_id, tag_id)
);

-- 메모-거래 연결 테이블
CREATE TABLE note_transactions (
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  PRIMARY KEY (note_id, transaction_id)
);

-- 체크리스트 항목 테이블
CREATE TABLE checklist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
  content VARCHAR(500) NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 메모 템플릿 테이블
CREATE TABLE note_templates (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  content TEXT,
  type VARCHAR(50),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 메모 첨부파일 테이블
CREATE TABLE note_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  uploaded_at TIMESTAMP DEFAULT NOW()
);
```

### 3.2 API 엔드포인트

```
# 메모 API
GET    /api/notes              # 메모 목록 (페이지네이션, 필터)
GET    /api/notes/:id          # 메모 상세
POST   /api/notes              # 메모 생성
PUT    /api/notes/:id          # 메모 수정
DELETE /api/notes/:id          # 메모 삭제 (소프트 삭제)
POST   /api/notes/:id/pin      # 메모 고정
POST   /api/notes/:id/favorite # 즐겨찾기
POST   /api/notes/:id/archive  # 보관함 이동
GET    /api/notes/trash        # 휴지통 목록
POST   /api/notes/:id/restore  # 메모 복구
DELETE /api/notes/:id/permanent # 영구 삭제

# 폴더 API
GET    /api/folders            # 폴더 목록
POST   /api/folders            # 폴더 생성
PUT    /api/folders/:id        # 폴더 수정
DELETE /api/folders/:id        # 폴더 삭제
POST   /api/folders/:id/move   # 폴더 이동

# 태그 API
GET    /api/tags               # 태그 목록
POST   /api/tags               # 태그 생성
PUT    /api/tags/:id           # 태그 수정
DELETE /api/tags/:id           # 태그 삭제
GET    /api/tags/suggest       # 태그 자동완성

# 체크리스트 API
GET    /api/notes/:id/checklist      # 체크리스트 항목
POST   /api/notes/:id/checklist      # 항목 추가
PUT    /api/checklist/:id            # 항목 수정
DELETE /api/checklist/:id            # 항목 삭제
POST   /api/checklist/:id/toggle     # 완료 토글

# 검색 API
GET    /api/notes/search       # 메모 검색
GET    /api/notes/recent       # 최근 메모
GET    /api/notes/stats        # 메모 통계

# 템플릿 API
GET    /api/templates          # 템플릿 목록
POST   /api/templates          # 템플릿 생성
PUT    /api/templates/:id      # 템플릿 수정
DELETE /api/templates/:id      # 템플릿 삭제

# 연동 API
POST   /api/notes/:id/link-transaction  # 거래 연결
DELETE /api/notes/:id/unlink/:tid      # 거래 연결 해제
GET    /api/transactions/:id/notes     # 거래별 메모

# 내보내기 API
GET    /api/notes/:id/export/pdf       # PDF 내보내기
GET    /api/notes/:id/export/markdown  # Markdown 내보내기
POST   /api/notes/:id/share           # 공유 링크 생성
```

### 3.3 프론트엔드 컴포넌트 구조

```
client/src/features/notes/
├── components/
│   ├── NoteEditor/
│   │   ├── TextEditor.tsx
│   │   ├── MarkdownEditor.tsx
│   │   ├── ChecklistEditor.tsx
│   │   └── EditorToolbar.tsx
│   ├── NoteList/
│   │   ├── NoteCard.tsx
│   │   ├── NoteGrid.tsx
│   │   ├── NoteListItem.tsx
│   │   └── EmptyState.tsx
│   ├── NoteSidebar/
│   │   ├── FolderTree.tsx
│   │   ├── TagList.tsx
│   │   ├── PinnedNotes.tsx
│   │   └── QuickActions.tsx
│   ├── NoteSearch/
│   │   ├── SearchBar.tsx
│   │   ├── SearchFilters.tsx
│   │   └── SearchResults.tsx
│   └── NoteModals/
│       ├── TemplateModal.tsx
│       ├── LinkTransactionModal.tsx
│       └── ShareModal.tsx
├── hooks/
│   ├── useNotes.ts
│   ├── useNoteTags.ts
│   ├── useNoteSearch.ts
│   └── useAutoSave.ts
├── services/
│   └── noteService.ts
└── store/
    └── noteSlice.ts
```

---

## 4. UI/UX 디자인

### 4.1 레이아웃 구조

```javascript
// 메모 앱 메인 레이아웃
<AppShell>
  <AppShell.Navbar width={250}>
    {/* 좌측 사이드바 */}
    <Stack>
      <Button leftIcon={<IconPlus />}>새 메모</Button>
      <TextInput placeholder="메모 검색..." />
      <Divider />
      <NavLink label="모든 메모" />
      <NavLink label="즐겨찾기" />
      <NavLink label="최근 메모" />
      <Divider />
      {/* 폴더 트리 */}
      <FolderTree />
      <Divider />
      {/* 태그 목록 */}
      <TagCloud />
    </Stack>
  </AppShell.Navbar>
  
  <AppShell.Main>
    <Grid>
      <Grid.Col span={4}>
        {/* 메모 목록 */}
        <NoteList />
      </Grid.Col>
      <Grid.Col span={8}>
        {/* 메모 에디터 */}
        <NoteEditor />
      </Grid.Col>
    </Grid>
  </AppShell.Main>
</AppShell>
```

### 4.2 모바일 대응

```javascript
// 모바일 레이아웃
const isMobile = useMediaQuery('(max-width: 48em)');

if (isMobile) {
  return (
    <Stack>
      <Affix position={{ bottom: 20, right: 20 }}>
        <ActionIcon size="xl" radius="xl">
          <IconPlus />
        </ActionIcon>
      </Affix>
      {showEditor ? <NoteEditor /> : <NoteList />}
    </Stack>
  );
}
```

### 4.3 다크 테마 색상 팔레트

```javascript
const noteTheme = {
  colors: {
    // 메모 타입별 색상
    text: 'gray',
    checklist: 'blue',
    markdown: 'violet',
    quick: 'yellow',
    linked: 'teal',
    
    // 태그 색상
    tagColors: [
      'red', 'pink', 'grape', 'violet',
      'indigo', 'blue', 'cyan', 'teal',
      'green', 'lime', 'yellow', 'orange'
    ]
  }
};
```

---

## 5. 개발 체크리스트

## 📅 개발 일정: 4주

### 1주차: 기반 구축 및 기본 CRUD

#### 🗄️ 데이터베이스 설정
- [ ] 메모 관련 테이블 생성
  - [ ] notes 테이블
  - [ ] folders 테이블
  - [ ] tags 테이블
  - [ ] note_tags 연결 테이블
  - [ ] checklist_items 테이블
- [ ] Prisma 스키마 업데이트
- [ ] 마이그레이션 실행
- [ ] 시드 데이터 작성 (샘플 메모, 기본 폴더)

#### 🔙 백엔드 - 메모 CRUD API
- [ ] 메모 서비스 레이어 구현
  - [ ] createNote
  - [ ] updateNote
  - [ ] deleteNote (소프트 삭제)
  - [ ] getNotes (페이지네이션)
  - [ ] getNoteById
- [ ] 메모 컨트롤러 구현
  - [ ] POST /api/notes
  - [ ] PUT /api/notes/:id
  - [ ] DELETE /api/notes/:id
  - [ ] GET /api/notes
  - [ ] GET /api/notes/:id
- [ ] 입력 검증 (Zod)
- [ ] 에러 핸들링

#### 🎨 프론트엔드 - 기본 UI 구조
- [ ] 메모 레이아웃 컴포넌트
  - [ ] `NoteLayout.tsx` (AppShell 기반)
  - [ ] 사이드바 컴포넌트
  - [ ] 메인 콘텐츠 영역
- [ ] 메모 목록 컴포넌트
  - [ ] `NoteList.tsx`
  - [ ] `NoteCard.tsx`
  - [ ] 빈 상태 컴포넌트
- [ ] 기본 메모 에디터
  - [ ] `TextEditor.tsx`
  - [ ] 자동 저장 구현
  - [ ] 문자 수 카운터
- [ ] Redux 스토어 설정
  - [ ] noteSlice 생성
  - [ ] 액션 정의
  - [ ] 셀렉터 정의

### 2주차: 폴더/태그 시스템 및 검색

#### 🔙 백엔드 - 폴더 & 태그 API
- [ ] 폴더 API 구현
  - [ ] GET /api/folders
  - [ ] POST /api/folders
  - [ ] PUT /api/folders/:id
  - [ ] DELETE /api/folders/:id
  - [ ] 중첩 폴더 로직
- [ ] 태그 API 구현
  - [ ] GET /api/tags
  - [ ] POST /api/tags
  - [ ] PUT /api/tags/:id
  - [ ] DELETE /api/tags/:id
  - [ ] GET /api/tags/suggest (자동완성)
- [ ] 메모-태그 연결 로직
- [ ] 검색 API 구현
  - [ ] GET /api/notes/search
  - [ ] 전문 검색 (PostgreSQL Full-Text Search)
  - [ ] 필터링 로직 (태그, 날짜, 타입)

#### 🎨 프론트엔드 - 폴더/태그 UI
- [ ] 폴더 트리 컴포넌트
  - [ ] `FolderTree.tsx`
  - [ ] 폴더 생성/수정/삭제 모달
  - [ ] 드래그 앤 드롭 (선택)
- [ ] 태그 관리 컴포넌트
  - [ ] `TagManager.tsx`
  - [ ] `TagInput.tsx` (MultiSelect)
  - [ ] 태그 클라우드
  - [ ] 색상 선택기
- [ ] 검색 컴포넌트
  - [ ] `SearchBar.tsx`
  - [ ] Spotlight 통합
  - [ ] 검색 필터 UI
  - [ ] 검색 결과 하이라이팅
- [ ] 메모 필터링 로직
  - [ ] 폴더별 필터
  - [ ] 태그별 필터
  - [ ] 조합 필터

### 3주차: 고급 기능 및 가계부 연동

#### 🔙 백엔드 - 고급 기능 API
- [ ] 체크리스트 API
  - [ ] POST /api/notes/:id/checklist
  - [ ] PUT /api/checklist/:id
  - [ ] DELETE /api/checklist/:id
  - [ ] POST /api/checklist/:id/toggle
- [ ] 메모 액션 API
  - [ ] POST /api/notes/:id/pin
  - [ ] POST /api/notes/:id/favorite
  - [ ] POST /api/notes/:id/archive
- [ ] 템플릿 API
  - [ ] GET /api/templates
  - [ ] POST /api/templates
  - [ ] 기본 템플릿 시드
- [ ] 가계부 연동 API
  - [ ] POST /api/notes/:id/link-transaction
  - [ ] GET /api/transactions/:id/notes
- [ ] 파일 업로드 API
  - [ ] Multer 설정
  - [ ] 이미지 업로드 엔드포인트

#### 🎨 프론트엔드 - 고급 기능 UI
- [ ] 체크리스트 에디터
  - [ ] `ChecklistEditor.tsx`
  - [ ] 드래그 앤 드롭 정렬
  - [ ] 진행률 표시
- [ ] 마크다운 에디터
  - [ ] `MarkdownEditor.tsx`
  - [ ] 미리보기 토글
  - [ ] 툴바 구현
- [ ] 빠른 메모 컴포넌트
  - [ ] `QuickNote.tsx`
  - [ ] 플로팅 위젯
  - [ ] 자동 저장
- [ ] 템플릿 시스템
  - [ ] `TemplateModal.tsx`
  - [ ] 템플릿 선택 UI
  - [ ] 커스텀 템플릿 생성
- [ ] 가계부 연동
  - [ ] `LinkTransactionModal.tsx`
  - [ ] 거래 선택 UI
  - [ ] 연결된 거래 표시
- [ ] 파일 첨부
  - [ ] Dropzone 컴포넌트
  - [ ] 이미지 미리보기
  - [ ] 파일 목록 관리

### 4주차: 최적화, 테스트 및 마무리

#### ⚡ 성능 최적화
- [ ] 메모 목록 가상화 (react-window)
- [ ] 이미지 lazy loading
- [ ] 검색 디바운싱
- [ ] 자동 저장 최적화
- [ ] 메모 내용 압축 (긴 메모)
- [ ] 인덱스 최적화
  - [ ] 검색 인덱스
  - [ ] 날짜 인덱스
  - [ ] 사용자별 인덱스

#### 🎨 UI/UX 개선
- [ ] 로딩 상태
  - [ ] Skeleton 로더
  - [ ] 저장 중 인디케이터
- [ ] 애니메이션
  - [ ] 페이지 전환
  - [ ] 메모 추가/삭제
  - [ ] 폴더 확장/축소
- [ ] 단축키 구현
  - [ ] 새 메모 (Ctrl+N)
  - [ ] 검색 (Ctrl+K)
  - [ ] 저장 (Ctrl+S)
  - [ ] 삭제 (Delete)
- [ ] 모바일 최적화
  - [ ] 스와이프 제스처
  - [ ] 하단 시트
  - [ ] 플로팅 액션 버튼
- [ ] 다크/라이트 테마
  - [ ] 에디터 테마
  - [ ] 코드 하이라이팅

#### 📱 반응형 테스트
- [ ] 모바일 (320px - 768px)
  - [ ] 에디터 레이아웃
  - [ ] 메모 목록
  - [ ] 검색 인터페이스
- [ ] 태블릿 (768px - 1024px)
  - [ ] 분할 뷰
  - [ ] 사이드바 토글
- [ ] 데스크톱 (1024px+)
  - [ ] 3컬럼 레이아웃

#### 🧪 테스트
- [ ] 단위 테스트
  - [ ] 메모 서비스 테스트
  - [ ] 검색 로직 테스트
  - [ ] 자동 저장 테스트
- [ ] 통합 테스트
  - [ ] API 엔드포인트 테스트
  - [ ] 가계부 연동 테스트
- [ ] E2E 테스트
  - [ ] 메모 작성 플로우
  - [ ] 검색 및 필터
  - [ ] 태그/폴더 관리

#### 🚀 배포 준비
- [ ] 환경 변수 설정
  - [ ] 파일 업로드 경로
  - [ ] 검색 설정
- [ ] 데이터베이스 마이그레이션
- [ ] 기존 시스템 통합 테스트
- [ ] 성능 벤치마크
  - [ ] 1000개 메모 로딩
  - [ ] 검색 응답 시간
  - [ ] 자동 저장 부하

#### 📝 문서화
- [ ] API 문서 업데이트
- [ ] 사용자 가이드
  - [ ] 메모 작성 가이드
  - [ ] 단축키 목록
  - [ ] 템플릿 사용법
- [ ] 개발자 문서
  - [ ] 컴포넌트 문서
  - [ ] 훅 사용법
  - [ ] 상태 관리 구조

#### 🐛 버그 수정 및 마무리
- [ ] 엣지 케이스 처리
  - [ ] 빈 메모 저장
  - [ ] 동시 편집 충돌
  - [ ] 대용량 파일 업로드
- [ ] 에러 메시지 개선
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

### 기능별 체크리스트
- [ ] 메모 CRUD 100% 구현
- [ ] 폴더/태그 시스템 완성
- [ ] 검색 기능 정상 작동
- [ ] 가계부 연동 완료
- [ ] 모든 메모 타입 지원
- [ ] 자동 저장 안정화
- [ ] 모바일 반응형 완벽 지원
- [ ] 성능 목표 달성
  - [ ] 메모 로딩 < 1초
  - [ ] 검색 응답 < 500ms
  - [ ] 자동 저장 < 300ms

### 통합 테스트
- [ ] 기존 대시보드와 원활한 연동
- [ ] 사용자 인증 흐름 정상
- [ ] 가계부 데이터 연결 확인
- [ ] 전체 시스템 안정성

---

## 📊 진행률 추적

### 1주차 진행률: ____%
- 데이터베이스: ____%
- 백엔드 CRUD: ____%
- 프론트엔드 기본 UI: ____%

### 2주차 진행률: ____%
- 폴더/태그 시스템: ____%
- 검색 기능: ____%

### 3주차 진행률: ____%
- 고급 기능: ____%
- 가계부 연동: ____%

### 4주차 진행률: ____%
- 최적화: ____%
- 테스트: ____%
- 배포: ____%

**전체 진행률**: ____%

---

## 🔗 관련 문서 및 리소스

- **기존 PRD**: `/mantine-prd-korean.md`
- **기존 체크리스트**: `/mantine-checklist-korean.md`
- **Mantine 문서**: https://mantine.dev
- **Tiptap Editor**: https://tiptap.dev (마크다운 에디터 옵션)
- **DnD Kit**: https://dndkit.com (드래그 앤 드롭)

---

## 💡 개발 팁

### Mantine 컴포넌트 활용
```javascript
// Spotlight 검색 구현
import { spotlight } from '@mantine/spotlight';

spotlight.open(); // 검색 열기

// 자동 저장 훅
import { useDebouncedValue } from '@mantine/hooks';

const [debouncedContent] = useDebouncedValue(content, 3000);

// 로컬 스토리지 동기화
import { useLocalStorage } from '@mantine/hooks';

const [draft, setDraft] = useLocalStorage({
  key: 'note-draft',
  defaultValue: '',
});
```

### Claude Code 프롬프트 예시
```bash
# 메모 에디터 생성
"Create a rich text editor for notes using Mantine components 
with auto-save, markdown support, and Korean language"

# 태그 시스템 구현
"Build a tag management system with Mantine MultiSelect, 
color picker, and auto-completion"

# 검색 UI 구현
"Implement a note search interface using Mantine Spotlight 
with filters, highlighting, and Korean search support"
```

---

**마지막 업데이트**: 2025-01-23  
**작성자**: 개발팀

이제 메모 앱 기능이 기존 WorkLife Dashboard와 완벽하게 통합되어 사용자들에게 더 나은 생산성 도구를 제공할 수 있습니다! 🚀
