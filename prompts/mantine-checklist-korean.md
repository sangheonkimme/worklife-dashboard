# WorkLife Dashboard - Phase 1 개발 체크리스트 (Mantine 기반)

## 📅 프로젝트 일정: 8주
**시작일**: ____________  
**완료 목표**: ____________

---

## 1-2주차: 프로젝트 설정 및 기반 구축

### 🛠️ 개발 환경 설정
- [ ] Node.js 20.x LTS 설치
- [ ] PostgreSQL 15.x 설치
- [ ] VSCode 확장 프로그램 설치
  - [ ] ES7+ React/Redux/React-Native snippets
  - [ ] Prettier - Code formatter
  - [ ] ESLint
  - [ ] Thunder Client (API 테스트)
  - [ ] Prisma
  - [ ] GitLens
- [ ] Claude Code 설정
- [ ] Git 저장소 생성 및 초기화

### 📁 프로젝트 구조 생성
- [ ] 모노레포 구조 설정
- [ ] 프론트엔드 프로젝트 생성 (Vite + React + TypeScript)
  ```bash
  npm create vite@latest client -- --template react-ts
  cd client
  ```
- [ ] 백엔드 프로젝트 생성
  ```bash
  mkdir server && cd server
  npm init -y
  ```
- [ ] ESLint 설정 파일 생성
- [ ] Prettier 설정 파일 생성
- [ ] `.gitignore` 파일 설정
- [ ] README.md 작성

### 🎨 Mantine UI 설정
- [ ] Mantine 핵심 패키지 설치
  ```bash
  cd client
  npm install @mantine/core @mantine/hooks
  npm install @mantine/dates dayjs
  npm install @mantine/charts recharts
  npm install @mantine/form zod
  npm install @mantine/modals
  npm install @mantine/notifications
  npm install @mantine/spotlight
  npm install @mantine/dropzone
  ```
- [ ] Tabler Icons 설치
  ```bash
  npm install @tabler/icons-react
  ```
- [ ] PostCSS 설정
  ```bash
  npm install --save-dev postcss postcss-preset-mantine postcss-simple-vars
  ```
- [ ] Mantine 테마 파일 생성 (`/src/theme/index.ts`)
  - [ ] 다크 테마 기본 설정
  - [ ] 색상 팔레트 정의
  - [ ] 폰트 설정 (Pretendard)
  - [ ] 컴포넌트 기본값 설정
- [ ] MantineProvider 설정
- [ ] CSS 리셋 및 전역 스타일 설정

### 🗄️ 데이터베이스 설정
- [ ] PostgreSQL 데이터베이스 생성
  ```sql
  CREATE DATABASE worklife_dashboard;
  ```
- [ ] Prisma 초기화
  ```bash
  cd server
  npx prisma init
  ```
- [ ] 데이터베이스 스키마 설계
  - [ ] User 모델
  - [ ] Category 모델
  - [ ] Transaction 모델
  - [ ] Budget 모델
  - [ ] SalaryCalculation 모델
- [ ] Prisma 스키마 파일 작성 (`schema.prisma`)
- [ ] 초기 마이그레이션 실행
  ```bash
  npx prisma migrate dev --name init
  ```
- [ ] 기본 카테고리 시드 데이터 작성
  - [ ] 수입 카테고리 (급여, 보너스, 투자수익, 기타)
  - [ ] 지출 카테고리 (식비, 교통비, 쇼핑, 문화생활, 주거비, 의료비, 교육비, 기타)
- [ ] 시드 실행 스크립트 작성

### 🔙 백엔드 기반 설정
- [ ] 백엔드 의존성 설치
  ```bash
  cd server
  npm install express cors dotenv helmet morgan compression
  npm install jsonwebtoken bcrypt
  npm install @prisma/client
  npm install zod
  npm install express-rate-limit
  npm install cookie-parser
  npm install --save-dev @types/node @types/express nodemon typescript ts-node
  ```
- [ ] TypeScript 설정 (`tsconfig.json`)
- [ ] Express 서버 기본 설정
- [ ] 미들웨어 설정
  - [ ] CORS 설정
  - [ ] Body parser
  - [ ] Helmet (보안 헤더)
  - [ ] Morgan (로깅)
  - [ ] Rate limiting
  - [ ] 에러 핸들러
