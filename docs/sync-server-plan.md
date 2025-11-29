# Novita 동기화 서버 구현 계획

## 목표와 범위
- Flutter 앱의 오프라인-우선 동기화 흐름을 서버에서 지원한다.
- 동기화 대상: 폴더, 노트(체크리스트/핀/보관/삭제 포함, 태그는 스펙 아웃).
- 정책: 최종 수정 시간 기반 LWW(Last Write Wins), 소프트 삭제 유지.
- 인증: 기존 JWT Access/Refresh 토큰 흐름 재사용(모든 sync API는 인증 필요).

## 전제/가정
- 앱은 로그인 직후 로컬 변경을 우선 Push 후 Pull 한다.
- 앱은 `lastSyncTimestamp`를 저장하며, 서버는 `updatedAt`/`deletedAt` 기준 증분 제공.
- 첨부파일은 기존 업로드 API 사용, sync 응답에는 메타데이터(경로/썸네일)만 포함.
- 폴더는 1 depth 구조만 지원(중첩 금지); parentId/children 자기참조 제거, 서버 검증/서비스에서 parentId를 거부하고 삭제는 소프트 삭제로 tombstone 제공.

## 데이터 모델 변경
- Prisma Note/Folder에 추가 필드 없음(기존 `updatedAt`, `deletedAt` 사용).
- 옵션: 전역 리비전이 필요하면 `RevisionCounter(userId PK, revision int)` 추가, 각 변경 시 증가.
  - 용도: strictly monotonic revision을 만들어 `sinceRevision` 기반 동기화(정렬/페이지 안정성 보장)에 활용.
  - 장점: 서버 시간이 약간 어긋나도 단조 증가 값을 사용해 누락/중복을 줄이고, limit 페이징 시 안전하게 이어갈 수 있음.
  - 단점: write마다 revision 증가 트랜잭션 필요(오버헤드), 마이그레이션 및 서비스 코드 추가 작업 필요.
  - 이번 계획은 우선 `updatedAt` 기반으로 진행하고, 실측 이슈(시간 드리프트/경합/누락) 발생 시 revision 방식으로 전환 옵션을 남겨둔다.
- 감사/디버깅용 `SyncLog` 테이블 추가: `{ id, userId, deviceId, entity, entityId, op, revisionOrTimestamp, createdAt }`로 기록(성능 부담 줄이려면 비동기/샘플링 적용 가능).
- 태그 스펙 아웃: 노트-태그 연동 제거. 서버/클라이언트 모두 노트 응답·페이로드에서 태그 필드를 제외하고, sync 응답에도 태그를 포함하지 않는다(관련 라우트/서비스는 별도 제거/무시).

## API 설계
### 1) 증분 조회 (Pull)
- `GET /api/sync`
  - query: `since` (ISO string, required), `limit`(기본 200, max 1000)
  - 응답:
    ```json
    {
      "folders": { "created": [], "updated": [], "deleted": [] },
      "notes": { "created": [], "updated": [], "deleted": [] },
      "latestTimestamp": "2024-01-01T00:00:00.000Z",
      "hasMore": false
    }
    ```
  - 포함 필드:
    - Folder: id, parentId, name, color, icon, updatedAt, deletedAt
    - Note: id, folderId, title, content, type, visibility, isPinned, isFavorite, isArchived, deletedAt, updatedAt, checklistItems[], attachments(meta)
  - 조회 조건: `updatedAt > since OR deletedAt > since`, userId 일치, 삭제 포함.
  - 정렬: updatedAt asc, tie-breaker id asc. 페이지네이션으로 hasMore 신호.

### 2) 변경 반영 (Push)
- 클라이언트는 기존 CRUD 엔드포인트를 그대로 사용:
  - 폴더: `POST/PUT/DELETE /api/folders`
  - 노트: `POST/PUT/DELETE /api/notes`, `POST /api/notes/:id/restore`, `POST /api/notes/:id/toggle`
  - 첨부/체크리스트/태그: 기존 라우트 사용
