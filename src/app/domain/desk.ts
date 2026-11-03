import type { Reservation, ReservationStatus } from './reservations';
export interface DeskFilters {
  query: string;
  date: string;
  status: ReservationStatus | 'all';
}
export function filterReservations(
  records: readonly Reservation[],
  filters: DeskFilters,
): Reservation[] {
  const query = filters.query.trim().toLocaleLowerCase('en-GB');
  return records
    .filter(
      (item) =>
        (!query || `${item.guest} ${item.id}`.toLocaleLowerCase('en-GB').includes(query)) &&
        (!filters.date || item.date === filters.date) &&
        (filters.status === 'all' || item.status === filters.status),
    )
    .sort((a, b) => `${a.date}${a.time}${a.id}`.localeCompare(`${b.date}${b.time}${b.id}`));
}
export function dayCounts(
  records: readonly Reservation[],
): Record<string, { reservations: number; covers: number }> {
  const result: Record<string, { reservations: number; covers: number }> = {};
  for (const item of records) {
    const value = result[item.date] ?? { reservations: 0, covers: 0 };
    result[item.date] = {
      reservations: value.reservations + 1,
      covers: value.covers + (item.status === 'confirmed' ? item.party : 0),
    };
  }
  return result;
}
