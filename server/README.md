# WorkLife Dashboard - Backend Server

Express + TypeScript + Prisma + PostgreSQL 기반의 백엔드 API 서버입니다.

## 🚀 시작하기

### 필수 요구사항

- Node.js 20.x 이상
- PostgreSQL 15.x (또는 Prisma Postgres)
- npm 또는 yarn

### 설치

```bash
# 의존성 설치
npm install

# Prisma Client 생성
npm run db:generate

# 데이터베이스 마이그레이션
npm run db:migrate

# 시드 데이터 추가
npm run db:seed
```

### 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 설정하세요:

```env
# 데이터베이스
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/worklife_dashboard"

# JWT 비밀키
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="7d"

# 서버
PORT=5001
NODE_ENV=development

# 클라이언트 (여러 도메인은 쉼표로 구분)
# 예: CLIENT_URL="https://worklife-dashboard.vercel.app,https://www.worklife-dashboard.com,https://worklife-dashboard.com"
CLIENT_URL="http://localhost:3000"
```

### 개발 서버 실행

```bash
npm run dev
```

서버가 http://localhost:5001 에서 실행됩니다.

## 📁 프로젝트 구조

```
server/
├── src/
│   ├── controllers/     # 비즈니스 로직 컨트롤러
│   ├── routes/          # API 라우트
│   ├── middlewares/     # 커스텀 미들웨어
│   ├── services/        # 서비스 레이어
│   ├── utils/           # 유틸리티 함수
│   ├── validators/      # 입력 검증 (Zod)
│   └── index.ts         # 메인 엔트리 포인트
├── prisma/
│   ├── schema.prisma    # 데이터베이스 스키마
│   └── seed.ts          # 시드 데이터
├── .env                 # 환경 변수
└── tsconfig.json        # TypeScript 설정
```

## 🛠 사용 가능한 명령어

- `npm run dev` - 개발 서버 실행 (nodemon + ts-node)
- `npm run build` - 프로덕션 빌드 (TypeScript 컴파일)
- `npm start` - 빌드된 서버 실행
- `npm run db:generate` - Prisma Client 생성
- `npm run db:migrate` - 데이터베이스 마이그레이션
- `npm run db:seed` - 시드 데이터 실행
- `npm run db:studio` - Prisma Studio 실행 (DB GUI)
<!--

## 📊 데이터베이스 스키마

### User (사용자)

- 이메일 기반 인증
- 비밀번호 해싱 (bcrypt)

### Category (카테고리)

- 수입/지출 카테고리
- 사용자 커스텀 카테고리 지원
- 기본 카테고리 제공

### Transaction (거래 내역)

- 수입/지출 기록
- 카테고리별 분류
- 날짜별 조회 인덱스

### Budget (예산)

- 월별 예산 설정
- 카테고리별 예산 관리

### SalaryCalculation (급여 계산)

- 급여 계산 이력
- 4대보험 및 세금 계산 -->
<!--

## 🔐 API 엔드포인트

### 헬스 체크

- `GET /health` - 서버 상태 확인

### 인증 (예정)

- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃
- `POST /api/auth/refresh` - 토큰 갱신
- `GET /api/auth/me` - 현재 사용자 정보

### 거래 내역 (예정)

- `GET /api/transactions` - 거래 목록 조회
- `POST /api/transactions` - 거래 생성
- `PUT /api/transactions/:id` - 거래 수정
- `DELETE /api/transactions/:id` - 거래 삭제

### 카테고리 (예정)

- `GET /api/categories` - 카테고리 목록
- `POST /api/categories` - 카테고리 생성

### 급여 계산 (예정)

- `POST /api/salary/calculate` - 급여 계산
- `GET /api/salary/history` - 계산 이력 -->

<!--
## 🔒 보안

- Helmet으로 HTTP 헤더 보안
- CORS 설정
- Rate Limiting (express-rate-limit)
- JWT 기반 인증
- 비밀번호 해싱 (bcrypt) -->

<!--
## 📝 개발 규칙

- TypeScript strict 모드 사용
- ESLint + Prettier로 코드 스타일 통일
- Zod로 입력 검증
- Prisma ORM으로 타입 안전성 보장 -->

## 🐛 트러블슈팅

### 포트 충돌

포트 5001이 사용 중이면 `.env` 파일에서 `PORT` 값을 변경하세요.

### 데이터베이스 연결 실패

1. PostgreSQL이 실행 중인지 확인
2. `.env`의 `DATABASE_URL` 확인
3. 데이터베이스가 생성되었는지 확인

### Prisma Client 오류

```bash
npm run db:generate
```

## 📄 라이선스

ISC
