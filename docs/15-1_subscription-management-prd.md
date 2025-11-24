# 정기구독 관리 기능 PRD

## 1. 개요
- **목적**: 가계부 대시보드에서 정기구독 지출을 등록·추적·관리해 월 고정비를 즉시 파악하고, 청구 전 알림과 가격 변동에 대응할 수 있게 한다.
- **범위**: 대시보드 위젯, 정기구독 목록/상세/편집, 청구 예정 알림, 통계 요약(월 고정비, 곧 청구될 금액), 취소/가격 변경 기록.
- **비범위**: 카드사/앱스토어 자동 연동, 환불 처리, 다중 통화 환산, 가족 공유.

## 1.1 가계부 통합 방향
- 가계부의 지출을 **고정비/변동비**로 분류하고, 정기구독을 고정비로 자동 편입해 총액을 한 번에 확인.
- 정기구독 결제 발생 시 해당 거래를 자동 라벨링(`fixed`)하여 고정비 지출 리포트와 예산 집행률에 반영.
- 변동비 대비 고정비 비중(%)을 대시보드 카드에 함께 노출해 월별 재량 소비 여력을 즉시 파악.

## 2. 문제 정의 & 가설
- 문제: 정기구독이 늘어나면서 월 고정비가 불투명하고, 청구일/가격 인상/무료체험 종료를 놓쳐 불필요한 결제가 발생.
- 가설: 청구 예정 금액과 취소 대상 후보를 한눈에 보여주고 알림을 제공하면, 사용자는 불필요한 구독을 줄이고 월 고정비를 제어할 수 있다.

## 3. 목표 지표
- 대시보드 정기구독 위젯 노출 대비 클릭률 ≥ 30%.
- 정기구독 최초 등록 후 7일 내 알림 허용률 ≥ 40%.
- 30일 내 취소/가격 변경 기록 비중 ≥ 15% (구독 관리 행동 유도).
- 월 고정비 합계 조회 반복 사용자 비중 ≥ 25%.

## 4. 주요 사용자 시나리오
1) 신규 구독 등록: 서비스명/금액/주기/다음 청구일/결제수단을 입력하고 알림을 켠다.  
2) 청구 전 확인: 대시보드에서 이번 달 예상 구독 비용과 7일 내 청구 목록을 확인, 불필요 항목을 취소 표시한다.  
3) 변경/취소 기록: 가격 인상 또는 플랜 변경을 기록하고, 상태를 `취소됨`으로 전환해 이후 청구 계산에서 제외한다.  
4) 무료체험 종료 관리(선택): trial 종료일을 넣어 종료 2일 전 알림을 받는다.

## 5. 요구사항

### 5.1 기능
- 정기구독 CRUD: 등록/수정/삭제(소프트)/취소 상태 전환, 가격·주기 변경 이력 기록.
- 목록/필터: 상태(활성/취소), 카테고리(엔터테인먼트/생산성 등), 결제수단별, 금액순/청구일순 정렬, 검색(서비스명).
- 대시보드 위젯:
  - 월 고정비 합계, 이번 달 청구 예정 금액(남은 기간), 7일 내 청구 리스트.
  - `취소 후보` 뱃지: 최근 60일 미사용 메모/사용자 표시(입력 기반).
- 알림: 청구 3일 전, 당일; 가격 인상/주기 변경 시; trial 종료 2일 전(옵션).
- 요약: 카테고리별 비중, 결제수단별 지출, 평균 ARPU(월) 변화 추이 간단 차트.
- 거래 입력 제어: 거래 등록/편집 시 `고정비/변동비` segment control을 제공하여 사용자가 직접 라벨을 설정하거나 수정 가능.

### 5.2 UX/UI
- 대시보드 카드: "정기구독" 카드에 월 고정비, 이번 달 청구 예정, 7일 내 리스트(도트 색: 활성=민트, 취소=회색).
- 상세 Drawer/모달: 기본 정보(서비스명/금액/주기/다음 청구일/결제수단/상태), 노트, 변경 이력 탭.
- 빠른 편집: 리스트에서 상태 토글(활성↔취소), 금액/주기 인라인 편집, 알림 온/오프.
- 빈 상태: "첫 구독을 추가하고 청구 전 알림을 받아보세요" CTA.
- 거래 입력 UX: 지출 입력 폼에 `고정비/변동비` segment control 배치, 기본값은 자동 라벨(구독=고정비)이나 사용자가 즉시 덮어쓰기 가능.