- [ ] 환경 변수 설정 (`.env`)
  ```
  DATABASE_URL=
  JWT_SECRET=
  JWT_REFRESH_SECRET=
  PORT=5000
  NODE_ENV=development
  ```
- [ ] 폴더 구조 생성
  ```
  server/src/
  ├── controllers/
  ├── routes/
  ├── middlewares/
  ├── services/
  ├── utils/
  └── validators/
  ```

### 🎨 프론트엔드 기반 설정
- [ ] 프론트엔드 추가 의존성 설치
  ```bash
  cd client
  npm install axios react-router-dom
  npm install @reduxjs/toolkit react-redux
  npm install react-hook-form @hookform/resolvers
  npm install date-fns
  npm install react-number-format
  npm install jspdf html2canvas
  npm install papaparse
  npm install --save-dev @types/react @types/node
  ```
- [ ] 폴더 구조 생성
  ```
  client/src/
  ├── components/
  │   ├── common/
  │   ├── layout/
  │   └── charts/
  ├── features/
  │   ├── auth/
  │   ├── accountBook/
  │   └── salary/
  ├── pages/
  ├── hooks/
  ├── services/
  ├── store/
  ├── theme/
  └── utils/
  ```
- [ ] React Router 설정
- [ ] Redux 스토어 설정
- [ ] Axios 인스턴스 및 인터셉터 설정
- [ ] 환경 변수 설정 (`.env`)
  ```
  VITE_API_URL=http://localhost:5000
  ```

### 🎨 기본 레이아웃 컴포넌트
- [ ] `AppShell` 기반 메인 레이아웃 생성
- [ ] 헤더 컴포넌트
  - [ ] 로고
  - [ ] 사용자 메뉴 (Avatar + Menu)
  - [ ] 테마 전환 버튼 (ActionIcon)
  - [ ] 알림 버튼
- [ ] 사이드바 네비게이션 (Navbar)
  - [ ] NavLink 컴포넌트
  - [ ] 아이콘 + 텍스트
  - [ ] 활성 상태 표시
  - [ ] 섹션 구분
- [ ] 모바일 Drawer 메뉴
- [ ] 푸터 컴포넌트

---

## 3-4주차: 인증 시스템 구현

### 🔐 백엔드 - 인증 API

#### 사용자 모델 및 서비스
- [x] User 모델 Prisma 스키마 확인
- [x] 사용자 서비스 레이어 작성
  - [x] createUser
  - [x] findUserByEmail
  - [x] updateUser
  - [x] verifyPassword
- [x] 비밀번호 해싱 유틸리티
- [x] JWT 토큰 유틸리티
  - [x] generateAccessToken
  - [x] generateRefreshToken
  - [x] verifyToken

#### API 엔드포인트 구현
- [x] POST `/api/auth/register`
  - [x] Zod 스키마 검증
  - [x] 이메일 중복 체크
  - [x] 비밀번호 해싱
  - [x] 사용자 생성
  - [ ] 환영 이메일 (선택)
- [x] POST `/api/auth/login`
  - [x] 입력 검증
  - [x] 사용자 조회
  - [x] 비밀번호 확인
  - [x] 토큰 생성 및 발급
  - [x] 리프레시 토큰 쿠키 설정
- [ ] POST `/api/auth/refresh`
  - [ ] 리프레시 토큰 검증
  - [ ] 새 액세스 토큰 발급
  - [ ] 리프레시 토큰 로테이션 (선택)
- [x] POST `/api/auth/logout`
  - [x] 토큰 무효화
  - [x] 쿠키 삭제
- [x] GET `/api/auth/me`
  - [x] 현재 사용자 정보 반환
- [ ] PUT `/api/auth/profile`
  - [ ] 프로필 정보 수정
  - [ ] 비밀번호 변경

#### 미들웨어
- [x] 인증 미들웨어 (`authenticateToken`)
- [ ] 권한 확인 미들웨어 (선택)
- [x] Rate limiting 미들웨어
- [x] 입력 검증 미들웨어

