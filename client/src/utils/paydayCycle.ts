import { formatDate } from '@/utils/format';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const clampDayToMonth = (year: number, monthIndex: number, payday: number) => {
  const normalizedPayday = Math.min(31, Math.max(1, payday));
  const base = new Date(year, monthIndex, 1);
  const lastDay = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
  const day = Math.min(normalizedPayday, lastDay);
  return new Date(base.getFullYear(), base.getMonth(), day, 0, 0, 0, 0);
};

export const getCycleRange = (reference: Date, payday: number) => {
  const base = new Date(reference.getFullYear(), reference.getMonth(), 1);
  const nextStart = clampDayToMonth(base.getFullYear(), base.getMonth(), payday);
  const start = clampDayToMonth(base.getFullYear(), base.getMonth() - 1, payday);
  const end = new Date(nextStart.getTime() - 1);
  const days = Math.max(1, Math.round((nextStart.getTime() - start.getTime()) / MS_PER_DAY));

  return { start, end, days, nextStart };
};

export const getPreviousCycleRange = (reference: Date, payday: number) => {
  const prevReference = new Date(reference.getFullYear(), reference.getMonth() - 1, 1);
  return getCycleRange(prevReference, payday);
};

export const formatCycleLabel = (start: Date, end: Date) =>
  `${formatDate(start, 'long')} ~ ${formatDate(end, 'long')}`;