- 추가 배치 엔드포인트(선택):
  - `POST /api/sync` body `{ deviceId, changes: [{ op, entity: 'note'|'folder', id?, tempId?, data, baseUpdatedAt? }] }`
  - LWW 정책: 서버 updatedAt이 baseUpdatedAt보다 최신이면 conflict 응답(`status: 'conflict', serverEntity`), 아니면 적용.
  - 응답 `{ results: [...], latestTimestamp }`

### 3) 메타 조회
- `GET /api/sync/meta` → `{ latestTimestamp }` (빠른 변경 확인용, 선택)

## 서버 처리 흐름
- Pull:
  - since 파싱 → ISO 유효성 체크 → Prisma where 조건 생성 → limit+1 조회 → hasMore 결정 → latestTimestamp는 반환 목록 중 최대 updatedAt/deletedAt.
  - tombstone(삭제)은 `deletedAt` 세팅된 엔티티로 내려준다.
- Push (배치 옵션):
  - `prisma.$transaction`으로 처리, change 단위 부분 성공 허용 시 개별 트랜잭션.
  - 충돌 판단: baseUpdatedAt < 서버 updatedAt → conflict.
  - 적용 시 updatedAt를 `now`로 갱신, deletedAt null/세팅으로 상태 변경.

## Phase별 작업
### Phase 0: 분석/준비
- [x] 기존 노트/폴더 서비스 경로 확인(`noteService`, `folderService`, 체크리스트/태그/첨부).
- [x] 동기화 대상 필드 확정(노트 서브리소스 포함) 및 응답 스키마 합의.

### Phase 1: 스키마/인덱스
- [ ] 필요 시 `RevisionCounter` 테이블 추가(선택) + migration.
- [x] `updatedAt`/`deletedAt` 증분 조회에 필요한 인덱스 검토/추가(`userId, updatedAt`, `userId, deletedAt`).

### Phase 2: Sync Pull API
- [x] `GET /api/sync` 라우트/컨트롤러/validator 추가(`since`, `limit`).
- [x] 서비스 레이어에서 증분 조회 구현(폴더/노트 포함 관계 로드, pagination, hasMore 계산).
- [ ] 응답 스키마 정합성 테스트(샘플 스냅샷).

### Phase 3: Push/변경 반영 정합성
- [ ] 기존 CRUD 경로에서 updatedAt/deletedAt 일관 갱신 확인(restore 시 deletedAt null, toggle 시 updatedAt bump).
- [ ] 선택: `POST /api/sync` 배치 적용 엔드포인트 추가(충돌 시나리오 포함).
- [ ] LWW 충돌 처리 로직 및 응답 포맷 확정.

### Phase 4: 통합/QA
- [ ] 통합 테스트: since 필터, 삭제 tombstone, 페이지네이션 hasMore, 복구 흐름.
- [ ] 충돌 케이스 테스트(baseUpdatedAt 뒤쳐진 경우).
- [ ] 부하/성능 체크(대량 updatedAt scan, limit 튜닝).
- [ ] 모니터링/로그: sync 요청/응답 크기, 처리 시간, conflict 카운트.

### Phase 5: 문서/핸드오프
- [ ] OpenAPI/Swagger에 sync 엔드포인트 추가.
- [ ] 클라이언트 팀과 필드/타임스탬프 포맷 최종 확인(ISO 8601, UTC).
- [ ] 배포 체크리스트: env(CORS, CLIENT_URL), 마이그레이션, 롤백 전략.

## 테스트 시나리오(요약)
- since 이전/이후 변경 필터링, hasMore=true/false.
- 노트 삭제 후 pull에서 tombstone 수신 → 복원 시 updatedAt 상승 확인.
- 동시 수정: baseUpdatedAt 낡은 상태로 push 시 conflict 응답.
- 첨부/체크리스트/태그 포함 노트 생성/수정 후 pull에 서브리소스 포함 여부 확인.