### 🎨 프론트엔드 - 인증 UI (Mantine)

#### 로그인 페이지
- [x] 로그인 페이지 컴포넌트 생성
- [x] Mantine 컴포넌트 적용
  ```jsx
  - Container (중앙 정렬)
  - Paper (폼 컨테이너)
  - TextInput (이메일)
  - PasswordInput (비밀번호)
  - Checkbox (자동 로그인)
  - Button (로그인)
  - Anchor (링크)
  ```
- [x] 폼 검증 (@mantine/form)
- [x] 에러 메시지 표시 (Alert)
- [x] 로딩 상태 (Button loading)
- [x] 비밀번호 찾기 링크

#### 회원가입 페이지
- [x] 회원가입 페이지 컴포넌트 생성
- [x] Mantine 컴포넌트 적용
  ```jsx
  - TextInput (이메일, 이름)
  - PasswordInput (비밀번호)
  - Progress (비밀번호 강도)
  - Popover (비밀번호 요구사항)
  - Checkbox (약관 동의)
  - Button (회원가입)
  ```
- [x] 실시간 유효성 검사
- [x] 비밀번호 강도 표시기
- [x] 약관 동의 체크박스
- [x] 성공 시 리다이렉트

#### 프로필 페이지
- [ ] 프로필 페이지 컴포넌트
- [ ] 사용자 정보 표시 (Card)
- [ ] 정보 수정 폼
- [ ] 아바타 업로드 (Dropzone)
- [ ] 비밀번호 변경 섹션

#### 상태 관리
- [x] Auth slice 생성 (Redux Toolkit)
  ```javascript
  - user 상태
  - isAuthenticated
  ```
- [x] Auth actions (TanStack Query mutations)
  - [x] login
  - [x] logout
  - [x] register
  - [ ] refreshToken (Axios 인터셉터에서 자동 처리)
  - [ ] updateProfile
- [x] Auth selectors

#### 보호된 라우트
- [x] PrivateRoute 컴포넌트
- [x] 인증 체크 로직
- [x] 리다이렉트 처리
- [x] 로딩 상태 (Loader)

#### 커스텀 훅
- [x] `useAuth` 훅
  - [x] 로그인/로그아웃 함수
  - [x] 사용자 상태
  - [x] 인증 상태
- [x] 토큰 관리 (Axios 인터셉터)
  - [x] 토큰 저장/조회 (localStorage)
  - [x] 토큰 갱신 로직 (자동)
  - [x] 자동 로그아웃

---

## 5-6주차: 가계부 기능 개발

### 💰 백엔드 - 가계부 API

#### 데이터베이스 준비
- [ ] Transaction 모델 확인
- [ ] Category 모델 확인
- [ ] Budget 모델 확인
- [ ] 인덱스 생성 (성능 최적화)

#### 거래(Transaction) API
- [ ] GET `/api/transactions`
  - [ ] 페이지네이션 (limit, offset)
  - [ ] 날짜 필터 (startDate, endDate)
  - [ ] 카테고리 필터
  - [ ] 검색 (description)
  - [ ] 정렬 (date, amount)
- [ ] GET `/api/transactions/:id`
  - [ ] 단일 거래 조회
- [ ] POST `/api/transactions`
  - [ ] 거래 생성
  - [ ] 입력 검증
  - [ ] 예산 체크 알림
- [ ] PUT `/api/transactions/:id`
  - [ ] 거래 수정
  - [ ] 권한 확인
- [ ] DELETE `/api/transactions/:id`
  - [ ] 거래 삭제
  - [ ] Soft delete 옵션
- [ ] POST `/api/transactions/bulk`
  - [ ] CSV 파싱 (multer + papaparse)
  - [ ] 대량 입력
  - [ ] 에러 처리 및 리포트

#### 카테고리 API
- [ ] GET `/api/categories`
  - [ ] 사용자 카테고리 조회
  - [ ] 기본 카테고리 포함
- [ ] POST `/api/categories`
  - [ ] 카테고리 생성
  - [ ] 아이콘/색상 설정
- [ ] PUT `/api/categories/:id`
  - [ ] 카테고리 수정
