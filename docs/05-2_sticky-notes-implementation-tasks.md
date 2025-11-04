# 스티커 메모 기능 구현 체크리스트

## Phase 1: 백엔드 구현

### 데이터베이스 설정
- [x] `server/prisma/schema.prisma`에 `StickyNote` 모델 추가
- [x] `User` 모델에 `stickyNotes` 관계 추가
- [x] `npm run db:generate` 실행
- [x] `npm run db:migrate` 실행 (마이그레이션 생성 및 적용)

### 검증 스키마
- [x] `server/src/validators/stickyNoteValidator.ts` 생성
- [x] 생성 요청 검증 스키마 작성 (content, color, position)
- [x] 수정 요청 검증 스키마 작성 (content, color)

### 서비스 레이어
- [x] `server/src/services/stickyNoteService.ts` 생성
- [x] `findAllByUserId()` 함수 구현 (사용자의 모든 메모 조회)
- [x] `create()` 함수 구현 (새 메모 생성)
- [x] `update()` 함수 구현 (메모 수정)
- [x] `delete()` 함수 구현 (메모 삭제)
- [x] `findById()` 함수 구현 (특정 메모 조회 - 권한 확인용)

### 컨트롤러
- [x] `server/src/controllers/stickyNoteController.ts` 생성
- [x] `getAll` 핸들러 구현 (GET /api/sticky-notes)
- [x] `create` 핸들러 구현 (POST /api/sticky-notes)
- [x] `update` 핸들러 구현 (PUT /api/sticky-notes/:id)
- [x] `delete` 핸들러 구현 (DELETE /api/sticky-notes/:id)
- [x] 에러 핸들링 추가 (404, 403, 400 등)

### 라우팅
- [x] `server/src/routes/stickyNoteRoutes.ts` 생성
- [x] GET `/` 라우트 설정 (인증 미들웨어 적용)
- [x] POST `/` 라우트 설정 (인증 + 검증 미들웨어)
- [x] PUT `/:id` 라우트 설정 (인증 + 검증 미들웨어)
- [x] DELETE `/:id` 라우트 설정 (인증 미들웨어)
- [x] `server/src/index.ts`에 `/api/sticky-notes` 라우트 등록

### 백엔드 테스트
- [ ] Postman/Thunder Client로 API 테스트
- [ ] 메모 생성 테스트 (최대 4개까지)
- [ ] 메모 조회 테스트
- [ ] 메모 수정 테스트
- [ ] 메모 삭제 테스트
- [ ] 권한 검증 테스트 (다른 사용자의 메모 접근 불가)

---

## Phase 2: 프론트엔드 구현

### 타입 정의
- [x] `client/src/types/stickyNote.ts` 생성
- [x] `StickyNote` 인터페이스 정의
- [x] `CreateStickyNoteDto` 타입 정의
- [x] `UpdateStickyNoteDto` 타입 정의
- [x] 색상 상수 정의 (STICKY_NOTE_COLORS)

### API 서비스
- [x] `client/src/services/api/stickyNotesApi.ts` 생성
- [x] `getAll()` 함수 구현
- [x] `create()` 함수 구현
- [x] `update()` 함수 구현
- [x] `deleteById()` 함수 구현

### 컴포넌트 - StickyNoteCard
- [x] `client/src/components/dashboard/StickyNoteCard.tsx` 생성
- [x] Props 인터페이스 정의 (note, onUpdate, onDelete)
- [x] Mantine Card 컴포넌트로 레이아웃 구성
- [x] Textarea 입력 필드 추가
- [x] 삭제 버튼 (ActionIcon with X) 추가
- [x] onBlur 이벤트로 자동 저장 구현
- [x] Debounce 적용 (500ms)
- [x] 배경색 적용 (note.color)
- [x] 호버 효과 및 그림자 스타일링
- [x] 로딩 상태 표시 (선택적)

### 컴포넌트 - CreateStickyNoteButton
- [x] `client/src/components/dashboard/CreateStickyNoteButton.tsx` 생성
- [x] Props 인터페이스 정의 (onCreate, nextPosition, availableColor)
- [x] "+" 아이콘 버튼 디자인
- [x] 호버 효과 추가
- [x] 클릭 시 onCreate 호출
- [x] 버튼 비활성화 상태 처리 (4개 모두 생성 시)

### 컴포넌트 - StickyNotes (메인 컨테이너)
- [x] `client/src/components/dashboard/StickyNotes.tsx` 생성
- [x] TanStack Query useQuery 훅 설정 (메모 목록 조회)
- [x] useMutation 훅 설정 (생성/수정/삭제)
- [x] 1x4 가로 그리드 레이아웃 구성 (Mantine Grid)
- [x] 메모 목록 렌더링 (최대 4개)
- [x] 빈 슬롯에 CreateStickyNoteButton 렌더링
- [x] 낙관적 업데이트(Optimistic Updates) 적용
- [x] 에러 핸들링 (토스트 알림)
- [x] 로딩 상태 처리
- [x] 삭제 확인 모달 추가 (선택적)

