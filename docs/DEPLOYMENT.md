# 배포 가이드

이 문서는 WorkLife Dashboard 애플리케이션의 배포 방법을 설명합니다.

## 목차

- [개요](#개요)
- [로컬 개발 환경](#로컬-개발-환경)
- [클라이언트 배포 (Vercel)](#클라이언트-배포-vercel)
- [서버 배포 (Cloudtype)](#서버-배포-cloudtype) ⭐ 추천
- [서버 배포 (Docker)](#서버-배포-docker)
- [GitHub Actions CI/CD](#github-actions-cicd)
- [로컬 Docker 테스트](#로컬-docker-테스트)

## 개요

- **클라이언트**: Vercel을 통해 자동 배포
- **서버**: Docker 이미지로 빌드 후 원하는 호스팅 환경에 배포
- **데이터베이스**: 별도로 배포 및 관리 (PostgreSQL)
- **CI/CD**: GitHub Actions를 통한 자동화

## 로컬 개발 환경

### Docker를 사용한 로컬 개발 (권장)

Docker를 사용하면 서버와 PostgreSQL 데이터베이스를 한 번에 시작할 수 있습니다.

#### 1. 환경 변수 설정

```bash
# 루트 디렉토리에서
cp .env.dev .env
```

`.env` 파일은 다음과 같이 구성됩니다:

```bash
# PostgreSQL 설정
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=worklife_dashboard
POSTGRES_PORT=5432

# JWT Secrets
JWT_SECRET=dev-jwt-secret-change-in-production
JWT_REFRESH_SECRET=dev-refresh-secret-change-in-production

# 서버 설정
PORT=5001
NODE_ENV=development
# 클라이언트 URL (여러 개는 쉼표로 구분)
CLIENT_URL=http://localhost:3000

```

#### 2. Docker로 서버 + DB 시작

```bash
cd server

# 서버 + PostgreSQL 시작 (포그라운드)
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

#### 3. 클라이언트 시작

별도 터미널에서:

```bash
cd client
npm install
npm run dev
```

클라이언트: http://localhost:3000

### 사용 가능한 Docker 명령어

```bash
# 로컬 개발 (DB 포함)
npm run docker:dev           # 포그라운드 실행
npm run docker:dev:detach    # 백그라운드 실행
npm run docker:dev:down      # 중지
npm run docker:dev:logs      # 로그 확인

# 프로덕션 테스트 (외부 DB 필요)
npm run docker:prod          # 포그라운드 실행
npm run docker:prod:detach   # 백그라운드 실행
npm run docker:prod:down     # 중지
```

## 클라이언트 배포 (Vercel)

### 1. Vercel 프로젝트 설정

1. [Vercel](https://vercel.com)에 로그인
2. 새 프로젝트 생성 및 GitHub 저장소 연결
3. **Framework Preset**: Vite 선택
4. **Root Directory**: 루트 디렉토리 유지 (monorepo 설정 사용)
5. **Build Command**: `cd client && npm install && npm run build`
6. **Output Directory**: `client/dist`

### 2. 환경 변수 설정

Vercel 프로젝트 설정에서 다음 환경 변수를 추가:

```bash
VITE_API_URL=https://your-server-url.com
```

### 3. GitHub Secrets 설정

GitHub 저장소의 Settings > Secrets and variables > Actions에서 다음 시크릿 추가:

```bash
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-vercel-org-id
VERCEL_PROJECT_ID=your-vercel-project-id
VITE_API_URL=https://your-server-url.com
```

**Vercel 토큰 및 ID 얻는 방법:**

- **VERCEL_TOKEN**: Vercel Dashboard > Settings > Tokens에서 생성
- **VERCEL_ORG_ID**: Vercel CLI 실행 후 `.vercel/project.json` 확인 또는 프로젝트 설정에서 확인
- **VERCEL_PROJECT_ID**: 프로젝트 설정 > General에서 확인

### 4. 배포

`main` 브랜치에 푸시하면 자동으로 배포됩니다:

```bash
git add .
git commit -m "Update client"
git push origin main
```

Pull Request 생성 시 미리보기 배포가 자동으로 생성됩니다.

## 서버 배포 (Cloudtype)

Cloudtype은 한국의 클라우드 플랫폼으로, Dockerfile 기반 배포를 쉽게 할 수 있습니다.

### 1. 사전 준비

#### 데이터베이스 준비

Cloudtype에서는 서버만 배포하므로, PostgreSQL 데이터베이스를 먼저 준비해야 합니다:

**옵션 1: Supabase (무료, 권장)**

1. [Supabase](https://supabase.com)에 가입
2. 새 프로젝트 생성
3. Settings > Database에서 연결 정보 확인
4. Connection String 복사 (형식: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`)

**옵션 2: 다른 PostgreSQL 서비스**

- [Neon](https://neon.tech) (무료)
- [Railway](https://railway.app)
- AWS RDS, Google Cloud SQL 등

### 2. Cloudtype 프로젝트 생성

1. [Cloudtype](https://app.cloudtype.io)에 로그인
2. "새 프로젝트" 클릭
3. GitHub 저장소 연결
4. 저장소에서 `worklife-dashboard` 선택

### 3. 배포 설정

#### 기본 설정 (방법 1 - 권장)

Cloudtype은 두 가지 방법으로 설정할 수 있습니다:

**방법 1: 서브 디렉토리 컨텍스트 사용**

- **배포 방식**: Dockerfile
- **Dockerfile 경로**: `Dockerfile`
- **컨텍스트 경로**: `server`
- **포트**: `5001`

**방법 2: 루트 컨텍스트 사용**

- **배포 방식**: Dockerfile
- **Dockerfile 경로**: `Dockerfile.cloudtype`
- **컨텍스트 경로**: `.` (루트)
- **포트**: `5001`

> **참고**: 방법 1이 실패하면 방법 2를 사용하세요. 루트에 `Dockerfile.cloudtype` 파일이 준비되어 있습니다.

#### 환경 변수 설정

Cloudtype 프로젝트 설정 > 환경변수에서 다음 변수를 추가:

```bash
# 데이터베이스 (필수)
DATABASE_URL=postgresql://user:password@host:5432/database

# JWT 시크릿 (필수 - 강력한 랜덤 문자열 사용)
JWT_SECRET=your-strong-jwt-secret-min-32-characters
JWT_REFRESH_SECRET=your-strong-refresh-secret-min-32-characters

# JWT 만료 시간
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# 서버 설정
PORT=5001
NODE_ENV=production

# CORS 설정 (여러 도메인은 쉼표로 구분)
CLIENT_URL=https://worklife-dashboard.vercel.app,https://www.worklife-dashboard.com,https://worklife-dashboard.com
```

**환경 변수 입력 방법:**

- Cloudtype 대시보드에서 한 줄씩 추가
- 또는 `.env` 형식으로 한 번에 붙여넣기 가능

### 4. 빌드 및 시작 명령어

Cloudtype은 Dockerfile을 사용하므로 별도 설정이 필요 없지만, 확인이 필요한 경우:

- **빌드 명령어**: Dockerfile에 정의됨 (자동)
- **시작 명령어**: `npx prisma migrate deploy && node dist/index.js`
  - 이미 `server/package.json`의 `start` 스크립트에 설정되어 있음

### 5. 배포 실행

1. "배포" 버튼 클릭
2. Cloudtype이 자동으로:
   - Dockerfile 빌드
   - 이미지 생성
   - 컨테이너 시작
   - 마이그레이션 실행 (start 스크립트에 포함)

### 6. 배포 확인

배포가 완료되면:

1. Cloudtype이 제공하는 URL 확인 (예: `https://port-5001-xxx.app.cloudtype.io`)
2. 헬스 체크 테스트:
   ```bash
   curl https://your-cloudtype-url/health
   ```
3. 응답 예시:
   ```json
   {
     "status": "ok",
     "timestamp": "2025-11-02T10:30:00.000Z",
     "uptime": 123.456
   }
   ```

### 7. 클라이언트 연결

Vercel 클라이언트의 환경 변수를 Cloudtype URL로 업데이트:

1. Vercel 대시보드 > 프로젝트 > Settings > Environment Variables
2. `VITE_API_URL` 수정:
   ```
   VITE_API_URL=https://port-5001-xxx.app.cloudtype.io
   ```
3. Vercel 재배포 (환경 변수 적용)

### 8. Cloudtype 서버의 CLIENT_URL 업데이트

서버 환경 변수에서 `CLIENT_URL`에 배포된 도메인을 모두 포함했는지 확인 (쉼표로 구분):

```bash
CLIENT_URL=https://www.worklife-dashboard.com,https://worklife-dashboard.com
```

### 주요 장점

- ✅ **한국 서비스**: 빠른 응답 속도, 한글 지원
- ✅ **Dockerfile 지원**: 기존 설정 그대로 사용
- ✅ **무료 티어**: 소규모 프로젝트에 충분
- ✅ **자동 배포**: GitHub 연동 시 자동 배포
- ✅ **쉬운 설정**: 복잡한 설정 없이 바로 배포

### 트러블슈팅

#### 빌드 실패

- **Dockerfile 경로 확인**: `server/Dockerfile`
- **컨텍스트 경로 확인**: `server`

#### 연결 실패

- **DATABASE_URL 확인**: PostgreSQL 연결 문자열 형식 검증
- **포트 설정**: Cloudtype에서 5001 포트가 열려있는지 확인

#### 마이그레이션 실패

- **DATABASE_URL 권한**: 데이터베이스 사용자가 테이블 생성 권한이 있는지 확인
- **로그 확인**: Cloudtype 대시보드에서 로그 확인

#### CORS 에러

- **CLIENT_URL**: 서버 환경 변수에 연결할 도메인이 모두 포함되어 있는지 확인 (예: `https://www.worklife-dashboard.com,https://worklife-dashboard.com`)
- **프로토콜**: `https://`로 시작하는지 확인 (http:// 아님)

### 모니터링

- **로그**: Cloudtype 대시보드 > 로그 탭
- **메트릭**: CPU, 메모리 사용량 확인
- **재시작**: 필요 시 대시보드에서 재시작

## 서버 배포 (Docker)

### 1. GitHub Container Registry 사용

서버는 GitHub Actions를 통해 자동으로 Docker 이미지를 빌드하고 GitHub Container Registry(ghcr.io)에 푸시합니다.

### 2. 데이터베이스 준비

서버를 배포하기 전에 PostgreSQL 데이터베이스를 먼저 준비해야 합니다:

- AWS RDS, Google Cloud SQL, Azure Database 등의 관리형 서비스 사용 권장
- 또는 별도의 PostgreSQL 서버 설치 및 운영

데이터베이스가 준비되면 연결 URL을 확보하세요:

```bash
postgresql://username:password@hostname:5432/database_name
```

### 3. 이미지 Pull 및 실행

배포 서버에서 다음 명령어로 이미지를 가져와 실행:

```bash
# GitHub Container Registry 로그인
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# 이미지 Pull
docker pull ghcr.io/your-username/worklife-dashboard/server:latest

# 컨테이너 실행 (DATABASE_URL을 외부 DB로 설정)
docker run -d \
  --name worklife-server \
  -p 5001:5001 \
  -e DATABASE_URL="postgresql://user:password@your-db-host:5432/database" \
  -e JWT_SECRET="your-jwt-secret" \
  -e JWT_REFRESH_SECRET="your-refresh-secret" \
  -e CLIENT_URL="https://worklife-dashboard.vercel.app,https://www.worklife-dashboard.com,https://worklife-dashboard.com" \
  -e NODE_ENV="production" \
  ghcr.io/your-username/worklife-dashboard/server:latest
```

### 4. 필수 환경 변수

```bash
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-strong-jwt-secret
JWT_REFRESH_SECRET=your-strong-refresh-secret
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
PORT=5001
NODE_ENV=production
CLIENT_URL=https://worklife-dashboard.vercel.app,https://www.worklife-dashboard.com,https://worklife-dashboard.com
```

### 5. 데이터베이스 마이그레이션

서버 컨테이너가 실행된 후 데이터베이스 마이그레이션을 실행해야 합니다:

```bash
# 컨테이너 내부에서 마이그레이션 실행
docker exec -it worklife-server npx prisma migrate deploy

# 또는 시드 데이터 추가 (선택 사항)
docker exec -it worklife-server npm run db:seed
```

### 6. Docker Compose를 사용한 배포 (선택 사항)

외부 데이터베이스와 함께 서버를 Docker Compose로 관리하려면:

```bash
# .env 파일 생성 (.env.docker 참고)
cp .env.docker .env

# 환경 변수 수정 (DATABASE_URL을 외부 DB URL로 설정)
nano .env

# 서비스 시작
docker-compose up -d

# 로그 확인
docker-compose logs -f server

# 마이그레이션 실행
docker-compose exec server npx prisma migrate deploy
```

**중요**: docker-compose.yml은 PostgreSQL을 포함하지 않습니다. 외부 데이터베이스 URL을 `.env` 파일에 설정해야 합니다.

## GitHub Actions CI/CD

### 클라이언트 워크플로우 (`.github/workflows/deploy-client.yml`)

**트리거:**

- `main` 브랜치에 `client/` 또는 `vercel.json` 변경사항 푸시
- Pull Request 생성 (미리보기 배포)

**단계:**

1. Lint 검사 (`npm run lint`)
2. 빌드 테스트 (`npm run build`)
3. Vercel 프로덕션 배포 (main 브랜치만)
4. Vercel 미리보기 배포 (PR)

### 서버 워크플로우 (`.github/workflows/deploy-server.yml`)

**트리거:**

- `main` 브랜치에 `server/` 변경사항 푸시
- Pull Request 생성 (빌드 테스트만)

**단계:**

1. Node.js 의존성 설치
2. Prisma Client 생성
3. Lint 검사 (있는 경우)
4. TypeScript 빌드
5. Docker 이미지 빌드 및 GitHub Container Registry에 푸시 (main 브랜치만)

**참고**: 데이터베이스는 별도로 관리되므로 CI/CD 파이프라인에서 PostgreSQL 서비스를 시작하지 않습니다.

### GitHub Secrets 전체 목록

```bash
# Vercel (클라이언트)
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-vercel-org-id
VERCEL_PROJECT_ID=your-vercel-project-id
VITE_API_URL=https://your-server-url.com

# 서버 배포 (선택 사항)
SERVER_HOST=your-server-ip
SERVER_USER=deploy-user
SERVER_SSH_KEY=your-private-ssh-key
```

## 로컬 Docker 테스트

배포 전 로컬에서 Docker 환경을 테스트:

### 1. 로컬 데이터베이스 준비

먼저 로컬 PostgreSQL 데이터베이스가 실행 중이어야 합니다:

```bash
# Docker로 PostgreSQL 실행 (선택 사항)
docker run -d \
  --name postgres-local \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=worklife_dashboard \
  -p 5432:5432 \
  postgres:16-alpine
```

### 2. 환경 변수 설정

```bash
cp .env.docker .env
# .env 파일 수정 (DATABASE_URL을 로컬 DB로 설정)
```

예시 `.env` 파일:

```bash
DATABASE_URL=postgresql://postgres:postgres@host.docker.internal:5432/worklife_dashboard
JWT_SECRET=test-secret
JWT_REFRESH_SECRET=test-refresh-secret
CLIENT_URL=http://localhost:3000
```

### 3. Docker Compose 실행

```bash
# 빌드 및 시작
docker-compose up --build

# 백그라운드 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f server

# 마이그레이션 실행
docker-compose exec server npx prisma migrate deploy

# 중지
docker-compose down
```

### 4. 서버만 빌드 테스트

```bash
cd server
docker build -t worklife-server .
docker run -p 5001:5001 \
  -e DATABASE_URL="postgresql://postgres:postgres@host.docker.internal:5432/worklife_dashboard" \
  -e JWT_SECRET="test-secret" \
  -e JWT_REFRESH_SECRET="test-refresh-secret" \
  -e CLIENT_URL="http://localhost:3000" \
  worklife-server
```

## 트러블슈팅

### Vercel 빌드 실패

- **문제**: 환경 변수 누락
- **해결**: Vercel 프로젝트 설정에서 `VITE_API_URL` 확인

### Docker 이미지 빌드 실패

- **문제**: Prisma Client 생성 실패
- **해결**: `package.json`에 `postinstall` 스크립트 확인

```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

### 데이터베이스 연결 실패

- **문제**: DATABASE_URL 형식 오류
- **해결**: PostgreSQL 연결 문자열 형식 확인

```bash
postgresql://[user]:[password]@[host]:[port]/[database]
```

### CORS 에러

- **문제**: 클라이언트 URL이 서버 환경 변수와 불일치
- **해결**: 서버의 `CLIENT_URL` 환경 변수에 연결할 모든 도메인을 쉼표로 추가

```bash
CLIENT_URL=https://worklife-dashboard.vercel.app,https://www.worklife-dashboard.com,https://worklife-dashboard.com
```

## 모니터링

### 헬스 체크

서버는 `/health` 엔드포인트를 제공합니다:

```bash
curl https://your-server-url.com/health
```

### 로그 확인

```bash
# Docker Compose
docker-compose logs -f server

# 단일 컨테이너
docker logs -f worklife-server
```

## 보안 고려사항

1. **JWT Secrets**: 강력한 랜덤 문자열 사용 (최소 32자)
2. **환경 변수**: 절대 코드에 하드코딩하지 말 것
3. **데이터베이스**: SSL/TLS 연결 사용 권장
4. **HTTPS**: 프로덕션 환경에서 반드시 HTTPS 사용
5. **Rate Limiting**: 서버에 이미 설정되어 있음
6. **CORS**: 정확한 클라이언트 URL만 허용

## 추가 리소스

- [Vercel 문서](https://vercel.com/docs)
- [Docker 문서](https://docs.docker.com)
- [GitHub Actions 문서](https://docs.github.com/en/actions)
- [Prisma 배포 가이드](https://www.prisma.io/docs/guides/deployment)
