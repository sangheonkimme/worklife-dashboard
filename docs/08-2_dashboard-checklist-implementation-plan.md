# 대시보드 체크리스트 구현 체크리스트

## Phase 1: 백엔드 (DB + API)

### 데이터베이스 & Prisma
- [x] `server/prisma/schema.prisma`에 `DashboardChecklistItem` 모델 추가 (id, content, isCompleted, order, userId, createdAt, updatedAt)
- [x] `User` 모델에 `dashboardChecklistItems` 관계 추가
- [ ] 기존 스티커 메모 최대 3개 노출 정책 반영을 위한 `visibleSlot` 계산 방식 정의 (DB에는 전체 유지)
- [x] `npm run db:generate` 실행
- [ ] `npm run db:migrate` 실행 (마이그레이션 이름: `add_dashboard_checklist_items`)

### 검증 (Zod)
- [x] `server/src/validators/dashboardChecklistValidator.ts` 생성
- [x] 항목 생성 스키마 (`content`, `order` 옵셔널) 정의
- [x] 항목 상태 업데이트 스키마 (`content`, `isCompleted`) 정의
- [ ] 순서/완료 상태 일괄 업데이트 스키마 작성 (드래그 정렬 대비)

### 서비스 레이어
- [x] `server/src/services/dashboardChecklistService.ts` 생성
- [x] `getItemsByUser(userId)` 구현 (최대 7개 제한 로직 포함)
- [x] `createItem(userId, dto)` 구현 (순서 자동 부여)
- [x] `updateItem(itemId, dto, userId)` 구현 (소유권 검증)
- [x] 완료 상태 토글 시 order 재배치 로직 구현
- [x] `deleteItem(itemId, userId)` 구현
- [ ] 완료 항목 축소 표시를 위한 `archiveCompleted(userId)` 헬퍼(선택)

### 컨트롤러 & 라우트
- [x] `server/src/controllers/dashboardChecklistController.ts` 생성
- [x] GET `/api/dashboard-checklist` 핸들러 (사용자별 목록 + 완료 항목 요약)
- [x] POST `/api/dashboard-checklist` 핸들러 (항목 추가)
- [x] PATCH `/api/dashboard-checklist/:id` 핸들러 (내용/상태 업데이트)
- [x] DELETE `/api/dashboard-checklist/:id` 핸들러 (항목 삭제)
- [x] `server/src/routes/dashboardChecklistRoutes.ts` 생성 및 인증/검증 미들웨어 연결
- [x] `server/src/index.ts`에 `/api/dashboard-checklist` 라우트 등록

### 백엔드 테스트 & 에러 처리
- [ ] Postman/Thunder Client로 CRUD 플로우 테스트
- [ ] 항목 수 제한(최대 7개) 검증
- [ ] 완료 항목 재정렬 시 order gap 없이 유지 확인
- [ ] 권한 위반/존재하지 않는 ID 에러 응답 정리

---

## Phase 2: 프론트엔드 (UI + 상태)

### 타입/서비스 기본기
- [x] `client/src/types/dashboardChecklist.ts` 생성 (`DashboardChecklistItem`, DTO 타입들)
- [x] `client/src/services/api/dashboardChecklistApi.ts` 생성 (getList, createItem, updateItem, deleteItem)
- [ ] TanStack Query 전용 훅 및 Optimistic Update 설계

### 상태 & UX 규칙
- [x] 로컬 상태에서 미완료/완료 리스트 분리, 완료 리스트는 접기/펼치기 토글
- [x] 항목 최대치 도달 시 입력 비활성 + 안내 문구 처리
- [ ] 네트워크 실패 시 토스트 + 재시도 로직 공통 훅으로 분리

### 컴포넌트 구조
- [x] `client/src/components/dashboard/DashboardChecklist.tsx` 생성 (전체 컨테이너)
- [x] `ChecklistItemRow` (체크박스 + TextInput + 삭제 아이콘) 컴포넌트 분리
- [x] 완료 항목 Collapse UI 구현
- [x] Mantine `Checkbox`, `TextInput`, `ActionIcon`, `Stack` 활용
- [x] 입력 엔터 → 새 항목 추가, IME 조합 완료 후만 제출되도록 처리
- [ ] 체크/삭제 시 0.3초 내 피드백(색상/줄긋기) 제공
- [x] 빈 상태(항목 없음) 안내 메시지 + 샘플 플레이스홀더 작성

### 대시보드 통합 & 레이아웃 조정
- [x] `client/src/components/dashboard/StickyNotes.tsx`에서 렌더링 슬롯을 3개로 제한
- [x] StickyNotes 옆 그리드에 체크리스트 위젯 고정 배치
- [x] 반응형에서 체크리스트가 항상 마지막에 위치하도록 Grid breakpoints 조정
- [x] `DashboardPage` 섹션에 위젯 제목/설명 추가
- [ ] 테마 컬러/간격을 스티커 메모와 조화되도록 CSS 변수 혹은 Mantine theme 조정

### 사용자 경험 보강
- [x] 완료 항목 토글 텍스트("완료 N개 보기") 및 축소 상태 표시
- [ ] 1초 Undo 스낵바 (Mantine Notification) 구현 여부 결정 및 적용
- [ ] 키보드 접근성: Tab 이동, Space 체크, Delete 삭제 지원
- [ ] Tooltip으로 긴 텍스트 전체 표시

---

## Phase 3: QA, 문서화, 출시 준비

### 기능/QA 체크
- [ ] 데스크톱/태블릿/모바일 레이아웃 점검 (체크리스트 고정 위치 유지 여부)
- [ ] 항목 추가/체크/삭제/완료 토글/Undo 플로우 수동 테스트
- [ ] 새로고침 시 상태 일관성(TanStack Query 캐시 vs 서버 데이터) 확인
- [ ] Sticky Notes가 3개 초과일 때 UI가 어떻게 반응하는지 확인 및 안내 텍스트 적용
- [ ] 에러/오프라인 상황에서 재시도 동작 검증

### 접근성 & 성능
- [ ] Lighthouse 또는 Storybook a11y 체크 (색상 대비, ARIA 라벨)
- [ ] 키보드 전용 사용자 시나리오 테스트
- [ ] Debounce/Throttle 적용 여부 확인 (입력 과다 호출 방지)
- [ ] 완료 항목 많은 경우 렌더링 성능 확인

### 문서화 & 공유
- [ ] `CLAUDE.md` 또는 관련 개발자 가이드에 체크리스트 사용법/구성요소 추가
- [ ] 새 API 엔드포인트와 데이터 모델을 README 혹은 API 문서에 반영
- [ ] QA 결과/알려진 이슈를 docs/08-1 PRD 하단 오픈 이슈 섹션에 업데이트
- [ ] 배포 노트에 스티커 메모 슬롯 조정 + 체크리스트 기능 추가 내용 기록
