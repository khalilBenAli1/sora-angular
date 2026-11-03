export type ReservationStatus = 'confirmed' | 'cancelled';
export interface ReservationChoice {
  date: string;
  party: number;
  time: string;
}
export interface Reservation extends ReservationChoice {
  id: string;
  /** Synthetic display name; contact details are never persisted. */
  guest: string;
  status: ReservationStatus;
}
export interface Seating {
  time: string;
  remaining: number;
  available: boolean;
}
export type ActionResult = { ok: true; reservation: Reservation } | { ok: false; error: string };
export const SEATINGS = ['18:00', '18:30', '19:00', '19:30', '20:00', '20:30'] as const;
export const SEATING_CAPACITY = 12;
const DAY = 86_400_000;

export function isDateOnly(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
function timestamp(value: string): number {
  if (!isDateOnly(value)) throw new RangeError('Expected a YYYY-MM-DD calendar date.');
  return Date.parse(`${value}T00:00:00Z`);
}
export function localToday(clock: () => Date = () => new Date()): string {
  const date = clock();
  if (!Number.isFinite(date.getTime())) throw new RangeError('Invalid clock.');
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function addDays(value: string, offset: number): string {
  if (!Number.isInteger(offset)) throw new RangeError('Expected integer days.');
  const result = new Date(timestamp(value) + offset * DAY).toISOString().slice(0, 10);
  if (!isDateOnly(result)) throw new RangeError('Date outside supported range.');
  return result;
}
export function addMonths(value: string, offset: number): string {
  if (!Number.isInteger(offset)) throw new RangeError('Expected integer months.');
  const date = new Date(timestamp(value));
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + offset);
  return date.toISOString().slice(0, 10);
}
export function monthDays(value: string): string[] {
  const first = `${value.slice(0, 7)}-01`;
  const mondayOffset = (new Date(timestamp(first)).getUTCDay() + 6) % 7;
  return Array.from({ length: 42 }, (_, index) => addDays(first, index - mondayOffset));
}
export function formatDate(value: string, options: Intl.DateTimeFormatOptions = {}): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    ...options,
    timeZone: 'UTC',
  }).format(timestamp(value));
}
export function closedMonday(value: string): boolean {
  return new Date(timestamp(value)).getUTCDay() === 1;
}
export function dateError(value: string, earliest: string): string | null {
  if (!isDateOnly(value)) return 'Choose a date for your evening.';
  if (value < earliest) return 'Choose today or a future date.';
  if (value > addDays(earliest, 180)) return 'Choose a date within the next 180 days.';
  return null;
}
export function partyError(party: number): string | null {
  return Number.isInteger(party) && party >= 1 && party <= 6
    ? null
    : 'Choose between 1 and 6 guests.';
}
export function availableSeatings(
  date: string,
  party: number,
  reservations: readonly Reservation[],
  excludeId = '',
): Seating[] {
  if (!isDateOnly(date) || partyError(party) || closedMonday(date)) return [];
  return SEATINGS.map((time) => {
    const occupied = reservations
      .filter(
        (item) =>
          item.id !== excludeId &&
          item.status === 'confirmed' &&
          item.date === date &&
          item.time === time,
      )
      .reduce((total, item) => total + item.party, 0);
    const remaining = date.endsWith('-17') ? 0 : Math.max(0, SEATING_CAPACITY - occupied);
    return { time, remaining, available: remaining >= party };
  });
}
export function choiceError(
  choice: ReservationChoice,
  reservations: readonly Reservation[],
  earliest: string,
  excludeId = '',
): string | null {
  const error = dateError(choice.date, earliest) ?? partyError(choice.party);
  if (error) return error;
  if (!SEATINGS.some((time) => time === choice.time)) return 'Choose an available time.';
  return availableSeatings(choice.date, choice.party, reservations, excludeId).some(
    (slot) => slot.time === choice.time && slot.available,
  )
    ? null
    : 'That seating is no longer available. Please choose another time.';
}
export function nextOpenDay(start: string): string {
  let result = start;
  while (closedMonday(result) || result.endsWith('-17')) result = addDays(result, 1);
  return result;
}
export function seedReservations(earliest: string): Reservation[] {
  const first = nextOpenDay(addDays(earliest, 1));
  const second = nextOpenDay(addDays(first, 1));
  return [
    {
      id: 'SR-DEMO01',
      guest: 'Alex Morgan',
      date: first,
      time: '19:00',
      party: 2,
      status: 'confirmed',
    },
    {
      id: 'SR-DEMO02',
      guest: 'Sam Taylor',
      date: first,
      time: '19:30',
      party: 4,
      status: 'confirmed',
    },
    {
      id: 'SR-DEMO03',
      guest: 'Jamie Lee',
      date: second,
      time: '18:30',
      party: 2,
      status: 'confirmed',
    },
    {
      id: 'SR-DEMO04',
      guest: 'Riley Parker',
      date: first,
      time: '20:00',
      party: 3,
      status: 'cancelled',
    },
  ];
}
