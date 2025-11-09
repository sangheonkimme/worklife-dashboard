# WorkLife Dashboard

React 프론트엔드와 Express 백엔드를 갖춘 풀스택 개인 생산성 및 재무 관리 애플리케이션

## 주요 기능

- 💰 수입/지출 추적 및 예산 관리
- 📊 급여 공제 계산
- 📝 메모 및 노트 관리 (마크다운 지원, 태그, 첨부파일)
- ✅ 대시보드 스티커 메모 & 체크리스트 위젯 (스티커 메모 최대 3개, 체크리스트 최대 7개)
- ⚙️ 사용자 환경설정 페이지(`/settings`)에서 월급일·통화·테마·타이머/포모도로 기본값을 전역으로 저장

## 기술 스택

### 클라이언트

- React 19 + TypeScript
- Vite 빌드 도구
- Mantine v7 UI 라이브러리
- TanStack Query (서버 상태)
- Zustand (클라이언트 상태)
- React Router

### 서버

- Express 5 + TypeScript
- Prisma ORM + PostgreSQL
- JWT 인증
- Zod 검증

## 빠른 시작

### 로컬 개발 (Docker 사용 - 권장)

Docker를 사용하면 서버와 데이터베이스를 한 번에 시작할 수 있습니다:

```bash
# 1. 환경 변수 설정
cp .env.dev .env

# 2. 서버 디렉토리로 이동
cd server

# 3. Docker로 서버 + DB 시작
npm run docker:dev

# 또는 백그라운드 실행
npm run docker:dev:detach

# 로그 확인
npm run docker:dev:logs

# 중지
npm run docker:dev:down
```

서버가 시작되면:

- 서버: http://localhost:5001
- PostgreSQL: localhost:5432

### 로컬 개발 (일반 방식)

#### 1. 데이터베이스 설정

PostgreSQL 설치 및 데이터베이스 생성:

```bash
# PostgreSQL이 설치되지 않은 경우
# macOS: brew install postgresql@16
# Ubuntu: sudo apt-get install postgresql-16

# 데이터베이스 생성
createdb worklife_dashboard
```

#### 2. 서버 설정

```bash
cd server

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일을 편집하여 DATABASE_URL 등 설정

# Prisma 마이그레이션
npm run db:generate
npm run db:migrate

# 시드 데이터 추가 (선택 사항)
npm run db:seed

# 개발 서버 시작
npm run dev
```

서버: http://localhost:5001

#### 3. 클라이언트 설정

```bash
cd client

# 의존성 설치
npm install

# 개발 서버 시작
npm run dev
```

클라이언트: http://localhost:5173

## 주요 명령어

### 서버

```bash
cd server

# 개발
npm run dev              # 개발 서버 (nodemon)
npm run build            # TypeScript 빌드
npm start                # 프로덕션 서버

# 데이터베이스
npm run db:generate      # Prisma Client 생성
npm run db:migrate       # 마이그레이션
npm run db:seed          # 시드 데이터
npm run db:studio        # Prisma Studio

# 테스트
npm test                 # Jest 테스트
npm run test:watch       # Watch 모드
npm run test:coverage    # 커버리지

# Docker (로컬 개발 - DB 포함)
npm run docker:dev       # 개발 환경 시작
npm run docker:dev:detach # 백그라운드 실행
npm run docker:dev:down  # 중지
npm run docker:dev:logs  # 로그 확인

# Docker 컨테이너에서 DB 명령어 실행
docker exec worklife-server-dev npx tsx prisma/seed.ts  # 시드 데이터 삽입
docker exec worklife-server-dev npx prisma db seed      # 또는 Prisma CLI 사용
docker exec worklife-server-dev npx prisma studio       # Prisma Studio 열기
docker exec worklife-server-dev npx prisma migrate dev  # 마이그레이션 실행

# Docker (프로덕션 - DB 별도)
npm run docker:prod      # 프로덕션 환경
npm run docker:prod:detach
npm run docker:prod:down
```