### 대시보드 통합
- [x] `client/src/pages/Dashboard.tsx` 수정
- [x] StickyNotes 컴포넌트 import
- [x] "주요 기능" 섹션 하단에 배치
- [x] 섹션 제목 추가 ("빠른 메모" 또는 "스티커 메모")
- [ ] 반응형 레이아웃 확인 (모바일, 태블릿, 데스크톱)

### 스타일링
- [x] 포스트잇 느낌의 디자인 구현
- [x] 4가지 색상 테마 적용
  - [x] 연한 노란색 (#FFF9C4)
  - [x] 연한 핑크색 (#FCE4EC)
  - [x] 연한 하늘색 (#E1F5FE)
  - [x] 연한 민트색 (#E0F2F1)
- [x] 텍스트 가독성 확보 (진한 회색/검정)
- [x] 그림자 효과 (box-shadow)
- [x] 호버 시 애니메이션 (transform: translateY)
- [x] 포커스 스타일링

---

## Phase 3: 테스트 및 최적화

### 기능 테스트
- [ ] 메모 없을 때 4개의 "+" 버튼 표시 확인
- [ ] 메모 생성 기능 테스트 (1개씩 추가)
- [ ] 자동 저장 기능 테스트 (포커스 아웃 시)
- [ ] 메모 수정 기능 테스트
- [ ] 메모 삭제 기능 테스트
- [ ] 4개 모두 생성 시 "+" 버튼 숨김 확인
- [ ] 페이지 새로고침 시 메모 유지 확인

### UI/UX 테스트
- [ ] 반응형 디자인 확인 (모바일, 태블릿, 데스크톱)
- [ ] 색상 대비 테스트 (텍스트 가독성)
- [ ] 애니메이션 부드러움 확인
- [ ] 로딩 상태 표시 확인
- [ ] 에러 메시지 표시 확인

### 성능 테스트
- [ ] Debounce 동작 확인 (불필요한 API 호출 방지)
- [ ] Optimistic updates 동작 확인 (즉각적인 UI 반응)
- [ ] 네트워크 에러 시 롤백 확인
- [ ] 메모리 누수 체크

### 접근성 테스트
- [ ] 키보드 네비게이션 테스트 (Tab, Enter, Escape)
- [ ] 스크린 리더 호환성 확인
- [ ] ARIA 라벨 추가 확인
- [ ] 색상 대비 확인 (WCAG AA 기준)

### 크로스 브라우저 테스트
- [ ] Chrome 테스트
- [ ] Firefox 테스트
- [ ] Safari 테스트
- [ ] Edge 테스트

---

## Phase 4: 문서화 및 배포

### 문서 업데이트
- [ ] CLAUDE.md 업데이트 (스티커 메모 기능 추가)
- [ ] README.md 업데이트 (선택적)
- [ ] API 문서 업데이트

### 코드 리뷰
- [ ] 코드 품질 확인 (ESLint, Prettier)
- [ ] TypeScript 타입 안정성 확인
- [ ] 보안 취약점 확인 (XSS, SQL Injection 등)
- [ ] 에러 핸들링 검토

### Git 작업
- [ ] 변경 사항 커밋
- [ ] 기능 브랜치 생성 (feature/sticky-notes)
- [ ] Pull Request 생성
- [ ] 코드 리뷰 요청

### 배포
- [ ] 개발 환경 배포 및 테스트
- [ ] 스테이징 환경 배포 및 테스트 (있는 경우)
- [ ] 프로덕션 배포

---

## 추가 개선 사항 (선택적)

### 향후 기능
- [ ] 드래그 앤 드롭으로 메모 순서 변경
- [ ] 메모 확장/축소 기능
- [ ] 색상 선택 UI 추가
- [ ] 마크다운 지원
- [ ] 메모 검색 기능
- [ ] 메모 내보내기 (텍스트 파일)
- [ ] 키보드 단축키 (Ctrl+N으로 새 메모)

### 성능 개선
- [ ] 가상화(Virtualization) 적용 (메모가 많아질 경우)
- [ ] 이미지 lazy loading (첨부파일 지원 시)
- [ ] Service Worker로 오프라인 지원

---

## 완료 기준

다음 항목이 모두 충족되면 작업 완료:
- [ ] 모든 Phase 1-3 체크리스트 완료
- [ ] 버그 없이 정상 동작
- [ ] 코드 리뷰 승인
- [ ] 문서화 완료
- [ ] 배포 완료

---

**작성일**: 2025-11-04
**작성자**: Claude Code
**예상 완료 기간**: 1-2일
