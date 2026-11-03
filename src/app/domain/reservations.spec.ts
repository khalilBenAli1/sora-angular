import { describe, expect, it } from 'vitest';
import {
  addDays,
  addMonths,
  availableSeatings,
  choiceError,
  closedMonday,
  dateError,
  isDateOnly,
  localToday,
  monthDays,
  partyError,
  seedReservations,
} from './reservations';
import {
  readReservations,
  STORAGE_KEY,
  writeReservations,
  type StorageAdapter,
} from '../adapters/reservation-storage';
describe('local calendar and reservation rules', () => {
  it('uses local calendar dates and UTC arithmetic across leap years and DST', () => {
    expect(localToday(() => new Date(2028, 1, 29, 23, 59))).toBe('2028-02-29');
    expect(addDays('2028-02-28', 2)).toBe('2028-03-01');
    expect(addDays('2028-03-25', 2)).toBe('2028-03-27');
    expect(addDays('2028-10-28', 2)).toBe('2028-10-30');
    expect(addMonths('2028-12-31', 1)).toBe('2029-01-01');
  });
  it.each(['2027-02-29', '2028-13-01', '', '2028-2-1', '2028-02-30'])(
    'rejects impossible dates %s',
    (value) => expect(isDateOnly(value)).toBe(false),
  );
  it('makes a complete Monday-first calendar and a bounded booking horizon', () => {
    const days = monthDays('2026-11-03');
    expect(days).toHaveLength(42);
    expect(days[0]).toBe('2026-10-26');
    expect(days).toContain('2026-11-30');
    expect(dateError('2026-11-02', '2026-11-03')).toBeTruthy();
    expect(dateError(addDays('2026-11-03', 180), '2026-11-03')).toBeNull();
    expect(dateError(addDays('2026-11-03', 181), '2026-11-03')).toBeTruthy();
  });
  it.each([0, 7, 1.5, Number.NaN])('rejects invalid party size %s', (party) =>
    expect(partyError(party)).toBeTruthy(),
  );
  it('reserves capacity, excludes an edited record and frees cancelled covers', () => {
    const records = seedReservations('2026-11-03');
    expect(
      availableSeatings('2026-11-04', 6, records).find((item) => item.time === '19:00')?.remaining,
    ).toBe(10);
    expect(
      availableSeatings('2026-11-04', 6, records, 'SR-DEMO01').find((item) => item.time === '19:00')
        ?.remaining,
    ).toBe(12);
    expect(
      availableSeatings('2026-11-04', 6, records).find((item) => item.time === '20:00')?.remaining,
    ).toBe(12);
    const full = [
      ...records,
      { ...records[0]!, id: 'SR-EXTRA1', party: 6 },
      { ...records[0]!, id: 'SR-EXTRA2', party: 4 },
    ];
    expect(
      choiceError({ date: '2026-11-04', party: 1, time: '19:00' }, full, '2026-11-03'),
    ).toContain('no longer available');
    full[0] = { ...full[0]!, status: 'cancelled' };
    expect(
      choiceError({ date: '2026-11-04', party: 2, time: '19:00' }, full, '2026-11-03'),
    ).toBeNull();
  });
  it('has closed Mondays and a deterministic fully booked example', () => {
    expect(closedMonday('2026-11-09')).toBe(true);
    expect(availableSeatings('2026-11-09', 2, [])).toEqual([]);
    expect(availableSeatings('2026-11-17', 2, []).every((item) => !item.available)).toBe(true);
    expect(
      choiceError({ date: '2026-11-04', party: 2, time: '23:00' }, [], '2026-11-03'),
    ).toContain('available time');
  });
});
describe('validated, contact-free local persistence', () => {
  function memory(raw: string | null = null): StorageAdapter {
    let value = raw;
    return {
      getItem: () => value,
      setItem: (_key, next) => {
        value = next;
      },
      removeItem: () => {
        value = null;
      },
    };
  }
  it('round-trips a record while dropping unexpected contact fields', () => {
    const storage = memory();
    const records = seedReservations('2026-11-03').map((item) => ({
      ...item,
      email: 'private@example.test',
    }));
    expect(writeReservations(storage, records)).toBe(true);
    expect(readReservations(storage)).toEqual(seedReservations('2026-11-03'));
    expect(storage.getItem(STORAGE_KEY)).not.toContain('email');
  });
  it.each([
    '{bad',
    'null',
    '[]',
    '{"version":2}',
    '{"version":1,"reservations":[{"date":"2026-02-30"}]}',
  ])('recovers corrupted data %s', (raw) => expect(readReservations(memory(raw))).toBeNull());
  it('rejects duplicate IDs, oversized data and non-synthetic stored guest names', () => {
    const first = seedReservations('2026-11-03')[0]!;
    expect(
      readReservations(memory(JSON.stringify({ version: 1, reservations: [first, first] }))),
    ).toBeNull();
    expect(readReservations(memory('x'.repeat(100001)))).toBeNull();
    expect(writeReservations(memory(), [{ ...first, guest: 'Actual customer' }])).toBe(false);
  });
  it('remains usable when local storage is unavailable or denied', () => {
    const denied: StorageAdapter = {
      getItem() {
        throw new Error('Denied');
      },
      setItem() {
        throw new Error('Quota');
      },
      removeItem() {
        throw new Error('Denied');
      },
    };
    expect(readReservations(null)).toBeNull();
    expect(readReservations(denied)).toBeNull();
    expect(writeReservations(denied, [])).toBe(false);
  });
});