### 5.3 데이터/도메인
```prisma
model Subscription {
  id              String   @id @default(cuid())
  userId          String
  name            String
  amount          Decimal
  currency        String   @default("KRW")
  billingCycle    String   // monthly, yearly, weekly 등
  nextBillingDate DateTime
  paymentMethod   String?  // card_xxx, account_xxx
  category        String?
  status          String   // active, paused, cancelled
  trialEndDate    DateTime?
  notifyDaysBefore Int?    // 예: 3
  notes           String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model SubscriptionHistory {
  id             String   @id @default(cuid())
  subscriptionId String
  type           String   // price_change, status_change, billing_cycle_change, note
  prevAmount     Decimal?
  newAmount      Decimal?
  prevCycle      String?
  newCycle       String?
  prevStatus     String?
  newStatus      String?
  description    String?
  createdAt      DateTime @default(now())
}
```
- 파생 데이터: 월 고정비 합계, 이번 달 청구 예정 합계, 7일 내 청구 목록 캐싱(데일리 크론).
- 지출 통합: 정기구독 청구가 발생하면 가계부 거래 레코드에 `type: fixed`, `source: subscription` 라벨을 추가해 고정비 집계에 포함.
- 사용자 덮어쓰기: 거래 레코드의 `type`은 사용자 입력(고정/변동)으로 override 가능하며, 이후 자동 동기화에서 사용자 선택을 우선한다.

### 5.4 API (예시)
- `GET /api/subscriptions?status=active&sort=nextBillingDate`: 목록/필터/정렬/검색(name).
- `POST /api/subscriptions`: 생성.
- `PATCH /api/subscriptions/:id`: 수정(금액/주기/다음 청구일/상태/알림).
- `POST /api/subscriptions/:id/cancel`: 취소 처리 + History 기록.
- `GET /api/subscriptions/summary`: 월 고정비, 이번 달 청구 예정, 7일 내 목록, 카테고리 비중.

### 5.5 백엔드 로직
- 크론(일 1회): `nextBillingDate` 기반 청구 예정 캐싱, trial 종료 임박 구독 라벨링.
- 알림 큐: 청구 3일 전/당일, trial 종료 2일 전 트리거 메시지 생성(Zustand/서비스워커 이전에는 앱 진입 시 폴링 기반 fallback).
- 정합성: 취소된 구독은 합계 계산에서 제외; 금액/주기 변경 시 과거 이력 보존.
- 가계부 매핑: 청구 발생 시 거래 생성/매핑 후 고정비 라벨 부여; 중복 방지 위해 `externalId`(subscriptionId+billingDate)로 idempotent 처리.
- 레거시 거래: 기존 거래는 변경하지 않으며, 신규/미래 청구분만 고정비 자동 라벨링 대상.

### 5.6 프론트엔드
- 상태 관리: 정기구독 store(Zustand/Recoil) + optimistic update; 실패 시 토스트 롤백.
- 컴포넌트: 대시보드 카드, 구독 리스트 테이블/카드뷰(모바일), 필터 바, 상세 Drawer, 이력 타임라인.
- 접근성: 키보드 내비게이션, 날짜 입력/드롭다운 ARIA 라벨, 토스트 알림에 대체 텍스트.

### 5.7 분석/로그
- 이벤트: `subscription_created`, `subscription_cancelled`, `price_changed`, `billing_reminder_sent`, `widget_clicked`.
- 파생 리포트: 취소 전환률, 알림 허용률, 카테고리별 고정비 상위 5.

### 5.8 보안/권한
- 사용자별 격리(userId 스코프), 요청자-소유자 매칭 검증.
- 금액/결제수단 텍스트만 저장(민감정보 비저장), XSS 방지를 위한 입력 검증/escape.

## 6. 릴리스 범위 (MVP)
- 필수: CRUD, 대시보드 위젯(월 고정비/이번 달 청구/7일 내 리스트), 청구 3일 전 알림, 취소/가격 변경 이력 저장.
- 옵션: trial 종료 알림, 카테고리 비중 차트, 결제수단 필터.

## 7. 리스크 & 완화
- 알림 미수신: 브라우저 권한 거부 시 대시보드 내 배지·토스트로 대체 노출.
- 잘못된 청구일/주기 입력: 템플릿 선택/자동 완성, 비정상 값 입력 시 경고.
- 상태 미전환으로 합계 오차: 비활성/취소 토글을 위젯에서도 제공, 최근 30일 결제 없을 때 `검토 필요` 표시.
