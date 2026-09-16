import {
  toJalaali,
  toGregorian,
  jalaaliToDateObject,
  jalaaliMonthLength,
  type JalaaliDate,
} from 'jalaali-js';

export const JALALI_MONTH_NAMES = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
] as const;

// Persian weeks start on Saturday; index 0 == Saturday.
export const WEEKDAY_NAMES = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'] as const;

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export function toPersianDigits(value: number | string): string {
  return String(value).replace(/\d/g, d => PERSIAN_DIGITS[Number(d)]);
}

export type JalaliCell = {
  jy: number;
  jm: number;
  jd: number;
  // 0 == Saturday .. 6 == Friday.
  weekday: number;
  inMonth: boolean;
};

// Reads the local calendar date of an ISO string as a Jalali date.
export function jalaliOf(iso: string | Date): JalaaliDate {
  return toJalaali(iso instanceof Date ? iso : new Date(iso));
}

// Builds the 42-cell (6-week) grid for a Jalali month, starting on Saturday.
export function jalaliMonthGrid(jy: number, jm: number): JalaliCell[] {
  const first = toGregorian(jy, jm, 1);
  const firstDate = new Date(first.gy, first.gm - 1, first.gd);
  const firstWeekday = (firstDate.getDay() + 1) % 7;
  const cell: JalaliCell[] = [];
  for (let i = 0; i < 42; i += 1) {
    // i scans the 42 slots; slot `firstWeekday` is the 1st of the month, so
    // slot i is `firstWeekday - i` days before it (days before the 1st fall
    // into the previous Gregorian month, which Date normalizes).
    const d = new Date(firstDate.getFullYear(), firstDate.getMonth(), firstDate.getDate() + i - firstWeekday);
    const j = toJalaali(d);
    cell.push({
      jy: j.jy,
      jm: j.jm,
      jd: j.jd,
      weekday: (d.getDay() + 1) % 7,
      inMonth: j.jy === jy && j.jm === jm,
    });
  }
  return cell;
}

// A Jalali date + time of day, as an ISO UTC string (single storage format).
// Minute defaults to 0 so existing hour-only callers keep working.
export function jalaliToIso(
  jy: number,
  jm: number,
  jd: number,
  hour: number,
  minute = 0,
): string {
  return jalaaliToDateObject(jy, jm, jd, hour, minute).toISOString();
}

// Strict future check for an exact Jalali time: usable only when later than
// now. This is the single availability rule for the whole UI.
export function isJalaliTimeAvailable(
  jy: number,
  jm: number,
  jd: number,
  hour: number,
  minute: number,
  now: Date,
): boolean {
  return jalaaliToDateObject(jy, jm, jd, hour, minute).getTime() > now.getTime();
}

// Grid check: a day is selectable while it still has any future time, so
// today stays enabled until the last minute of the day.
export function isJalaliDayAvailable(jy: number, jm: number, jd: number, now: Date): boolean {
  return isJalaliTimeAvailable(jy, jm, jd, 23, 59, now);
}

function addJalaliDays(jy: number, jm: number, jd: number, days: number): JalaaliDate {
  const d = jalaaliToDateObject(jy, jm, jd);
  return toJalaali(new Date(d.getFullYear(), d.getMonth(), d.getDate() + days));
}

function addJalaliMonths(jy: number, jm: number, jd: number, count: number): JalaaliDate {
  const total = jy * 12 + (jm - 1) + count;
  const nextYear = Math.floor(total / 12);
  const nextMonth = (total % 12) + 1;
  return {
    jy: nextYear,
    jm: nextMonth,
    jd: Math.min(jd, jalaaliMonthLength(nextYear, nextMonth)),
  };
}

export type QuickKey = 'tomorrow' | 'week' | 'month' | 'year';

// Common future unlock points expressed in Jalali calendar arithmetic,
// all normalized to the given hour of the day. Purely calendar-aware:
// "1 month" adds one Jalali month (clamped), not a Gregorian 30 days.
export function quickUnlocks(
  now: Date,
  hour: number,
  minute = 0,
): Record<QuickKey, string> {
  const today = jalaliOf(now);
  const toIsoAt = (d: JalaaliDate) => jalaliToIso(d.jy, d.jm, d.jd, hour, minute);
  return {
    tomorrow: toIsoAt(addJalaliDays(today.jy, today.jm, today.jd, 1)),
    week: toIsoAt(addJalaliDays(today.jy, today.jm, today.jd, 7)),
    month: toIsoAt(addJalaliMonths(today.jy, today.jm, today.jd, 1)),
    year: toIsoAt(addJalaliMonths(today.jy, today.jm, today.jd, 12)),
  };
}

export function formatJalaliDate(iso: string | Date): string {
  const j = jalaliOf(iso);
  return `${toPersianDigits(j.jd)} ${JALALI_MONTH_NAMES[j.jm - 1]} ${toPersianDigits(j.jy)}`;
}

export function formatJalaliDateTime(iso: string | Date): string {
  const d = iso instanceof Date ? iso : new Date(iso);
  const j = jalaliOf(d);
  const weekday = WEEKDAY_NAMES[(d.getDay() + 1) % 7];
  const hour = d.getHours();
  const minute = d.getMinutes();
  return `${weekday} ${toPersianDigits(j.jd)} ${JALALI_MONTH_NAMES[j.jm - 1]} ${toPersianDigits(j.jy)}، ساعت ${toPersianDigits(hour)}:${toPersianDigits(String(minute).padStart(2, '0'))}`;
}
