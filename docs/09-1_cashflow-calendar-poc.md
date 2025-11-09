# Cashflow Calendar & Notification POC

## 1. 개요
- **목적**: 기존 수입/지출 추적과 급여 공제 데이터를 하나의 달력 뷰로 묶어, 월별 예상 잔액과 예정된 고정비를 즉시 파악할 수 있는 경험을 제공.
- **가설**: 사용자는 앞으로 다가올 결제/입금 일정을 시각적으로 확인하고 자동 알림을 받으면 재무 기능의 효용을 빠르게 체감한다.
- **참고**: README 주요 기능 (README.md:5-10)

## 2. 범위 (POC)
1. **대시보드 카드**: "현금흐름 미리보기" 카드에 달력 + 타임라인 요약 제공.
2. **데이터 스냅샷**: 다음 30일의 반복 지출/수입 및 급여 공제 데이터를 서버에서 집계.
3. **알림**: 결제 3일 전 브라우저 Notification API로 리마인더 발송 (권한 동의 시).

## 3. 요구사항

### 3.1 백엔드
- Prisma 모델 추가
  - `RecurringExpense` (항목명, 금액, 반복 주기, 다음 결제일, 카테고리 등)
  - `UpcomingIncome` (항목명, 금액, 발생 주기, 다음 입금일, 소득 타입 등)
- 일일 크론 잡(예: node-cron)으로 다음 30일 간의 스냅샷을 생성해 `CashflowSnapshot` 테이블에 저장.
- API: `GET /api/cashflow/upcoming`
  - 응답에 날짜별 이벤트 배열, 일자별 순현금 흐름, 월 예상 잔액 포함.

### 3.2 프론트엔드
- **Mantine Calendar + Timeline 조합**
  - Calendar: 날짜별 수입/지출 도트 표시 (민트=수입, 주황=지출).
  - Timeline: 다음 7일 이벤트를 리스트업하고, 금액/카테고리/연동 링크 표시.
- **요약 지표**
  - 이번 달 예상 잔액, 다음 7일 고정비 합계, 다가오는 급여일까지 남은 일수.
- **상호작용**
  - 날짜 클릭 시 Event Drawer로 상세 정보 표시 (관련 메모/계좌 이동 링크 등 확장 여지 제공).

### 3.3 알림(클라이언트)
- Notification API 권한 요청 및 상태 저장(Zustand).
- 결제 3일 전 이벤트만 로컬 스케줄링(서비스 워커 도입 전까지 단순 setTimeout 기반)하여 브라우저 알림 발송.
- 알림 내용: "곧 {항목명} {금액} 결제 예정" + CTA 버튼("지금 확인").

## 4. 데이터 설계 요약
```prisma
model RecurringExpense {
  id            String   @id @default(cuid())
  userId        String
  title         String
  amount        Decimal
  currency      String @default("KRW")
  nextDueDate   DateTime
  intervalType  String   // monthly, weekly 등
  category      String?
  notes         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model UpcomingIncome {
  id            String   @id @default(cuid())
  userId        String
  source        String
  amount        Decimal
  currency      String @default("KRW")
  nextPayDate   DateTime
  intervalType  String
  category      String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model CashflowSnapshot {
  id          String   @id @default(cuid())
  userId      String
  date        DateTime
  netAmount   Decimal   // 수입 - 지출
  events      Json      // RecurringExpense & UpcomingIncome 이벤트 배열
  balanceHint Decimal?  // 예측 잔액 (선택)
  createdAt   DateTime @default(now())
}
```

## 5. 성공 지표 (POC)
- 대시보드 카드 노출 대비 클릭률 30% 이상.
- 알림 권한 허용률 40% 이상.
- 카드 진입 후 7일 내 고정비 기록 편집률 20% 이상.

## 6. 향후 확장 아이디어
- 이벤트 클릭 → 가계부 거래 연결/생성 플로우.
- 이메일/푸시 알림 채널 추가.
- AI 요약: "이번 주 소비 패턴" 자동 코멘트.
- 다중 계좌 지원 및 계좌별 필터.
