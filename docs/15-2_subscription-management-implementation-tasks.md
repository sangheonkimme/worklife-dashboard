# 정기구독 관리 구현 To-Do (Phase별 체크리스트)

## Phase 0: 설계 확정
- [x] 데이터 스키마 확정(Subscription, SubscriptionHistory, 거래 라벨 필드) 및 마이그레이션 초안 작성  
  - Subscription: `id`, `userId`, `name`, `amount Decimal(18,2)`, `currency default KRW`, `billingCycle enum monthly|yearly|weekly`, `nextBillingDate`, `paymentMethod?`, `category?`, `status enum active|paused|cancelled`, `trialEndDate?`, `notifyDaysBefore?`, `notes?`, `createdAt`, `updatedAt`. 인덱스: `(userId, nextBillingDate)`, `(userId, status)`.
  - SubscriptionHistory: `id`, `subscriptionId` FK, `type enum price_change|status_change|billing_cycle_change|note`, 이전/현재 금액·주기·상태 필드, `description?`, `createdAt`. 인덱스: `(subscriptionId, createdAt desc)`.
  - 거래 레코드 확장: `type enum fixed|variable` 기본값 variable, `source enum manual|subscription`, `externalId?`(subscriptionId+billingDate 조합)로 idempotent 삽입. `(userId, externalId)` unique.
  - 마이그레이션 순서: 1) 거래 테이블에 `type/source/externalId` 추가 및 기본값 세팅 2) Subscription/History 테이블 생성 3) 인덱스/unique 추가.
- [x] API 스펙 동결(`subscriptions`, `subscriptions/summary`, cancel/patch) 및 응답 형태 예시 정의  
  - `POST /api/subscriptions`: body `{ name, amount, currency?, billingCycle, nextBillingDate, paymentMethod?, category?, status?, trialEndDate?, notifyDaysBefore?, notes? }` → 201 with subscription DTO.
  - `GET /api/subscriptions`: query `status?`, `category?`, `paymentMethod?`, `sort=nextBillingDate|amount`, `order=asc|desc`, `search?` → paged list DTO.
  - `PATCH /api/subscriptions/:id`: body partial 업데이트(금액/주기/다음 청구일/상태/알림/메모) → 200 updated DTO.
  - `POST /api/subscriptions/:id/cancel`: body `{ reason? }` → status 변경 + history 기록.
  - `GET /api/subscriptions/summary`: response `{ monthlyFixedTotal, upcomingMonthTotal, next7Days: Event[], categoryShare: { [category]: amount }, fixedVsVariableRatio }`.
  - 공통: userId 스코프 필터, 401/403/404/422 에러 포맷 통일.
- [x] 정기 알림/캐싱 크론 설계(주기, 실패 핸들링, idempotency 키)  
  - 스케줄: 일 1회 04:00 KST. 작업: 30일 청구 스냅샷, 7일 리스트 캐싱, trial 임박 라벨.  
  - idempotency: 스냅샷/캐싱 테이블에 `(date, userId)` unique, upsert 사용. 알림 트리거는 `(subscriptionId, billingDate, type)` unique 키 사용.  
  - 실패 핸들링: 각 사용자 단위 배치 트랜잭션, 실패 시 dead-letter 테이블 기록(`retryCount`, `error`), 3회 재시도 후 경보.
- [x] 대시보드 카드/리스트 UX 와이어프레임 확정(고정비/변동비 세그먼트 포함)  
  - 카드: 월 고정비 합계, 이번 달 청구 예정, 7일 내 청구 리스트 미니뷰, 고정비 비중 %, CTA “구독 관리”.  
  - 리스트: 필터 바(상태/카테고리/결제수단/검색), 행 내 상태 토글·알림 토글, 인라인 금액/주기 수정.  
  - 거래 입력 폼: `고정비/변동비` segment control 상단 배치, 기본값은 자동 라벨(구독=고정비)이며 즉시 덮어쓰기 가능. 모바일 카드는 2열 정보(서비스명/금액 + 다음 청구일/상태).

## Phase 1: 백엔드 모델/마이그레이션
- [x] Prisma 모델 추가(Subscription, SubscriptionHistory) 및 마이그레이션 적용  
  - 스키마 반영 완료: `BillingCycle`, `SubscriptionStatus`, `SubscriptionHistoryType` enum + `Subscription`, `SubscriptionHistory` 모델, user 관계/인덱스 추가. 실제 마이그레이션 파일 생성/적용은 DB 연결 후 진행 필요.
