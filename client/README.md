# WorkLife Dashboard - Frontend Client

React + TypeScript + Vite + Mantine 기반의 프론트엔드 애플리케이션입니다.

## 🚀 시작하기

### 필수 요구사항

- Node.js 20.x 이상
- npm 또는 yarn

### 설치

```bash
# 의존성 설치
npm install
```

### 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 설정하세요:

```env
VITE_API_URL=http://localhost:5001
```

### 개발 서버 실행

```bash
npm run dev
```

애플리케이션이 http://localhost:5173 에서 실행됩니다.

## 📁 프로젝트 구조

```
client/src/
├── components/          # React 컴포넌트
│   ├── common/         # 공통 컴포넌트
│   └── layout/         # 레이아웃 컴포넌트
├── pages/              # 페이지 컴포넌트
├── hooks/              # 커스텀 훅
│   └── useAuth.ts      # 인증 훅
├── lib/                # 라이브러리 설정
│   ├── axios.ts        # Axios 인스턴스
│   └── queryClient.ts  # TanStack Query 설정
├── services/           # API 서비스
│   └── api/
│       └── authApi.ts  # 인증 API
├── store/              # Redux 스토어
│   ├── slices/         # Redux 슬라이스
│   │   ├── uiSlice.ts  # UI 상태
│   │   └── authSlice.ts # 인증 클라이언트 상태
│   ├── hooks.ts        # Redux 타입 훅
│   └── index.ts        # 스토어 설정
├── types/              # TypeScript 타입 정의
└── main.tsx            # 앱 엔트리 포인트
```

## 🛠 기술 스택

### 핵심 라이브러리

- **React 19** - UI 라이브러리
- **TypeScript** - 타입 안전성
- **Vite** - 빌드 도구
- **React Router** - 라우팅

### 상태 관리

- **TanStack Query (React Query)** - 서버 상태 관리
  - 데이터 페칭, 캐싱, 동기화
  - 자동 백그라운드 업데이트
  - Optimistic 업데이트

- **Redux Toolkit** - 클라이언트 상태 관리
  - UI 상태 (사이드바, 테마 등)
  - 인증 상태 (로컬 사용자 정보)

### UI 라이브러리

- **Mantine v7** - React 컴포넌트 라이브러리
  - `@mantine/core` - 핵심 컴포넌트
  - `@mantine/hooks` - 유용한 훅
  - `@mantine/form` - 폼 관리
  - `@mantine/dates` - 날짜 피커
  - `@mantine/modals` - 모달 관리
  - `@mantine/notifications` - 토스트 알림
  - `@mantine/dropzone` - 파일 업로드

### 기타

- **Axios** - HTTP 클라이언트
- **date-fns** - 날짜 유틸리티
- **Tabler Icons** - 아이콘

## 🎨 상태 관리 전략

### TanStack Query (서버 상태)

서버에서 가져온 데이터를 관리합니다:
- 사용자 정보
- 거래 내역
- 카테고리
- 예산
- 급여 계산

```typescript
// 예시: 사용자 정보 조회
const { data: user, isLoading } = useQuery({
  queryKey: ['auth', 'me'],
  queryFn: authApi.me,
});
```

### Redux Toolkit (클라이언트 상태)

로컬 UI 상태를 관리합니다:
- 사이드바 열림/닫힘
- 다크/라이트 테마
- 로딩 상태
- 캐시된 사용자 정보

```typescript
// 예시: UI 상태 관리
const dispatch = useAppDispatch();
dispatch(toggleSidebar());
```

## 🔐 인증 시스템

### JWT 기반 인증

- **Access Token**: localStorage에 저장, API 요청시 자동 추가
- **Refresh Token**: HttpOnly 쿠키로 관리
- 토큰 만료시 자동 갱신

### useAuth 훅

```typescript
import { useAuth } from '@/hooks';

function Component() {
  const { user, login, logout, isAuthenticated } = useAuth();

  const handleLogin = async () => {
    await login({ email, password });
  };

  return <div>{user?.name}</div>;
}
```

## 📡 API 통신

### Axios 인터셉터

자동으로 처리되는 기능:
- Authorization 헤더 추가
- 401 에러시 토큰 갱신
- 에러 핸들링

```typescript
import api from '@/lib/axios';

// 자동으로 토큰이 추가됩니다
const response = await api.get('/api/transactions');
```

## 🎯 커스텀 훅

### useAuth

인증 관련 모든 기능을 제공:
- `user` - 현재 사용자 정보
- `isAuthenticated` - 인증 상태
- `login()` - 로그인
- `register()` - 회원가입
- `logout()` - 로그아웃

### useAppDispatch / useAppSelector

타입이 지정된 Redux 훅:
```typescript
import { useAppDispatch, useAppSelector } from '@/store/hooks';

const theme = useAppSelector(state => state.ui.colorScheme);
const dispatch = useAppDispatch();
```

## 🛠 사용 가능한 명령어

- `npm run dev` - 개발 서버 실행
- `npm run build` - 프로덕션 빌드
- `npm run preview` - 빌드 결과 미리보기
- `npm run lint` - ESLint 실행

## 🎨 스타일링

### Mantine 테마

`main.tsx`에서 테마를 커스터마이징할 수 있습니다:

```typescript
const theme = createTheme({
  primaryColor: 'blue',
  fontFamily: 'Pretendard, sans-serif',
});
```

### 다크 모드

기본적으로 다크 모드가 활성화되어 있으며, Redux로 테마를 전환할 수 있습니다.

## 📝 개발 가이드

### 새로운 API 추가

1. `src/types/index.ts`에 타입 정의
2. `src/services/api/`에 API 함수 작성
3. TanStack Query로 훅 생성

### 새로운 페이지 추가

1. `src/pages/`에 컴포넌트 생성
2. `src/App.tsx`에 라우트 추가
3. 필요시 레이아웃 적용

### Redux 상태 추가

1. `src/store/slices/`에 슬라이스 생성
2. `src/store/index.ts`에 리듀서 등록

## 🐛 트러블슈팅

### 백엔드 연결 실패

`.env` 파일의 `VITE_API_URL`이 올바른지 확인하세요.

### CORS 에러

백엔드 서버의 CORS 설정에서 클라이언트 URL이 허용되어 있는지 확인하세요.

## 📄 라이선스

ISC
