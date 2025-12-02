# Flutter 연동 API 문서

WorkLife Dashboard 서버 API를 Flutter 앱에서 연동하기 위한 상세 문서입니다.

## 목차
- [기본 정보](#기본-정보)
- [인증 API](#인증-api)
- [메모 API](#메모-api)
- [체크리스트 API](#체크리스트-api)
- [동기화 API](#동기화-api)
- [데이터 모델](#데이터-모델)
- [에러 처리](#에러-처리)

---

## 기본 정보

### Base URL
```
개발: http://localhost:5001
프로덕션: https://your-api-domain.com
```

### 인증 방식
- **액세스 토큰**: Authorization 헤더에 Bearer 토큰으로 전달
- **리프레시 토큰**: HttpOnly 쿠키로 관리 (Flutter에서는 수동 관리 필요)

### 공통 헤더
```http
Content-Type: application/json
Authorization: Bearer {accessToken}
```

### 응답 형식
성공 응답:
```json
{
  "success": true,
  "message": "성공 메시지",
  "data": { ... }
}
```

에러 응답:
```json
{
  "success": false,
  "message": "에러 메시지",
  "code": "ERROR_CODE"
}
```

---

## 인증 API

### 1. 회원가입

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "name": "홍길동"
}
```

**Request Validation:**
- `email`: 유효한 이메일 형식, 필수
- `password`: 최소 8자, 대소문자/숫자 포함, 필수
- `name`: 최소 2자, 필수

**Response (201):**
```json
{
  "success": true,
  "message": "회원가입이 완료되었습니다",
  "data": {
    "user": {
      "id": "clxxxxx",
      "email": "user@example.com",
      "name": "홍길동",
      "googleId": null,
      "picture": null,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Set-Cookie Header:**
```
refreshToken=<token>; HttpOnly; Secure; SameSite=None; Max-Age=604800
```

**Error Responses:**
- `409 Conflict`: 이미 사용 중인 이메일
- `400 Bad Request`: 유효성 검증 실패

---

### 2. 로그인

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "로그인이 완료되었습니다",
  "data": {
    "user": {
      "id": "clxxxxx",
      "email": "user@example.com",
      "name": "홍길동",
      "googleId": null,
      "picture": null,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `401 Unauthorized`: 이메일 또는 비밀번호 불일치

---

### 3. Google 로그인

**Endpoint:** `POST /api/auth/google`

**Request Body:**
```json
{
  "credential": "Google ID Token"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "로그인이 완료되었습니다",
  "data": {
    "user": {
      "id": "clxxxxx",
      "email": "user@example.com",
      "name": "홍길동",
      "googleId": "1234567890",
      "picture": "https://lh3.googleusercontent.com/...",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `400 Bad Request`: credential 누락 또는 Google 계정 정보 불완전
- `401 Unauthorized`: Google 인증 실패 또는 이메일 미검증
- `409 Conflict`: 이미 일반 계정으로 등록된 이메일

**Flutter 구현 예시:**
```dart
import 'package:google_sign_in/google_sign_in.dart';

final GoogleSignIn _googleSignIn = GoogleSignIn(
  scopes: ['email', 'profile'],
);

Future<void> signInWithGoogle() async {
  try {
    final GoogleSignInAccount? account = await _googleSignIn.signIn();
    final GoogleSignInAuthentication auth = await account!.authentication;

    // auth.idToken을 서버로 전송
    final response = await http.post(
      Uri.parse('$baseUrl/api/auth/google'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'credential': auth.idToken}),
    );

    // 응답 처리...
  } catch (error) {
    print('Google 로그인 실패: $error');
  }
}
```

---

### 4. 토큰 갱신

**Endpoint:** `POST /api/auth/refresh`

**Headers:**
```http
Cookie: refreshToken=<token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `401 Unauthorized`: 리프레시 토큰 누락 또는 만료
  - `REFRESH_TOKEN_MISSING`: 토큰 없음
  - `EXPIRED`: 토큰 만료
  - `REVOKED`: 토큰 취소됨
  - `INVALID`: 유효하지 않은 토큰

**Flutter 구현 참고:**
```dart
// Flutter에서는 HttpOnly 쿠키를 직접 관리할 수 없으므로
// 리프레시 토큰을 secure storage에 저장하고 수동으로 관리해야 합니다.
// 서버 측에서 Flutter용 별도 엔드포인트 추가를 권장합니다.
```

---

### 5. 현재 사용자 정보 조회

**Endpoint:** `GET /api/auth/me`

**Headers:**
```http
Authorization: Bearer {accessToken}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "clxxxxx",
    "email": "user@example.com",
    "name": "홍길동",
    "googleId": null,
    "picture": null,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

---

### 6. 로그아웃

**Endpoint:** `POST /api/auth/logout`

**Headers:**
```http
Cookie: refreshToken=<token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "로그아웃이 완료되었습니다"
}
```

---

### 7. 프로필 업데이트

**Endpoint:** `PUT /api/auth/profile`

**Headers:**
```http
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "name": "새로운 이름",
  "currentPassword": "OldPassword123!",  // 비밀번호 변경 시 필수
  "newPassword": "NewPassword123!"       // 선택
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "프로필이 업데이트되었습니다",
  "data": {
    "id": "clxxxxx",
    "email": "user@example.com",
    "name": "새로운 이름",
    "googleId": null,
    "picture": null,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

**주의사항:**
- 비밀번호 변경 시 모든 세션이 무효화되므로 재로그인 필요
- 이메일 변경은 불가능

---

## 메모 API

모든 메모 API는 인증 필요 (`Authorization: Bearer {accessToken}`)

### 1. 메모 목록 조회

**Endpoint:** `GET /api/notes`

**Query Parameters:**
```
page: number (default: 1)
limit: number (default: 20)
type: TEXT | CHECKLIST | MARKDOWN | QUICK
folderId: string (폴더 ID, null이면 루트)
isPinned: boolean
isFavorite: boolean
isArchived: boolean
search: string (제목/내용 검색)
dateFrom: ISO 8601 date string
dateTo: ISO 8601 date string
```

**Example Request:**
```http
GET /api/notes?page=1&limit=20&isPinned=true&type=TEXT
```

**Response (200):**
```json
{
  "notes": [
    {
      "id": "clxxxxx",
      "title": "메모 제목",
      "content": "메모 내용",
      "type": "TEXT",
      "visibility": "PRIVATE",
      "password": null,
      "isPinned": true,
      "isFavorite": false,
      "isArchived": false,
      "deletedAt": null,
      "publishedUrl": null,
      "deviceRevision": 0,
      "folderId": null,
      "userId": "clxxxxx",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z",
      "folder": null,
      "checklistItems": [],
      "attachments": [],
      "_count": {
        "checklistItems": 0,
        "attachments": 0
      }
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

---

### 2. 단일 메모 조회

**Endpoint:** `GET /api/notes/:id`

**Response (200):**
```json
{
  "id": "clxxxxx",
  "title": "메모 제목",
  "content": "메모 내용",
  "type": "TEXT",
  "visibility": "PRIVATE",
  "password": null,
  "isPinned": false,
  "isFavorite": false,
  "isArchived": false,
  "deletedAt": null,
  "publishedUrl": null,
  "deviceRevision": 0,
  "folderId": null,
  "userId": "clxxxxx",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z",
  "folder": null,
  "checklistItems": [],
  "attachments": []
}
```

**Error Responses:**
- `404 Not Found`: 메모를 찾을 수 없음

---

### 3. 메모 생성

**Endpoint:** `POST /api/notes`

**Request Body:**
```json
{
  "title": "새 메모",
  "content": "메모 내용",
  "type": "TEXT",
  "visibility": "PRIVATE",
  "password": null,
  "folderId": null,
  "isPinned": false,
  "isFavorite": false,
  "isArchived": false
}
```

**Field Descriptions:**
- `title`: 필수, 1-500자
- `content`: 필수, 텍스트
- `type`: 선택, 기본값 `TEXT` (TEXT | CHECKLIST | MARKDOWN | QUICK)
- `visibility`: 선택, 기본값 `PRIVATE` (PRIVATE | PUBLIC | PROTECTED)
- `password`: `visibility`가 `PROTECTED`일 때만 필수
- `folderId`: 선택, 폴더 ID
- `isPinned`, `isFavorite`, `isArchived`: 선택, 기본값 `false`

**Response (201):**
```json
{
  "id": "clxxxxx",
  "title": "새 메모",
  "content": "메모 내용",
  "type": "TEXT",
  "visibility": "PRIVATE",
  "password": null,
  "isPinned": false,
  "isFavorite": false,
  "isArchived": false,
  "deletedAt": null,
  "publishedUrl": null,
  "deviceRevision": 0,
  "folderId": null,
  "userId": "clxxxxx",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

---

### 4. 메모 수정

**Endpoint:** `PUT /api/notes/:id`

**Request Body:**
```json
{
  "title": "수정된 제목",
  "content": "수정된 내용",
  "visibility": "PUBLIC",
  "isPinned": true,
  "folderId": "clxxxxx"
}
```

**주의사항:**
- `type`은 수정 불가 (생성 시 결정)
- 부분 업데이트 지원 (변경할 필드만 전송)
- `deviceRevision`은 자동으로 증가

**Response (200):**
```json
{
  "id": "clxxxxx",
  "title": "수정된 제목",
  "content": "수정된 내용",
  "type": "TEXT",
  "visibility": "PUBLIC",
  "password": null,
  "isPinned": true,
  "isFavorite": false,
  "isArchived": false,
  "deletedAt": null,
  "publishedUrl": "abc123def",
  "deviceRevision": 1,
  "folderId": "clxxxxx",
  "userId": "clxxxxx",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T12:00:00.000Z"
}
```

---

### 5. 메모 삭제 (소프트 삭제)

**Endpoint:** `DELETE /api/notes/:id`

**Response (200):**
```json
{
  "message": "메모가 휴지통으로 이동되었습니다",
  "id": "clxxxxx"
}
```

**주의사항:**
- 소프트 삭제: `deletedAt`에 타임스탬프 설정
- 30일 후 자동 영구 삭제 (서버 설정에 따라 다름)
- 복원 가능 (`POST /api/notes/:id/restore`)

---

### 6. 메모 플래그 토글

**Endpoint:** `POST /api/notes/:id/toggle`

**Request Body:**
```json
{
  "field": "isPinned",
  "value": true
}
```

**Supported Fields:**
- `isPinned`: 고정
- `isFavorite`: 즐겨찾기
- `isArchived`: 보관함

**Response (200):**
```json
{
  "message": "메모가 업데이트되었습니다",
  "note": {
    "id": "clxxxxx",
    "isPinned": true,
    "isFavorite": false,
    "isArchived": false
  }
}
```

---

### 7. 휴지통 목록 조회

**Endpoint:** `GET /api/notes/trash`

**Query Parameters:**
```
page: number (default: 1)
limit: number (default: 20)
```

**Response (200):**
```json
{
  "notes": [
    {
      "id": "clxxxxx",
      "title": "삭제된 메모",
      "deletedAt": "2025-01-01T00:00:00.000Z",
      ...
    }
  ],
  "pagination": {
    "total": 10,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

### 8. 메모 복원

**Endpoint:** `POST /api/notes/:id/restore`

**Response (200):**
```json
{
  "message": "메모가 복원되었습니다",
  "note": {
    "id": "clxxxxx",
    "deletedAt": null,
    ...
  }
}
```

---

### 9. 메모 영구 삭제

**Endpoint:** `DELETE /api/notes/:id/permanent`

**Response (200):**
```json
{
  "message": "메모가 영구 삭제되었습니다",
  "id": "clxxxxx"
}
```

**주의사항:**
- 복구 불가능
- 관련 체크리스트 항목 및 첨부파일도 모두 삭제

---

### 10. 메모 검색

**Endpoint:** `GET /api/notes/search`

**Query Parameters:**
```
q: string (검색어, 필수)
page: number (default: 1)
limit: number (default: 20)
type: TEXT | CHECKLIST | MARKDOWN | QUICK
```

**Response (200):**
```json
{
  "notes": [...],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  },
  "query": "검색어"
}
```

---

### 11. 검색 자동완성

**Endpoint:** `GET /api/notes/search/suggestions`

**Query Parameters:**
```
q: string (검색어, 필수)
limit: number (default: 5)
```

**Response (200):**
```json
{
  "suggestions": [
    "프로젝트 회의록",
    "프로젝트 계획",
    "프로젝트 아이디어"
  ]
}
```

---

## 체크리스트 API

### 1. 체크리스트 항목 목록 조회

**Endpoint:** `GET /api/notes/:noteId/checklist`

**Response (200):**
```json
{
  "items": [
    {
      "id": "clxxxxx",
      "content": "할 일 1",
      "isCompleted": false,
      "order": 0,
      "noteId": "clxxxxx",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    },
    {
      "id": "clyyyyy",
      "content": "할 일 2",
      "isCompleted": true,
      "order": 1,
      "noteId": "clxxxxx",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 2. 체크리스트 진행률 조회

**Endpoint:** `GET /api/notes/:noteId/checklist/progress`

**Response (200):**
```json
{
  "total": 10,
  "completed": 7,
  "percentage": 70
}
```

---

### 3. 체크리스트 항목 생성

**Endpoint:** `POST /api/notes/:noteId/checklist`

**Request Body:**
```json
{
  "content": "새 할 일",
  "order": 0
}
```

**Response (201):**
```json
{
  "id": "clxxxxx",
  "content": "새 할 일",
  "isCompleted": false,
  "order": 0,
  "noteId": "clxxxxx",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

---

### 4. 체크리스트 항목 수정

**Endpoint:** `PUT /api/checklist/:id`

**Request Body:**
```json
{
  "content": "수정된 할 일",
  "isCompleted": true
}
```

**Response (200):**
```json
{
  "id": "clxxxxx",
  "content": "수정된 할 일",
  "isCompleted": true,
  "order": 0,
  "noteId": "clxxxxx",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T12:00:00.000Z"
}
```

---

### 5. 체크리스트 항목 완료 토글

**Endpoint:** `POST /api/checklist/:id/toggle`

**Response (200):**
```json
{
  "id": "clxxxxx",
  "isCompleted": true,
  "updatedAt": "2025-01-01T12:00:00.000Z"
}
```

---

### 6. 체크리스트 항목 순서 변경

**Endpoint:** `POST /api/notes/:noteId/checklist/reorder`

**Request Body:**
```json
{
  "items": [
    { "id": "clxxxxx", "order": 0 },
    { "id": "clyyyyy", "order": 1 },
    { "id": "clzzzzz", "order": 2 }
  ]
}
```

**Response (200):**
```json
{
  "message": "체크리스트 순서가 변경되었습니다",
  "items": [...]
}
```

---

### 7. 체크리스트 항목 삭제

**Endpoint:** `DELETE /api/checklist/:id`

**Response (200):**
```json
{
  "message": "체크리스트 항목이 삭제되었습니다",
  "id": "clxxxxx"
}
```

---

## 동기화 API

### 1. 변경 사항 조회

**Endpoint:** `GET /api/sync`

**Query Parameters:**
```
since: ISO 8601 date string (필수, 이 시간 이후의 변경 사항)
limit: number (default: 200, max: 500)
```

**Example Request:**
```http
GET /api/sync?since=2025-01-01T00:00:00.000Z&limit=100
```

**Response (200):**
```json
{
  "notes": [
    {
      "id": "clxxxxx",
      "title": "메모",
      "content": "내용",
      "type": "TEXT",
      "deviceRevision": 5,
      "updatedAt": "2025-01-01T12:00:00.000Z",
      ...
    }
  ],
  "deletedNoteIds": ["clyyyyy", "clzzzzz"],
  "folders": [...],
  "deletedFolderIds": [...],
  "checklistItems": [...],
  "deletedChecklistItemIds": [...],
  "lastSyncedAt": "2025-01-01T12:00:00.000Z"
}
```

**동기화 로직:**
1. 마지막 동기화 시간(`since`)을 전달
2. 서버는 그 이후 변경된 모든 엔티티 반환
3. `deletedXxxIds` 배열에는 삭제된 항목의 ID 포함
4. 클라이언트는 받은 데이터로 로컬 DB 업데이트
5. `lastSyncedAt`을 저장하여 다음 동기화에 사용

---

### 2. 최신 타임스탬프 조회

**Endpoint:** `GET /api/sync/meta`

**Response (200):**
```json
{
  "latestTimestamp": "2025-01-01T12:00:00.000Z"
}
```

**사용 목적:**
- 동기화 필요 여부 확인
- 로컬의 마지막 동기화 시간과 비교

---

## 데이터 모델

### User
```typescript
{
  id: string;           // CUID
  email: string;
  name: string;
  googleId?: string;
  picture?: string;     // 프로필 이미지 URL
  createdAt: string;    // ISO 8601
  updatedAt: string;    // ISO 8601
}
```

### Note
```typescript
{
  id: string;
  title: string;
  content: string;
  type: 'TEXT' | 'CHECKLIST' | 'MARKDOWN' | 'QUICK';
  visibility: 'PRIVATE' | 'PUBLIC' | 'PROTECTED';
  password?: string;
  isPinned: boolean;
  isFavorite: boolean;
  isArchived: boolean;
  deletedAt?: string;    // ISO 8601 or null
  publishedUrl?: string; // 공개 URL slug
  deviceRevision: number;
  folderId?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;

  // Relations (include 시)
  folder?: Folder;
  checklistItems?: ChecklistItem[];
  attachments?: Attachment[];
}
```

### ChecklistItem
```typescript
{
  id: string;
  content: string;
  isCompleted: boolean;
  order: number;
  noteId: string;
  createdAt: string;
  updatedAt: string;
}
```

### Folder
```typescript
{
  id: string;
  name: string;
  color?: string;
  parentId?: string;    // 중첩 폴더
  userId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}
```

### Attachment
```typescript
{
  id: string;
  fileName: string;
  fileSize: number;     // bytes
  mimeType: string;
  type: 'IMAGE' | 'AUDIO' | 'FILE';
  url: string;          // 파일 경로/URL
  hash?: string;        // 중복 제거용
  thumbnailUrl?: string;
  noteId: string;
  createdAt: string;
}
```

---

## 에러 처리

### HTTP 상태 코드

| 코드 | 의미 | 대응 방법 |
|------|------|-----------|
| 200 | 성공 | - |
| 201 | 생성 성공 | - |
| 400 | 잘못된 요청 | 요청 데이터 검증 |
| 401 | 인증 실패 | 토큰 갱신 또는 재로그인 |
| 403 | 권한 없음 | 접근 권한 확인 |
| 404 | 리소스 없음 | 리소스 존재 여부 확인 |
| 409 | 충돌 | 중복 데이터 확인 |
| 500 | 서버 오류 | 재시도 또는 사용자에게 안내 |

### 에러 응답 구조
```json
{
  "success": false,
  "message": "에러 메시지",
  "code": "ERROR_CODE",
  "details": { ... }     // 선택적
}
```

### 주요 에러 코드

**인증 관련:**
- `REFRESH_TOKEN_MISSING`: 리프레시 토큰 없음
- `EXPIRED`: 토큰 만료
- `REVOKED`: 토큰 취소됨
- `INVALID`: 유효하지 않은 토큰
- `CSRF_CHECK_FAILED`: CSRF 검증 실패

**유효성 검증:**
- `VALIDATION_ERROR`: 요청 데이터 검증 실패

**비즈니스 로직:**
- `RESOURCE_NOT_FOUND`: 리소스를 찾을 수 없음
- `DUPLICATE_RESOURCE`: 중복된 리소스
- `UNAUTHORIZED_ACCESS`: 권한 없음

---

## Flutter 구현 예시

### API 클라이언트 설정

```dart
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiClient {
  static const String baseUrl = 'http://localhost:5001';
  final Dio _dio;
  final FlutterSecureStorage _storage;

  ApiClient()
      : _dio = Dio(BaseOptions(
          baseUrl: baseUrl,
          connectTimeout: const Duration(seconds: 30),
          receiveTimeout: const Duration(seconds: 30),
        )),
        _storage = const FlutterSecureStorage() {
    _setupInterceptors();
  }

  void _setupInterceptors() {
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        // 액세스 토큰 추가
        final token = await _storage.read(key: 'accessToken');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onError: (error, handler) async {
        // 401 에러 시 토큰 갱신
        if (error.response?.statusCode == 401) {
          try {
            await _refreshToken();
            // 원래 요청 재시도
            final options = error.requestOptions;
            final token = await _storage.read(key: 'accessToken');
            options.headers['Authorization'] = 'Bearer $token';
            final response = await _dio.fetch(options);
            return handler.resolve(response);
          } catch (e) {
            // 로그아웃 처리
            return handler.reject(error);
          }
        }
        return handler.next(error);
      },
    ));
  }

  Future<void> _refreshToken() async {
    // 리프레시 토큰으로 새 액세스 토큰 발급
    // 서버에서 Flutter용 별도 엔드포인트 필요
  }
}
```

### 인증 서비스 예시

```dart
class AuthService {
  final ApiClient _api;

  AuthService(this._api);

  Future<User> login(String email, String password) async {
    final response = await _api._dio.post('/api/auth/login', data: {
      'email': email,
      'password': password,
    });

    final data = response.data['data'];

    // 토큰 저장
    await _api._storage.write(
      key: 'accessToken',
      value: data['accessToken'],
    );

    return User.fromJson(data['user']);
  }

  Future<User> register({
    required String email,
    required String password,
    required String name,
  }) async {
    final response = await _api._dio.post('/api/auth/register', data: {
      'email': email,
      'password': password,
      'name': name,
    });

    final data = response.data['data'];

    await _api._storage.write(
      key: 'accessToken',
      value: data['accessToken'],
    );

    return User.fromJson(data['user']);
  }

  Future<void> logout() async {
    await _api._dio.post('/api/auth/logout');
    await _api._storage.delete(key: 'accessToken');
  }
}
```

### 메모 서비스 예시

```dart
class NoteService {
  final ApiClient _api;

  NoteService(this._api);

  Future<List<Note>> getNotes({
    int page = 1,
    int limit = 20,
    NoteType? type,
    bool? isPinned,
  }) async {
    final response = await _api._dio.get('/api/notes', queryParameters: {
      'page': page,
      'limit': limit,
      if (type != null) 'type': type.name,
      if (isPinned != null) 'isPinned': isPinned,
    });

    final notes = (response.data['notes'] as List)
        .map((json) => Note.fromJson(json))
        .toList();

    return notes;
  }

  Future<Note> createNote({
    required String title,
    required String content,
    NoteType type = NoteType.TEXT,
  }) async {
    final response = await _api._dio.post('/api/notes', data: {
      'title': title,
      'content': content,
      'type': type.name,
    });

    return Note.fromJson(response.data);
  }

  Future<Note> updateNote(String id, Map<String, dynamic> updates) async {
    final response = await _api._dio.put('/api/notes/$id', data: updates);
    return Note.fromJson(response.data);
  }

  Future<void> deleteNote(String id) async {
    await _api._dio.delete('/api/notes/$id');
  }
}
```

### 동기화 서비스 예시

```dart
class SyncService {
  final ApiClient _api;
  final Database _db; // 로컬 DB (sqflite, hive 등)

  SyncService(this._api, this._db);

  Future<void> sync() async {
    // 마지막 동기화 시간 가져오기
    final lastSyncedAt = await _db.getLastSyncedAt() ??
        DateTime.now().subtract(const Duration(days: 365));

    // 변경 사항 조회
    final response = await _api._dio.get('/api/sync', queryParameters: {
      'since': lastSyncedAt.toIso8601String(),
      'limit': 200,
    });

    final data = response.data;

    // 로컬 DB 업데이트
    await _db.transaction(() async {
      // 노트 업데이트
      for (final noteJson in data['notes']) {
        final note = Note.fromJson(noteJson);
        await _db.upsertNote(note);
      }

      // 삭제된 노트 제거
      for (final id in data['deletedNoteIds']) {
        await _db.deleteNote(id);
      }

      // 체크리스트 항목 업데이트
      for (final itemJson in data['checklistItems']) {
        final item = ChecklistItem.fromJson(itemJson);
        await _db.upsertChecklistItem(item);
      }

      // 삭제된 체크리스트 항목 제거
      for (final id in data['deletedChecklistItemIds']) {
        await _db.deleteChecklistItem(id);
      }

      // 마지막 동기화 시간 저장
      await _db.setLastSyncedAt(DateTime.parse(data['lastSyncedAt']));
    });
  }

  // 주기적 동기화 (백그라운드)
  Future<void> startPeriodicSync() async {
    Timer.periodic(const Duration(minutes: 5), (timer) async {
      try {
        await sync();
      } catch (e) {
        print('동기화 실패: $e');
      }
    });
  }
}
```

---

## 추가 고려사항

### 1. 오프라인 지원
- 로컬 데이터베이스 사용 (sqflite, hive 등)
- 오프라인 작업을 큐에 저장
- 온라인 복귀 시 자동 동기화

### 2. 충돌 해결
- `deviceRevision` 필드를 사용하여 버전 관리
- 서버의 `deviceRevision`이 더 높으면 서버 데이터 우선
- 충돌 발생 시 사용자에게 선택 옵션 제공

### 3. 보안
- SSL/TLS 사용
- 민감한 데이터는 암호화하여 저장
- Flutter Secure Storage로 토큰 관리
- 루트/탈옥 기기 감지

### 4. 성능 최적화
- 페이지네이션 활용
- 이미지/첨부파일 캐싱
- 증분 동기화 (전체 동기화 대신)
- 백그라운드 동기화

### 5. 에러 핸들링
- 네트워크 에러 재시도 로직
- 사용자 친화적인 에러 메시지
- 로깅 및 모니터링

---

## 문의 및 지원

API 관련 문의사항이나 버그 리포트는 개발팀에 문의해주세요.

**마지막 업데이트:** 2025-01-01
**API 버전:** v1
