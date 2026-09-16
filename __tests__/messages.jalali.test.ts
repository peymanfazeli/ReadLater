import {
  jalaliOf,
  jalaliMonthGrid,
  jalaliToIso,
  isJalaliDayAvailable,
  isJalaliTimeAvailable,
  quickUnlocks,
  formatJalaliDate,
  formatJalaliDateTime,
  toPersianDigits,
} from '../src/features/messages/domain/jalali';

const at = (y: number, m: number, d: number, h = 0, min = 0) =>
  new Date(y, m - 1, d, h, min);

describe('jalali conversions', () => {
  test('2025-03-21 is Farvardin 1 of 1404 (Nowruz)', () => {
    const j = jalaliOf(at(2025, 3, 21, 12));
    expect(j).toEqual({jy: 1404, jm: 1, jd: 1});
  });

  test('round-trips a long span of days', () => {
    for (let day = 0; day < 3000; day += 1) {
      const d = new Date(2024, 5, 21 + day);
      const iso = jalaliToIso(jalaliOf(d).jy, jalaliOf(d).jm, jalaliOf(d).jd, 0);
      const back = new Date(iso);
      expect([back.getFullYear(), back.getMonth(), back.getDate()]).toEqual([
        d.getFullYear(),
        d.getMonth(),
        d.getDate(),
      ]);
    }
  });

  test('jalaliToIso stores UTC but represents the local datetime', () => {
    const iso = jalaliToIso(1404, 1, 1, 9);
    const d = new Date(iso);
    expect(d.getHours()).toBe(9);
    expect(jalaliOf(iso)).toEqual({jy: 1404, jm: 1, jd: 1});
  });
});

describe('jalali month lengths (leap years)', () => {
  test('1394 Esfand has 29 days (common year)', () => {
    const j = jalaliOf(at(2015, 3, 21)); // Farvardin 1, 1394
    expect(j.jy).toBe(1394);
    expect(jalaliOf(at(2016, 3, 19)).jd).toBe(29); // last day of Esfand 1394
    expect(jalaliOf(at(2016, 3, 20))).toEqual({jy: 1395, jm: 1, jd: 1});
  });

  test('1403 Esfand has 30 days (leap year) and rolls into 1404', () => {
    expect(jalaliOf(at(2025, 3, 20))).toEqual({jy: 1403, jm: 12, jd: 30});
    expect(jalaliOf(at(2025, 3, 21))).toEqual({jy: 1404, jm: 1, jd: 1});
  });
});

describe('jalaliMonthGrid', () => {
  test('returns a 42-cell grid starting on Saturday', () => {
    const grid = jalaliMonthGrid(1404, 1);
    expect(grid).toHaveLength(42);
    expect(grid[0].weekday).toBe(0); // Saturday
  });

  test('2025-03-21 (Friday) lands at index 6, one row into the grid', () => {
    const grid = jalaliMonthGrid(1404, 1);
    const idx = grid.findIndex(c => c.inMonth && c.jd === 1 && c.jm === 1);
    expect(idx).toBe(6); // Shahrivar... Farvardin 1 = Friday → 6th cell (index 0 = Sat)
  });

  test('every cell maps to a distinct calendar day', () => {
    const grid = jalaliMonthGrid(1405, 6);
    const keys = grid.map(c => `${c.jy}-${c.jm}-${c.jd}`);
    expect(new Set(keys).size).toBe(grid.length);
  });
});

describe('quick unlock periods', () => {
  test('tomorrow and week shift by day; time stays at the chosen hour', () => {
    const now = at(2026, 9, 16, 15);
    const q = quickUnlocks(now, 9);
    expect(jalaliOf(q.tomorrow)).toEqual({jy: 1405, jm: 6, jd: 26});
    expect(new Date(q.tomorrow).getHours()).toBe(9);
    expect(jalaliOf(q.week)).toEqual({jy: 1405, jm: 7, jd: 1});
  });

  test('month adds one Jalali month clamped to its length', () => {
    const now = at(2025, 9, 22, 18); // 1404/06/31 (Shahrivar, 31 days)
    const q = quickUnlocks(now, 9);
    const month = jalaliOf(q.month);
    expect(month.jm).toBe(7); // Mehr
    expect(month.jd).toBe(30); // clamped from 31 → 30 (Mehr has 30)
  });

  test('year adds twelve Jalali months', () => {
    const now = at(2026, 9, 16, 10); // 1405/06/25
    const q = quickUnlocks(now, 9);
    expect(jalaliOf(q.year)).toEqual({jy: 1406, jm: 6, jd: 25});
  });
});

describe('day and time availability', () => {
  test('yesterday is unavailable; today and tomorrow stay selectable', () => {
    const now = at(2026, 9, 16, 8);
    const today = jalaliOf(now);
    expect(isJalaliDayAvailable(today.jy, today.jm, today.jd - 1, now)).toBe(
      false,
    );
    expect(isJalaliDayAvailable(today.jy, today.jm, today.jd, now)).toBe(true);
    expect(isJalaliDayAvailable(today.jy, today.jm, today.jd + 1, now)).toBe(
      true,
    );
  });

  test('a past time on today is unavailable; a future time is available', () => {
    const now = at(2026, 9, 16, 8, 30); // 08:30
    const today = jalaliOf(now);
    expect(isJalaliTimeAvailable(today.jy, today.jm, today.jd, 8, 29, now)).toBe(
      false,
    );
    expect(isJalaliTimeAvailable(today.jy, today.jm, today.jd, 8, 30, now)).toBe(
      false,
    );
    expect(isJalaliTimeAvailable(today.jy, today.jm, today.jd, 8, 31, now)).toBe(
      true,
    );
    expect(isJalaliTimeAvailable(today.jy, today.jm, today.jd, 23, 59, now)).toBe(
      true,
    );
  });

  test('day after a month boundary is available beyond Esfand', () => {
    const now = at(2026, 3, 20, 23); // 1404/12/29 (common year Esfand)
    const today = jalaliOf(now);
    expect(isJalaliDayAvailable(1405, 1, 1, now)).toBe(true);
    expect(today.jm).toBe(12);
  });

  test('jalaliToIso keeps the minute and round-trips', () => {
    const iso = jalaliToIso(1404, 1, 1, 9, 24);
    const d = new Date(iso);
    expect(d.getHours()).toBe(9);
    expect(d.getMinutes()).toBe(24);
    expect(jalaliOf(iso)).toEqual({jy: 1404, jm: 1, jd: 1});
  });
});

describe('persian formatting', () => {
  test('converts latin digits to Persian', () => {
    expect(toPersianDigits(1404)).toBe('۱۴۰۴');
    expect(toPersianDigits('1230')).toBe('۱۲۳۰');
  });

  test('formats a Jalali date with month and persisted digits', () => {
    expect(formatJalaliDate(at(2025, 3, 21, 12).toISOString())).toBe(
      '۱ فروردین ۱۴۰۴',
    );
  });

  test('formats a full date-time with weekday and hour', () => {
    const iso = jalaliToIso(1404, 1, 1, 9);
    const out = formatJalaliDateTime(iso);
    expect(out).toContain('ساعت ۹:۰۰');
    expect(out).toContain('۱ فروردین ۱۴۰۴');
  });
});