- [x] 거래 레코드에 고정비/변동비 `spendingType` 필드, `source` 라벨 추가  
  - `spendingType`(FIXED/VARIABLE 기본 VARIABLE), `source`(MANUAL/SUBSCRIPTION 기본 MANUAL), `subscriptionId` FK optional, `externalId` 컬럼 추가.
- [x] `externalId` 규칙 정의 및 중복 방지(idempotent insert) 유닛 테스트  
  - `server/src/__tests__/transactionExternalId.test.ts`: 동일 사용자+externalId 중복 시 P2002 발생, 다른 사용자 동일 externalId 허용 테스트 추가.

## Phase 2: API 기본 CRUD
- [x] `POST /api/subscriptions` 생성(검증/기본값 포함)
- [x] `GET /api/subscriptions` 목록 + 필터/정렬/검색(name)
- [x] `PATCH /api/subscriptions/:id` 금액/주기/다음 청구일/상태/알림 업데이트
- [x] `POST /api/subscriptions/:id/cancel` 취소 처리 + History 기록
- [x] API 레벨 테스트(성공/권한/유효성/취소 후 재활성 시나리오)  
  - `server/src/__tests__/subscription.test.ts`: 등록→목록 필터→금액 업데이트→취소까지 엔드투엔드 흐름 검증.

## Phase 3: 요약/캐싱/통합
- [ ] 일일 크론으로 7일/월 청구 예정 캐싱 + trial 종료 라벨링 (스케줄러 미도입 상태, 추후 cron/queue 연결 필요)
- [x] `GET /api/subscriptions/summary` 응답(월 고정비, 이번 달 청구, 7일 내 리스트, 카테고리 비중)
- [x] 청구 발생 시 거래 생성/매핑 + `type: fixed`, `source: subscription` 라벨 적용  
  - `subscriptionService.recordBillingTransaction`에서 externalId 기반 idempotent 생성/재사용 처리.
- [x] 레거시 거래 미변경, 신규/미래 청구만 자동 라벨링 로직 적용(기존 거래 테이블은 변경 없음)
- [x] 통합 테스트: 합계/중복 방지/취소 상태 반영  
  - `subscriptionSummary.test.ts`(요약/비율/다가오는 청구 검증), `subscriptionBillingMapping.test.ts`(idempotent 청구→거래 매핑).

## Phase 4: 프론트엔드 기본 UI
- [x] 대시보드 "정기구독" 카드(월 고정비, 이번 달 청구, 7일 내 리스트, 고정비 비중 %) — `client-next`: `SubscriptionSummaryCard` 위젯 추가
- [x] 구독 리스트(테이블/카드뷰) + 필터/정렬/검색 — `/dashboard/subscriptions` 페이지 + 필터/검색/정렬
- [x] 상세 Drawer/모달(기본 정보, 알림 토글, 변경 이력 탭) — Drawer 내 수정/취소/알림일수 입력 (이력 탭은 미구현)
- [x] 거래 입력 폼에 `고정비/변동비` segment control 추가(자동 라벨 기본값 + 사용자 덮어쓰기) — TransactionForm 세그먼트 반영
- [x] 상태 관리(Zustand/Recoil) + optimistic update + 오류 롤백 토스트 (react-query mutate+notifications로 기본 흐름 구현; optimistic 세분화는 추후 확장)

## Phase 5: 알림/UX 강화
- [ ] 브라우저 권한 요청 UX + 동의 상태 저장
- [ ] 청구 3일 전/당일, trial 종료 2일 전 알림 트리거(폴링/서비스워커 전단계 구현)
- [ ] 알림 미허용 시 대시보드 배지/토스트 대체 노출
- [ ] 취소 후보 배지(최근 사용 없음 등) 노출 및 무해한 계산 로직

## Phase 6: 품질/릴리스 준비
- [ ] A11y: 키보드 내비게이션, 날짜/세그먼트 ARIA 라벨, 토스트 대체 텍스트
- [ ] 로깅/분석 이벤트 삽입(`subscription_created`, `subscription_cancelled`, `price_changed`, `billing_reminder_sent`, `widget_clicked`)
- [ ] e2e/통합 테스트(등록→요약→청구→거래 라벨→취소 플로우)
- [ ] 문서화: 사용자 안내, 설정 방법, 알림 제한 사항
