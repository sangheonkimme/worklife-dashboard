# 이미지→PDF 변환 위젯 구현 계획

## 1. 프로젝트 개요

현재 `DashboardPage.tsx`에는 통계 카드와 기능 카드들이 있습니다. 이미지→PDF 변환 위젯을 추가하여 사용자가 대시보드에서 직접 이미지를 PDF로 변환할 수 있도록 합니다.

## 2. 기술 스택 선정

### 클라이언트 사이드 처리 방식 채택

- **pdf-lib**: PDF 생성 및 조작을 위한 라이브러리 (순수 JavaScript, 브라우저 지원)
- **Mantine Dropzone**: 이미지 업로드 UI (이미 프로젝트에서 Mantine v7 사용 중)
- **Canvas API**: 이미지 크기 조정 및 최적화
- **@tabler/icons-react**: 아이콘 (이미 프로젝트에서 사용 중)

### 장점

- 서버 부하 없음
- 빠른 응답 속도
- 개인정보 보호 (이미지가 서버로 전송되지 않음)

## 3. 주요 기능 요구사항

### 필수 기능

#### 1. 이미지 업로드
- 드래그 앤 드롭 지원
- 파일 선택 버튼
- 지원 포맷: PNG, JPG, JPEG, WEBP
- 여러 이미지 동시 업로드 (배치 처리)

#### 2. 이미지 관리
- 이미지 미리보기 목록
- 이미지 순서 변경 (드래그 앤 드롭)
- 개별 이미지 삭제
- 전체 이미지 초기화

#### 3. PDF 설정 옵션
- 페이지 크기: A4, Letter, Custom
- 페이지 방향: Portrait (세로), Landscape (가로)
- 이미지 맞춤 옵션:
  - Fit (여백 유지하며 맞춤)
  - Fill (페이지 채우기)
  - Original (원본 크기)
- 여백 설정 (선택사항)

#### 4. PDF 생성 및 다운로드
- 진행 상태 표시 (로딩 인디케이터)
- 에러 처리 및 사용자 피드백
- 자동 파일명 생성 (예: `images-to-pdf-20250111-143022.pdf`)

### 선택 기능 (향후 확장)
- 변환 이력 저장 (백엔드 연동)
- 이미지 편집 (회전, 크롭)
- 텍스트 추가
- 페이지 번호 추가

## 4. 파일 구조

```
client/
├── src/
│   ├── components/
│   │   ├── widgets/
│   │   │   ├── ImageToPdfWidget/
│   │   │   │   ├── ImageToPdfWidget.tsx          # 메인 위젯 컴포넌트
│   │   │   │   ├── ImageUploadZone.tsx           # 드래그 앤 드롭 업로드 영역
│   │   │   │   ├── ImagePreviewList.tsx          # 이미지 미리보기 목록
│   │   │   │   ├── ImagePreviewItem.tsx          # 개별 이미지 미리보기 아이템
│   │   │   │   ├── PdfOptionsPanel.tsx           # PDF 설정 옵션 패널
│   │   │   │   └── index.ts                       # Export
│   │   │   └── index.ts
│   │   └── dashboard/                              # (향후 확장용)
│   │       └── WidgetCard.tsx                     # 재사용 가능한 위젯 카드 래퍼
│   ├── utils/
│   │   └── pdfGenerator.ts                        # PDF 생성 유틸리티 함수
│   ├── types/
│   │   └── widget.ts                              # 위젯 관련 타입 정의
│   └── pages/
│       └── DashboardPage.tsx                      # 위젯 통합
└── package.json                                    # pdf-lib 추가
```

## 5. 컴포넌트 구조 및 역할

### 5.1 ImageToPdfWidget.tsx (메인 컴포넌트)

**역할**: 전체 위젯의 상태 관리 및 조율

**상태**:
- `images`: 업로드된 이미지 목록 (File 객체 배열)
- `pdfOptions`: PDF 설정 옵션
- `isGenerating`: PDF 생성 중 상태
- `error`: 에러 메시지

**기능**:
- 이미지 추가/삭제/순서 변경
- PDF 생성 트리거
- 하위 컴포넌트 조합

### 5.2 ImageUploadZone.tsx

**역할**: 이미지 업로드 UI

**기능**:
- Mantine Dropzone 사용
- 파일 타입 검증 (PNG, JPG, JPEG, WEBP)
- 파일 크기 제한 (예: 10MB)
- 드래그 앤 드롭 시각적 피드백

### 5.3 ImagePreviewList.tsx

**역할**: 업로드된 이미지 목록 표시 및 관리

**기능**:
- 이미지 썸네일 표시
- 순서 변경 (드래그 앤 드롭)
- 개별 삭제 버튼
- 빈 상태 메시지

### 5.4 ImagePreviewItem.tsx

**역할**: 개별 이미지 미리보기 카드

**기능**:
- 이미지 썸네일 표시
- 파일명 및 크기 표시
- 삭제 버튼
- 드래그 핸들

### 5.5 PdfOptionsPanel.tsx

**역할**: PDF 생성 옵션 설정 UI

**기능**:
- 페이지 크기 선택 (Select)
- 페이지 방향 선택 (Radio/SegmentedControl)
- 이미지 맞춤 옵션 (Radio/SegmentedControl)
- 설정 변경 시 미리보기 (선택사항)