- [ ] DELETE `/api/categories/:id`
  - [ ] 사용 중 체크
  - [ ] 거래 재할당 옵션

#### 통계 API
- [ ] GET `/api/transactions/statistics`
  - [ ] 월별 수입/지출 합계
  - [ ] 카테고리별 집계
  - [ ] 일별 추이 데이터
  - [ ] 전월 대비 비교
- [ ] GET `/api/transactions/export`
  - [ ] CSV 생성
  - [ ] Excel 생성 (선택)
  - [ ] 다운로드 응답

#### 예산 API
- [ ] GET `/api/budgets`
  - [ ] 현재 월 예산
  - [ ] 카테고리별 예산
- [ ] POST `/api/budgets`
  - [ ] 예산 설정
- [ ] PUT `/api/budgets/:id`
  - [ ] 예산 수정
- [ ] GET `/api/budgets/status`
  - [ ] 사용 현황
  - [ ] 남은 예산

### 🎨 프론트엔드 - 가계부 UI (Mantine)

#### 가계부 메인 페이지
- [ ] 페이지 레이아웃 구성
  - [ ] Tabs (거래내역, 통계, 예산)
  - [ ] 월 선택기 (MonthPicker)
  - [ ] 빠른 추가 버튼 (Affix + ActionIcon)

#### 거래 관리 컴포넌트
- [ ] 거래 입력 폼 (`TransactionForm.tsx`)
  ```jsx
  - SegmentedControl (수입/지출)
  - NumberInput (금액, 천 단위 구분)
  - Select (카테고리, searchable)
  - DatePickerInput (날짜)
  - Textarea (메모)
  - Switch (반복 거래)
  - Button.Group (저장/취소)
  ```
- [ ] 거래 목록 (`TransactionList.tsx`)
  - [ ] 데스크톱: Table 컴포넌트
  - [ ] 모바일: Card + Stack
  - [ ] 각 항목 액션 (ActionIcon: 수정/삭제)
  - [ ] Pagination 컴포넌트
  - [ ] Empty state (빈 상태)
- [ ] 거래 필터 (`TransactionFilter.tsx`)
  - [ ] DateRangePicker (기간)
  - [ ] MultiSelect (카테고리)
  - [ ] TextInput (검색)
  - [ ] Button (필터 초기화)
- [ ] 거래 수정 모달
  - [ ] Modal 컴포넌트
  - [ ] 수정 폼 (입력 폼 재사용)
- [ ] 거래 삭제 확인
  - [ ] 확인 모달 (modals.openConfirmModal)

#### 카테고리 관리
- [ ] 카테고리 설정 모달
  - [ ] 카테고리 목록 (List)
  - [ ] 카테고리 추가 폼
    - [ ] TextInput (이름)
    - [ ] ColorPicker (색상)
    - [ ] 아이콘 선택기
  - [ ] 카테고리 수정/삭제

#### 통계 대시보드
- [ ] 요약 카드 (`SummaryCards.tsx`)
  ```jsx
  - StatsGrid
  - StatsCard (수입/지출/잔액)
  - Trend 표시 (증감률)
  ```
- [ ] 카테고리별 차트 (`CategoryChart.tsx`)
  ```jsx
  - DonutChart (원형 차트)
  - 범례 표시
  - 툴팁
  ```
- [ ] 일별 추이 차트 (`DailyTrendChart.tsx`)
  ```jsx
  - AreaChart (영역 차트)
  - 날짜 축
  - 금액 축
  - 그리드
  ```
- [ ] 월별 비교 차트 (`MonthlyComparison.tsx`)
  ```jsx
  - BarChart (막대 차트)
  - 수입/지출 구분
  - 전월 대비
  ```

#### 예산 관리
- [ ] 예산 설정 (`BudgetSettings.tsx`)
  - [ ] 카테고리별 예산 입력
  - [ ] NumberInput (금액)
  - [ ] 저장 버튼
- [ ] 예산 현황 (`BudgetStatus.tsx`)
  - [ ] Progress.Root (진행률)
  - [ ] Progress.Section (사용/남은 금액)
  - [ ] 초과 경고 (Alert)

