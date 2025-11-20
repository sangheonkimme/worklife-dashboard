import { useUserSettingsStore } from '@/store/useUserSettingsStore';
import { useFinanceSettingsStore } from '@/store/useFinanceSettingsStore';

const DEFAULT_LOCALE = 'ko-KR';
const DEFAULT_CURRENCY = 'KRW';
const DEFAULT_TIMEZONE = (() => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
})();

const getActiveLocale = () =>
  useUserSettingsStore.getState().settings?.locale ?? DEFAULT_LOCALE;

const getActiveCurrency = () => {
  const settingsCurrency = useUserSettingsStore.getState().settings?.finance.currency;
  if (settingsCurrency) return settingsCurrency;
  const financeStoreCurrency = useFinanceSettingsStore.getState().currency;
  return financeStoreCurrency || DEFAULT_CURRENCY;
};

const getActiveTimeZone = () =>
  useUserSettingsStore.getState().settings?.timezone ?? DEFAULT_TIMEZONE;

const ensureDate = (date: string | Date) =>
  (typeof date === 'string' ? new Date(date) : date);

/**
 * 숫자를 통화 형식으로 변환
 */
export function formatCurrency(
  amount: number,
  options: Intl.NumberFormatOptions = {}
): string {
  const locale = getActiveLocale();
  const currency = options.currency || getActiveCurrency();

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
    ...options,
  }).format(amount);
}

/**
 * 숫자를 천 단위 구분자와 함께 변환
 * @param num 숫자
 * @returns 형식화된 숫자 문자열 (예: "1,234,567")
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat(getActiveLocale()).format(num);
}

/**
 * 날짜를 형식화
 * @param date 날짜
 * @param format 형식 ('short' | 'long' | 'full')
 * @returns 형식화된 날짜 문자열
 */
export function formatDate(
  date: string | Date,
  format: 'short' | 'long' | 'full' = 'short'
): string {
  const locale = getActiveLocale();
  const timeZone = getActiveTimeZone();
  const d = ensureDate(date);

  const options: Intl.DateTimeFormatOptions = {
    timeZone,
  };

  if (format === 'short') {
    options.dateStyle = 'medium';
  } else if (format === 'long') {
    options.dateStyle = 'long';
  } else if (format === 'full') {
    options.dateStyle = 'full';
  }

  return new Intl.DateTimeFormat(locale, options).format(d);
}

/**
 * 날짜와 시간을 형식화
 * @param date 날짜
 * @returns 형식화된 날짜시간 문자열
 */
export function formatDateTime(date: string | Date): string {
  const locale = getActiveLocale();
  const timeZone = getActiveTimeZone();
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone,
  }).format(ensureDate(date));
}

/**
 * 상대 시간 표시 (예: "3시간 전", "2일 전")
 * @param date 날짜
 * @returns 상대 시간 문자열
 */
export function formatRelativeTime(date: string | Date): string {
  const locale = getActiveLocale();
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const d = ensureDate(date);
  const now = new Date();
  const diffInSeconds = Math.floor((d.getTime() - now.getTime()) / 1000);

  const divisions = [
    { amount: 60, unit: 'second' as const },
    { amount: 60, unit: 'minute' as const },
    { amount: 24, unit: 'hour' as const },
    { amount: 7, unit: 'day' as const },
    { amount: 4.34524, unit: 'week' as const },
    { amount: 12, unit: 'month' as const },
    { amount: Number.POSITIVE_INFINITY, unit: 'year' as const },
  ];

  let duration = diffInSeconds;
  for (const division of divisions) {
    if (Math.abs(duration) < division.amount) {
      return formatter.format(Math.round(duration), division.unit);
    }
    duration /= division.amount;
  }

  return formatter.format(Math.round(duration), 'years');
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