### 클라이언트

```bash
cd client

npm run dev              # 개발 서버
npm run build            # 프로덕션 빌드
npm run preview          # 빌드 미리보기
npm run lint             # ESLint
```

## 프로젝트 구조

```
worklife-dashboard/
├── client/                 # React 프론트엔드
│   ├── src/
│   │   ├── components/    # 재사용 가능한 컴포넌트
│   │   ├── pages/         # 페이지 컴포넌트
│   │   ├── hooks/         # 커스텀 훅
│   │   ├── store/         # Zustand 스토어
│   │   ├── services/      # API 서비스
│   │   ├── lib/           # 라이브러리 설정
│   │   └── types/         # TypeScript 타입
│   └── package.json
├── server/                # Express 백엔드
│   ├── src/
│   │   ├── controllers/   # 요청 핸들러
│   │   ├── routes/        # Express 라우트
│   │   ├── middlewares/   # 미들웨어
│   │   ├── services/      # 비즈니스 로직
│   │   ├── validators/    # Zod 검증
│   │   └── utils/         # 유틸리티
│   ├── prisma/
│   │   ├── schema.prisma  # 데이터베이스 스키마
│   │   └── seed.ts        # 시드 데이터
│   └── package.json
├── docs/                  # 문서
├── docker-compose.dev.yml # 로컬 개발용 (DB 포함)
├── docker-compose.yml     # 프로덕션용 (DB 별도)
└── .env.dev              # 로컬 개발 환경 변수 템플릿
```

## 환경 변수

### 클라이언트 (.env)

```bash
VITE_API_URL=http://localhost:5001
```

## 대시보드 체크리스트 & 스티커 메모

- **체크리스트 API**: `/api/dashboard-checklist` (GET/POST/PATCH/DELETE). 활성/완료 항목을 분리해서 응답하며 사용자당 7개까지 저장됩니다.
- **프론트엔드 파일**:
  - `client/src/components/dashboard/DashboardChecklist.tsx`: 우측 고정 체크리스트 카드
  - `client/src/components/dashboard/StickyNotes.tsx`: 좌측 3칸 스티커 메모
- **스티커 메모 제한**: 서버(`server/src/services/stickyNoteService.ts`)와 프론트 모두 3개까지만 허용합니다. 포지션 인덱스는 0~2 범위를 사용합니다.
- **DB 마이그레이션**: 체크리스트를 사용하려면 아래 명령으로 스키마를 최신 상태로 만든 뒤 Prisma Client를 다시 생성하세요.

```bash
cd server
npm run db:migrate -- --name add_dashboard_checklist_items
npm run db:generate
```

- **문서**: 세부 PRD와 구현 계획은 `docs/08-1_dashboard-checklist-prd.md`, `docs/08-2_dashboard-checklist-implementation-plan.md`에서 확인할 수 있습니다.

### 서버 (.env)

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/worklife_dashboard"
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=5001
NODE_ENV=development
CLIENT_URL="http://localhost:5173"
```

## 배포

자세한 배포 가이드는 [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)를 참고하세요.

- **클라이언트**: Vercel (자동 배포)
- **서버**: Docker + GitHub Container Registry
- **데이터베이스**: 별도 관리 (AWS RDS, Google Cloud SQL 등)

## 문서

- [배포 가이드](docs/DEPLOYMENT.md)
- [CLAUDE.md](CLAUDE.md) - Claude Code를 위한 프로젝트 가이드

## 개발 워크플로우

1. **기능 개발**

   - 새 브랜치 생성
   - 코드 작성 및 테스트
   - Pull Request 생성

2. **데이터베이스 변경**

   ```bash
   cd server
   # schema.prisma 수정 후
   npm run db:generate
   npm run db:migrate
   ```

3. **Docker로 테스트**
   ```bash
   cd server
   npm run docker:dev
   ```

## 라이선스

ISC
