# 연봉계산기 개발 계획

## 📋 프로젝트 개요

대시보드에 연봉계산기 기능을 통합하여 사용자가 직관적으로 급여 정보를 확인하고 계산할 수 있는 기능을 구현합니다.

## 🎯 핵심 요구사항

- 대시보드에서 작은 카드/컴포넌트 클릭 시 연봉계산기 페이지로 이동
- 제공된 이미지와 같은 직관적인 UI 구현
- 연봉/월급 선택, 퇴직금 포함 여부, 비과세액 등 입력
- 실수령액 실시간 계산 및 세금 공제 내역 표시

## 📁 작업 구조

```
client/src/
├── pages/
│   └── SalaryCalculatorPage.tsx          # 새 페이지
├── components/
│   ├── salary/
│   │   ├── SalaryInputForm.tsx           # 연봉 입력 폼
│   │   ├── SalaryResult.tsx              # 계산 결과 표시
│   │   ├── TaxBreakdown.tsx              # 세금 공제 상세
│   │   └── SalaryCalculatorCard.tsx      # 대시보드 카드 컴포넌트
├── types/
│   └── salary.ts                         # 연봉 관련 타입 정의
└── utils/
    └── salaryCalculator.ts               # 연봉 계산 로직

server/src/
├── controllers/
│   └── salaryController.ts               # 연봉 계산 API 컨트롤러
├── routes/
│   └── salaryRoutes.ts                   # 연봉 관련 라우트
├── services/
│   └── salaryService.ts                  # 연봉 계산 서비스
└── validators/
    └── salaryValidator.ts                # 연봉 입력 검증
```

---

## ✅ 작업 체크리스트

### Phase 1: 프론트엔드 기본 구조 (클라이언트 전용)

- [ ] **타입 정의 생성**
  - [ ] `client/src/types/salary.ts` 파일 생성
  - [ ] SalaryInput, SalaryResult, TaxBreakdown 인터페이스 정의
  - [ ] 연봉/월급 구분, 퇴직금 타입 등 정의

- [ ] **유틸리티 함수 작성**
  - [ ] `client/src/utils/salaryCalculator.ts` 파일 생성
  - [ ] 국민연금, 건강보험, 고용보험, 소득세, 지방소득세 계산 함수
  - [ ] 실수령액 계산 메인 함수
  - [ ] 2025년 기준 세율 및 공제율 적용

- [ ] **연봉계산기 페이지 생성**
  - [ ] `client/src/pages/SalaryCalculatorPage.tsx` 파일 생성
  - [ ] 페이지 레이아웃 구성 (좌측: 입력, 우측: 결과)
  - [ ] Mantine Grid 또는 Flex 사용하여 반응형 레이아웃

- [ ] **입력 폼 컴포넌트**
  - [ ] `client/src/components/salary/SalaryInputForm.tsx` 생성
  - [ ] 연봉/월급 선택 토글 (SegmentedControl)
  - [ ] 퇴직금 별도/포함 선택 (SegmentedControl)
  - [ ] 비과세액 입력 필드 (NumberInput)
  - [ ] 부양가족수 입력 (NumberInput with +/- buttons)
  - [ ] 8세 이상 20세 이하 자녀수 입력 (NumberInput with +/- buttons)

- [ ] **결과 표시 컴포넌트**
  - [ ] `client/src/components/salary/SalaryResult.tsx` 생성
  - [ ] 예상 소득액(월) 표시
  - [ ] 예상 실수령액(월) 강조 표시

- [ ] **세금 공제 상세 컴포넌트**
  - [ ] `client/src/components/salary/TaxBreakdown.tsx` 생성
  - [ ] 공제액 합계 표시
  - [ ] 국민연금, 건강보험, 장기요양, 고용보험 각 항목 표시
  - [ ] 소득세, 지방소득세 표시
  - [ ] 각 항목별 도움말 아이콘 추가

- [ ] **대시보드 카드 컴포넌트**
  - [ ] `client/src/components/salary/SalaryCalculatorCard.tsx` 생성
  - [ ] 간단한 미리보기 카드 (아이콘 + 제목 + 설명)
  - [ ] 클릭 시 `/salary` 페이지로 이동하는 onClick 핸들러

- [ ] **대시보드 페이지 통합**
  - [ ] `DashboardPage.tsx`에 SalaryCalculatorCard 추가
  - [ ] 기존 stats 카드와 함께 표시

- [ ] **라우팅 설정**
  - [ ] `App.tsx`에 `/salary` 라우트 추가
  - [ ] SalaryCalculatorPage lazy import 설정

### Phase 2: 스타일링 및 UX 개선

- [ ] **UI 디자인 구현**
  - [ ] 제공된 이미지와 유사한 디자인 적용
  - [ ] Mantine Card, Paper 컴포넌트 활용
  - [ ] 색상 테마 일관성 유지 (파란색 계열)

