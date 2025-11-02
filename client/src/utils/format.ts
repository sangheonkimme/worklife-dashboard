/**
 * 숫자를 통화 형식으로 변환
 * @param amount 금액
 * @returns 형식화된 통화 문자열 (예: "1,234,567원")
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(amount);
}

/**
 * 숫자를 천 단위 구분자와 함께 변환
 * @param num 숫자
 * @returns 형식화된 숫자 문자열 (예: "1,234,567")
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('ko-KR').format(num);
}

/**
 * 날짜를 형식화
 * @param date 날짜
 * @param format 형식 ('short' | 'long' | 'full')
 * @returns 형식화된 날짜 문자열
 */
export function formatDate(date: string | Date, format: 'short' | 'long' | 'full' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  switch (format) {
    case 'short':
      return d.toLocaleDateString('ko-KR');
    case 'long':
      return d.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    case 'full':
      return d.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      });
    default:
      return d.toLocaleDateString('ko-KR');
  }
}

/**
 * 날짜와 시간을 형식화
 * @param date 날짜
 * @returns 형식화된 날짜시간 문자열
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('ko-KR');
}

/**
 * 상대 시간 표시 (예: "3시간 전", "2일 전")
 * @param date 날짜
 * @returns 상대 시간 문자열
 */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return '방금 전';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}일 전`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}개월 전`;
  return `${Math.floor(diffInSeconds / 31536000)}년 전`;
}

/**
 * 파일 크기를 형식화
 * @param bytes 바이트 크기
 * @returns 형식화된 파일 크기 문자열 (예: "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * 퍼센트를 형식화
 * @param value 값
 * @param total 전체 값
 * @param decimals 소수점 자리수
 * @returns 형식화된 퍼센트 문자열 (예: "75.5%")
 */
export function formatPercentage(value: number, total: number, decimals = 1): string {
  if (total === 0) return '0%';
  const percentage = (value / total) * 100;
  return `${percentage.toFixed(decimals)}%`;
}