#### CSV 가져오기/내보내기
- [ ] CSV 가져오기 모달
  - [ ] Dropzone (파일 업로드)
  - [ ] 미리보기 Table
  - [ ] 매핑 설정
  - [ ] 가져오기 버튼
- [ ] 내보내기 버튼
  - [ ] 기간 선택
  - [ ] 포맷 선택 (CSV/Excel)
  - [ ] 다운로드

#### 상태 관리
- [ ] Transaction slice
  ```javascript
  - transactions 배열
  - currentTransaction
  - filters
  - pagination
  - loading/error
  ```
- [ ] Category slice
- [ ] Statistics slice
- [ ] Budget slice

#### 유틸리티 함수
- [ ] 금액 포맷터 (천 단위 구분)
- [ ] 날짜 포맷터
- [ ] CSV 파서
- [ ] 차트 데이터 변환

---

## 7주차: 급여계산기 개발

### 💼 백엔드 - 급여계산기 API

#### 계산 서비스
- [ ] 급여 계산 클래스 생성
  - [ ] 국민연금 계산 (4.5%)
  - [ ] 건강보험 계산 (3.545%)
  - [ ] 장기요양보험 계산
  - [ ] 고용보험 계산 (0.9%)
  - [ ] 소득세 계산 (누진세율)
  - [ ] 지방소득세 계산
- [ ] 2024년 세율 테이블 적용
- [ ] 부양가족 공제 로직
- [ ] 비과세 처리

#### API 엔드포인트
- [ ] POST `/api/salary/calculate`
  - [ ] 입력 검증
  - [ ] 계산 수행
  - [ ] 결과 반환
- [ ] GET `/api/salary/history`
  - [ ] 계산 이력 조회
  - [ ] 페이지네이션
- [ ] POST `/api/salary/save`
  - [ ] 계산 결과 저장
- [ ] GET `/api/salary/export/:id`
  - [ ] PDF 생성 (puppeteer/jspdf)
  - [ ] 다운로드

### 🎨 프론트엔드 - 급여계산기 UI (Mantine)

#### 급여계산기 페이지
- [ ] 페이지 레이아웃
  - [ ] Grid (입력/결과 분리)
  - [ ] 모바일 Stack 레이아웃

#### 입력 섹션
- [ ] 급여 입력 폼 (`SalaryInputForm.tsx`)
  ```jsx
  - Paper (컨테이너)
  - SegmentedControl (연봉/월급)
  - NumberInput (급여액)
    - thousandSeparator
    - 원 suffix
  - Slider + NumberInput (부양가족)
  - NumberInput (비과세액)
  - Tooltip (도움말)
  - Button (계산하기)
  ```
- [ ] 입력 검증
- [ ] 계산 중 로딩 (Button loading)

#### 결과 표시
- [ ] 결과 카드 (`SalaryResults.tsx`)
  ```jsx
  - Card (메인 컨테이너)
  - StatsRing (실수령액 시각화)
  - Text (설명)
  - Divider
  ```
- [ ] 공제 내역 (`DeductionBreakdown.tsx`)
  ```jsx
  - Table (공제 항목)
  - Badge (퍼센트 표시)
  - 합계 행 강조
  ```
- [ ] 연간 예상 (`YearlyProjection.tsx`)
  ```jsx
  - SimpleGrid
  - Card (연 실수령액)
  - Card (월 평균)
  ```
- [ ] 액션 버튼 (`SalaryActions.tsx`)
  ```jsx
  - Button.Group
  - PDF 다운로드
  - 계산 저장
  - 공유하기
  - 초기화
  ```

#### 계산 이력
- [ ] 이력 목록 (`SalaryHistory.tsx`)
  - [ ] Timeline 컴포넌트
  - [ ] 각 계산 요약
  - [ ] 클릭 시 상세 보기

#### PDF 생성
- [ ] PDF 템플릿 디자인
- [ ] jspdf + html2canvas 구현
- [ ] 한글 폰트 처리

#### 상태 관리
- [ ] Salary slice
  ```javascript
  - inputData
  - calculationResult
  - history
  - loading/error
  ```

