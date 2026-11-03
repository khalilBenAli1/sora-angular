import { isDateOnly, partyError, SEATINGS, type Reservation } from '../domain/reservations';
export const STORAGE_KEY = 'sora:reservations:v1';
export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
export function browserStorage(): StorageAdapter | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}
function decodeReservation(value: unknown): Reservation | null {
  if (!record(value)) return null;
  const { id, date, time, party, status, guest } = value;
  if (
    typeof id !== 'string' ||
    !/^SR-[A-Z0-9-]{4,40}$/.test(id) ||
    typeof date !== 'string' ||
    !isDateOnly(date) ||
    typeof time !== 'string' ||
    !SEATINGS.some((slot) => slot === time) ||
    typeof party !== 'number' ||
    partyError(party) ||
    (status !== 'confirmed' && status !== 'cancelled') ||
    typeof guest !== 'string' ||
    !/^(Alex Morgan|Sam Taylor|Jamie Lee|Riley Parker|Sora guest \d{1,5})$/.test(guest)
  )
    return null;
  return { id, date, time, party, status, guest };
}
export function readReservations(storage: StorageAdapter | null): Reservation[] | null {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (!raw || raw.length > 100_000) return null;
    const value: unknown = JSON.parse(raw);
    if (
      !record(value) ||
      value['version'] !== 1 ||
      !Array.isArray(value['reservations']) ||
      value['reservations'].length > 200
    )
      return null;
    const decoded = value['reservations'].map(decodeReservation);
    if (decoded.some((item) => !item)) return null;
    const reservations = decoded.filter((item): item is Reservation => item !== null);
    return new Set(reservations.map((item) => item.id)).size === reservations.length
      ? reservations
      : null;
  } catch {
    return null;
  }
}
export function writeReservations(
  storage: StorageAdapter | null,
  reservations: readonly Reservation[],
): boolean {
  if (!storage || reservations.length > 200) return false;
  const clean = reservations.map(decodeReservation);
  if (clean.some((item) => !item)) return false;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, reservations: clean }));
    return true;
  } catch {
    return false;
  }
}