### 5.6 pdfGenerator.ts (유틸리티)

**역할**: PDF 생성 로직

**주요 함수**:
```typescript
export async function generatePdfFromImages(
  images: File[],
  options: PdfOptions
): Promise<Uint8Array>
```

**기능**:
- pdf-lib를 사용한 PDF 문서 생성
- 이미지를 페이지에 삽입
- 옵션에 따른 레이아웃 조정
- 최적화 및 압축

## 6. 타입 정의 (types/widget.ts)

```typescript
export interface PdfOptions {
  pageSize: 'A4' | 'Letter' | 'Custom';
  orientation: 'portrait' | 'landscape';
  imageFit: 'fit' | 'fill' | 'original';
  margin?: number; // 선택사항
  customWidth?: number; // pageSize가 Custom일 때
  customHeight?: number; // pageSize가 Custom일 때
}

export interface ImageFile {
  file: File;
  id: string;
  preview: string; // Object URL
  order: number;
}

export interface PdfGenerationResult {
  success: boolean;
  data?: Uint8Array;
  error?: string;
  fileName?: string;
}
```

## 7. 구현 단계

### Phase 1: 기본 구조 설정 (1-2시간)

1. `pdf-lib` 및 필요한 타입 패키지 설치
   ```bash
   cd client
   npm install pdf-lib
   npm install -D @types/pdf-lib
   ```
2. 디렉토리 구조 생성
3. 타입 정의 파일 작성 (`types/widget.ts`)
4. 메인 위젯 컴포넌트 스캐폴딩

### Phase 2: 이미지 업로드 기능 (2-3시간)

1. `ImageUploadZone` 컴포넌트 구현
2. `ImagePreviewList` 및 `ImagePreviewItem` 구현
3. 이미지 상태 관리 (추가/삭제)
4. 미리보기 URL 생성 및 메모리 관리

### Phase 3: PDF 생성 기능 (3-4시간)

1. `pdfGenerator.ts` 유틸리티 함수 구현
2. 페이지 크기 및 방향 처리
3. 이미지를 페이지에 삽입하는 로직
4. 이미지 맞춤 옵션 구현 (fit/fill/original)

### Phase 4: 옵션 패널 및 UI 개선 (2-3시간)

1. `PdfOptionsPanel` 컴포넌트 구현
2. 옵션 변경 시 미리보기 업데이트
3. 로딩 상태 및 진행 표시
4. 에러 처리 및 사용자 피드백 (Toast/Notification)

### Phase 5: 순서 변경 및 고급 기능 (2-3시간)

1. 드래그 앤 드롭으로 이미지 순서 변경
   - `@dnd-kit/core` 또는 `react-beautiful-dnd` 사용 검토
2. PDF 다운로드 최적화
3. 접근성(A11y) 개선
4. 반응형 디자인 조정

### Phase 6: 통합 및 테스트 (1-2시간)

1. DashboardPage에 위젯 통합
2. 전체 워크플로우 테스트
3. 다양한 이미지 포맷 및 크기 테스트
4. 에러 케이스 처리 검증

**총 예상 시간: 11-17시간**

## 8. DashboardPage 통합 방법

`client/src/pages/DashboardPage.tsx`의 "주요 기능" 섹션에 위젯 추가:

```typescript
<SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
  <SalaryCalculatorCard />
  <ImageToPdfWidget />  {/* 새로운 위젯 */}
  {/* 추가 기능 카드는 여기에 추가 */}
</SimpleGrid>
```

## 9. 향후 확장 가능성

### 위젯 시스템으로 확장

향후 다른 위젯을 쉽게 추가할 수 있도록 구조 설계:
- `WidgetCard` 공통 래퍼 컴포넌트
- 위젯 설정 저장 (어떤 위젯을 표시할지)
- 위젯 레이아웃 관리 (그리드, 크기 조정)
- 위젯 마켓플레이스 (선택사항)

### 추가 가능한 위젯 아이디어

- 텍스트 에디터 (마크다운 변환)
- QR 코드 생성기
- URL 단축기
- 타이머/스톱워치
- 계산기
- 환율 변환기

## 10. 주의사항 및 고려사항

### 성능

- 대용량 이미지 처리 시 메모리 관리
- Canvas를 사용한 이미지 크기 조정으로 최적화
- 미리보기 URL 생성 후 `URL.revokeObjectURL()` 호출하여 메모리 누수 방지

### 보안

- 파일 타입 검증 (MIME type + 파일 확장자)
- 파일 크기 제한
- XSS 방지 (사용자 입력 검증)

### 사용자 경험

- 명확한 에러 메시지
- 진행 상태 표시
- 취소 기능
- 키보드 접근성

### 브라우저 호환성

- pdf-lib는 최신 브라우저 지원
- Object URL 및 Canvas API 지원 확인
- 구형 브라우저용 폴백 메시지

## 요약

이 계획은 대시보드에 이미지→PDF 변환 위젯을 추가하는 전체 로드맵입니다. 클라이언트 사이드에서 처리하여 빠르고 안전하며, 향후 다른 위젯을 추가할 수 있는 확장 가능한 구조로 설계되었습니다.

구현 준비가 되면 개발을 시작할 수 있습니다.