#### 유틸리티
- [ ] 급여 계산 함수
- [ ] 세금 계산 함수
- [ ] 숫자 포맷터
- [ ] PDF 생성기

---

## 8주차: 테스트, 최적화 및 배포

### 🧪 테스트

#### 단위 테스트
- [x] 백엔드 테스트
  - [x] Auth 서비스 테스트 (16개 테스트 통과)
  - [ ] Transaction 서비스 테스트
  - [ ] 급여 계산 로직 테스트
  - [ ] 유틸리티 함수 테스트
- [ ] 프론트엔드 테스트
  - [ ] 컴포넌트 테스트 (React Testing Library)
  - [ ] 커스텀 훅 테스트
  - [ ] Redux 액션/리듀서 테스트
  - [ ] 유틸리티 함수 테스트

#### 통합 테스트
- [ ] API 엔드포인트 테스트
  - [ ] 인증 플로우
  - [ ] CRUD 작업
  - [ ] 에러 시나리오
- [ ] 데이터베이스 작업 테스트
  - [ ] 마이그레이션
  - [ ] 쿼리 성능
  - [ ] 트랜잭션

#### E2E 테스트 (선택)
- [ ] Cypress/Playwright 설정
- [ ] 핵심 사용자 경로
  - [ ] 회원가입 → 로그인
  - [ ] 거래 추가 → 통계 확인
  - [ ] 급여 계산
- [ ] 크로스 브라우저 테스트

### ⚡ 성능 최적화

#### 백엔드 최적화
- [ ] 데이터베이스 쿼리 최적화
  - [ ] N+1 문제 해결
  - [ ] 인덱스 추가
  - [ ] 쿼리 분석
- [ ] API 응답 캐싱
  - [ ] Redis 설정 (선택)
  - [ ] 메모리 캐싱
- [ ] 압축 미들웨어 설정
- [ ] Rate limiting 조정

#### 프론트엔드 최적화
- [ ] 코드 스플리팅
  - [ ] 라우트 기반 분할
  - [ ] 컴포넌트 lazy loading
- [ ] Mantine 최적화
  - [ ] 사용하지 않는 컴포넌트 제거
  - [ ] 테마 최적화
- [ ] 이미지 최적화
  - [ ] WebP 포맷
  - [ ] Lazy loading
  - [ ] 적절한 사이즈
- [ ] 번들 크기 최적화
  - [ ] Tree shaking
  - [ ] 번들 분석 (rollup-plugin-visualizer)

### 📱 반응형 테스트
- [ ] 모바일 (320px - 768px)
  - [ ] 네비게이션 Drawer
  - [ ] 터치 제스처
  - [ ] 폼 입력
  - [ ] 테이블 → 카드 변환
- [ ] 태블릿 (768px - 1024px)
  - [ ] 레이아웃 조정
  - [ ] Grid 시스템
- [ ] 데스크톱 (1024px+)
  - [ ] 사이드바 고정
  - [ ] 멀티 컬럼

### 🚀 배포 준비

#### 환경 설정
- [ ] 환경 변수 정리
  - [ ] 프로덕션 데이터베이스
  - [ ] API 키
  - [ ] JWT 시크릿
- [ ] 도메인 준비
  - [ ] 프론트엔드 도메인
  - [ ] API 서브도메인
  - [ ] SSL 인증서

#### 백엔드 배포
- [ ] 호스팅 서비스 선택
  - [ ] Railway
  - [ ] Render
  - [ ] Heroku
- [ ] 프로덕션 데이터베이스 설정
  - [ ] PostgreSQL 인스턴스
  - [ ] 연결 풀링
  - [ ] 백업 전략
- [ ] CI/CD 파이프라인
  - [ ] GitHub Actions 설정
  - [ ] 자동 배포
  - [ ] 헬스 체크

#### 프론트엔드 배포
- [ ] 호스팅 서비스 선택
  - [ ] Vercel
  - [ ] Netlify
  - [ ] Cloudflare Pages
- [ ] 빌드 최적화
  - [ ] 프로덕션 빌드
  - [ ] 환경 변수 설정
- [ ] CDN 설정

#### 배포 후 작업
- [ ] 모니터링 설정
  - [ ] Sentry (에러 추적)
  - [ ] Google Analytics 4
  - [ ] Uptime 모니터링
