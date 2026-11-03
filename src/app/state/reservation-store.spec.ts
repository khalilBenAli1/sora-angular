import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CLOCK, LOCAL_STORAGE, ReservationStore } from './reservation-store';
import { availableSeatings } from '../domain/reservations';
import { STORAGE_KEY, type StorageAdapter } from '../adapters/reservation-storage';
describe('shared reservation state', () => {
  let storage: StorageAdapter;
  beforeEach(() => {
    const values = new Map<string, string>();
    storage = {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => {
        values.set(key, value);
      },
      removeItem: (key) => {
        values.delete(key);
      },
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: CLOCK, useValue: () => new Date(2026, 10, 3, 12) },
        { provide: LOCAL_STORAGE, useValue: storage },
      ],
    });
  });
  it('creates, reloads and cancels a local reservation with derived counts', () => {
    const store = TestBed.inject(ReservationStore);
    const created = store.book({ date: '2026-11-04', party: 6, time: '19:00' });
    expect(created.ok).toBe(true);
    if (!created.ok) throw new Error('Expected successful reservation');
    expect(store.confirmed()).toHaveLength(4);
    expect(store.covers()).toBe(14);
    expect(created.reservation.guest).toBe('Sora guest 5');
    expect(JSON.parse(storage.getItem(STORAGE_KEY) ?? '{}').reservations).toHaveLength(5);
    expect(
      availableSeatings('2026-11-04', 6, store.reservations()).find((slot) => slot.time === '19:00')
        ?.available,
    ).toBe(false);
    expect(store.cancel(created.reservation.id)).toBe(true);
    expect(store.confirmed()).toHaveLength(3);
    expect(store.covers()).toBe(8);
    expect(store.cancelledCount()).toBe(2);
    expect(
      availableSeatings('2026-11-04', 6, store.reservations()).find((slot) => slot.time === '19:00')
        ?.available,
    ).toBe(true);
    expect(store.cancel(created.reservation.id)).toBe(false);
  });
  it('excludes the current reservation while editing and validates the replacement seating', () => {
    const store = TestBed.inject(ReservationStore);
    expect(store.book({ date: '2026-11-04', party: 6, time: '19:00' }).ok).toBe(true);
    expect(store.edit('SR-DEMO01', { date: '2026-11-04', party: 6, time: '19:00' }).ok).toBe(true);
    expect(store.covers()).toBe(18);
    expect(store.edit('SR-DEMO02', { date: '2026-11-04', party: 1, time: '19:00' }).ok).toBe(false);
    expect(store.edit('SR-DEMO04', { date: '2026-11-04', party: 2, time: '18:00' }).ok).toBe(false);
    expect(store.edit('missing', { date: '2026-11-04', party: 2, time: '18:00' }).ok).toBe(false);
  });
  it('rejects invalid date/party/slot and resets to deterministic sample records', () => {
    const store = TestBed.inject(ReservationStore);
    expect(store.book({ date: '2026-11-02', party: 2, time: '19:00' }).ok).toBe(false);
    expect(store.book({ date: '2026-11-04', party: 1.5, time: '19:00' }).ok).toBe(false);
    expect(store.book({ date: '2026-11-17', party: 2, time: '19:00' }).ok).toBe(false);
    store.cancel('SR-DEMO01');
    store.reset();
    expect(store.confirmed()).toHaveLength(3);
    expect(store.covers()).toBe(8);
  });
});
