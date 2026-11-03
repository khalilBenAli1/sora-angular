import { describe, expect, it } from 'vitest';
import { dayCounts, filterReservations } from './desk';
import { seedReservations } from './reservations';
describe('derived desk views', () => {
  const records = seedReservations('2026-11-03');
  it('combines guest/reference search, date and status without mutating records', () => {
    const original = records.map((item) => item.id);
    expect(
      filterReservations(records, {
        query: '  ALEX ',
        date: '2026-11-04',
        status: 'confirmed',
      }).map((item) => item.id),
    ).toEqual(['SR-DEMO01']);
    expect(
      filterReservations(records, { query: 'demo04', date: '', status: 'all' }).map(
        (item) => item.guest,
      ),
    ).toEqual(['Riley Parker']);
    expect(records.map((item) => item.id)).toEqual(original);
  });
  it('returns an intentional empty view for a contradictory filter', () => {
    expect(
      filterReservations(records, { query: 'Jamie', date: '2026-11-04', status: 'confirmed' }),
    ).toEqual([]);
  });
  it('derives calendar records and confirmed covers separately', () => {
    expect(dayCounts(records)['2026-11-04']).toEqual({ reservations: 3, covers: 6 });
    expect(dayCounts(records)['2026-11-05']).toEqual({ reservations: 1, covers: 2 });
    expect(dayCounts([])).toEqual({});
  });
});