- [ ] **반응형 디자인**
  - [ ] 모바일 화면에서 좌우 레이아웃 → 상하 레이아웃 전환
  - [ ] 태블릿/데스크톱에서 2열 레이아웃 유지

- [ ] **실시간 계산 기능**
  - [ ] 입력값 변경 시 자동으로 결과 업데이트
  - [ ] React 상태 관리 (useState)
  - [ ] 디바운싱 적용하여 성능 최적화

- [ ] **애니메이션 및 트랜지션**
  - [ ] 숫자 변경 시 부드러운 전환 효과
  - [ ] 카운트업 애니메이션 (선택사항)

### Phase 3: 데이터베이스 연동 (선택사항)

> **Note**: Phase 1, 2만으로도 완전한 기능 구현 가능. 데이터베이스 연동은 계산 기록을 저장하고 싶을 때만 진행.

- [ ] **Prisma 스키마 정의**
  - [ ] `server/prisma/schema.prisma`에 SalaryCalculation 모델 추가
  - [ ] 사용자 ID, 입력값, 계산 결과, 생성일 필드
  - [ ] `npm run db:generate` 실행
  - [ ] `npm run db:migrate` 실행

- [ ] **백엔드 검증 로직**
  - [ ] `server/src/validators/salaryValidator.ts` 생성
  - [ ] Zod 스키마로 입력값 검증

- [ ] **백엔드 서비스**
  - [ ] `server/src/services/salaryService.ts` 생성
  - [ ] 연봉 계산 로직 (프론트엔드와 동일)
  - [ ] 계산 기록 저장 함수
  - [ ] 계산 기록 조회 함수

- [ ] **백엔드 컨트롤러**
  - [ ] `server/src/controllers/salaryController.ts` 생성
  - [ ] POST /api/salary/calculate - 계산 및 저장
  - [ ] GET /api/salary/history - 기록 조회

- [ ] **백엔드 라우트**
  - [ ] `server/src/routes/salaryRoutes.ts` 생성
  - [ ] 라우트 등록 및 인증 미들웨어 적용

- [ ] **프론트엔드 API 통합**
  - [ ] `client/src/services/api/salaryApi.ts` 생성
  - [ ] TanStack Query 훅 생성
  - [ ] 계산 결과 저장 기능 추가
  - [ ] 계산 기록 조회 기능 추가

### Phase 4: 테스트 및 마무리

- [ ] **기능 테스트**
  - [ ] 다양한 입력값으로 계산 정확성 검증
  - [ ] 2025년 세율 기준 확인
  - [ ] 엣지 케이스 테스트 (0원, 최대값 등)

- [ ] **UI/UX 테스트**
  - [ ] 다양한 화면 크기에서 레이아웃 확인
  - [ ] 모바일 기기에서 테스트
  - [ ] 다크/라이트 테마 모두 확인

- [ ] **성능 최적화**
  - [ ] 불필요한 리렌더링 방지 (useMemo, useCallback)
  - [ ] 번들 사이즈 확인

- [ ] **문서화**
  - [ ] 계산 로직 주석 추가
  - [ ] 사용자 가이드 작성 (선택사항)

---

## 🔧 기술 스택

### 프론트엔드
- **Framework**: React 19 + TypeScript
- **UI Library**: Mantine v7
  - Card, Paper, Grid, Stack, Group
  - NumberInput, SegmentedControl
  - Text, Title, Badge
- **Icons**: @tabler/icons-react
- **상태 관리**: useState (로컬 상태)
- **라우팅**: React Router

### 백엔드 (Phase 3 - 선택사항)
- **Framework**: Express 5 + TypeScript
- **ORM**: Prisma + PostgreSQL
- **Validation**: Zod
- **API**: RESTful API

---

## 📊 계산 로직 개요

### 2025년 기준 공제율
- **국민연금**: 4.5%
- **건강보험**: 3.545%
- **장기요양**: 건강보험료의 12.95%
- **고용보험**: 0.9%
- **소득세**: 간이세액표 적용 (누진세율)
- **지방소득세**: 소득세의 10%

### 계산 순서
1. 연봉 → 월 소득 환산 (또는 월급 직접 입력)
2. 비과세액 제외
3. 과세 대상 금액 계산
4. 4대 보험 공제
5. 소득세 계산 (간이세액표)
6. 지방소득세 계산
7. 실수령액 = 월 소득 - 총 공제액

---

## 🚀 개발 우선순위

1. **최우선**: Phase 1 - 프론트엔드 기본 구조 (데이터베이스 없이 완전 동작)
2. **중요**: Phase 2 - 스타일링 및 UX 개선
3. **선택**: Phase 3 - 데이터베이스 연동 (계산 기록 저장)
4. **마무리**: Phase 4 - 테스트 및 마무리

---

## 💡 참고 사항

- 초기 구현은 **프론트엔드만으로 완전히 동작**하도록 설계
- 계산 로직은 클라이언트 측에서 완결
- 데이터베이스 연동은 추후 필요시 추가
- 이미지 참고하여 직관적인 UI/UX 구현