- [ ] 백업 검증
- [ ] 로드 테스트 (선택)
- [ ] 보안 감사

### 📝 문서화
- [ ] API 문서
  - [ ] Swagger/OpenAPI (선택)
  - [ ] Postman 컬렉션
  - [ ] API 사용 가이드
- [ ] 코드 문서
  - [ ] JSDoc 주석
  - [ ] README 파일
  - [ ] 컴포넌트 스토리북 (선택)
- [ ] 사용자 가이드
  - [ ] 시작하기
  - [ ] 기능별 가이드
  - [ ] FAQ
- [ ] 개발자 문서
  - [ ] 설치 가이드
  - [ ] 환경 설정
  - [ ] 배포 가이드

### 🐛 버그 수정 및 마무리
- [ ] UI/UX 개선
  - [ ] 로딩 상태 (Skeleton)
  - [ ] 에러 메시지 (Alert)
  - [ ] 성공 피드백 (Notification)
  - [ ] 애니메이션 (Transition)
- [ ] 엣지 케이스 처리
  - [ ] 빈 상태
  - [ ] 에러 상태
  - [ ] 네트워크 오류
- [ ] 브라우저 호환성
  - [ ] Chrome
  - [ ] Safari
  - [ ] Firefox
  - [ ] Edge
- [ ] 접근성 개선
  - [ ] 키보드 네비게이션
  - [ ] 스크린 리더 지원
  - [ ] ARIA 레이블
  - [ ] 색상 대비

---

## 🎯 완료 기준

### 기능별 완료 체크
- [ ] 모든 코드 작성 및 로컬 테스트 완료
- [ ] 단위 테스트 작성 (커버리지 80% 이상)
- [ ] 코드 리뷰 완료
- [ ] 문서 업데이트
- [ ] 반응형 디자인 확인
- [ ] 접근성 검사
- [ ] main 브랜치 병합
- [ ] 스테이징 배포 및 테스트
- [ ] 프로덕션 배포

### 프로젝트 성공 지표
- [ ] 모든 Phase 1 기능 구현 완료
- [ ] 치명적 버그 0건
- [ ] 페이지 로드 시간 3초 이내
- [ ] 모바일 반응형 100% 구현
- [ ] 테스트 커버리지 80% 이상
- [ ] 문서화 완료
- [ ] 성공적 배포

---

## 📊 진행률 추적

### 1-2주차 진행률: ____%
### 3-4주차 진행률: ____%
### 5-6주차 진행률: ____%
### 7주차 진행률: ____%
### 8주차 진행률: ____%

**전체 진행률**: ____%

---

## 📝 이슈 및 메모

### 블로커
- 

### 결정 사항
- 

### 기술 부채
- 

### 개선 아이디어
- 

---

## 🔗 중요 링크

- **GitHub 저장소**: 
- **스테이징 사이트**: 
- **프로덕션 사이트**: 
- **API 문서**: 
- **프로젝트 보드**: 
- **디자인 파일**: 
- **Mantine 문서**: https://mantine.dev

---

## 💡 Mantine 팁 & 트릭

### 자주 사용하는 Mantine 훅
```javascript
import { useMediaQuery } from '@mantine/hooks';  // 반응형
import { useDisclosure } from '@mantine/hooks';   // 모달/Drawer
import { useForm } from '@mantine/form';          // 폼 관리
import { useCounter } from '@mantine/hooks';      // 카운터
import { useLocalStorage } from '@mantine/hooks'; // 로컬 스토리지
```

### 유용한 Mantine 유틸리티
```javascript
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { spotlight } from '@mantine/spotlight';
```

### Claude Code 요청 예시
```bash
# Mantine 컴포넌트 생성
"Create a transaction form using Mantine components with 
Korean currency formatting and validation"

# 다크 테마 대시보드
"Build a dark theme dashboard with Mantine AppShell, 
StatsGrid, and Charts components"

# 반응형 테이블
"Create a responsive table that transforms to cards on 
mobile using Mantine Table and Card components"
```

---

**마지막 업데이트**: ____________  
**작성자**: ____________