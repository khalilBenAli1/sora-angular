import { computed, inject, Injectable, InjectionToken, signal } from '@angular/core';
import {
  browserStorage,
  readReservations,
  writeReservations,
  type StorageAdapter,
} from '../adapters/reservation-storage';
import {
  choiceError,
  localToday,
  seedReservations,
  type ActionResult,
  type Reservation,
  type ReservationChoice,
} from '../domain/reservations';
export const CLOCK = new InjectionToken<() => Date>('Sora clock', {
  providedIn: 'root',
  factory: () => () => new Date(),
});
export const LOCAL_STORAGE = new InjectionToken<StorageAdapter | null>('Sora local storage', {
  providedIn: 'root',
  factory: browserStorage,
});
@Injectable({ providedIn: 'root' })
export class ReservationStore {
  private readonly clock = inject(CLOCK);
  private readonly storage = inject(LOCAL_STORAGE);
  private readonly records = signal<Reservation[]>(
    readReservations(this.storage) ?? seedReservations(localToday(this.clock)),
  );
  readonly reservations = this.records.asReadonly();
  readonly storageAvailable = signal(this.storage !== null);
  readonly confirmed = computed(() => this.records().filter((item) => item.status === 'confirmed'));
  readonly covers = computed(() => this.confirmed().reduce((total, item) => total + item.party, 0));
  readonly cancelledCount = computed(
    () => this.records().filter((item) => item.status === 'cancelled').length,
  );
  private save(records: Reservation[]) {
    this.storageAvailable.set(writeReservations(this.storage, records));
    this.records.set(records);
  }
  book(choice: ReservationChoice): ActionResult {
    const error = choiceError(choice, this.records(), localToday(this.clock));
    if (error) return { ok: false, error };
    if (this.records().length >= 200)
      return { ok: false, error: 'This local demo is full. Reset the demo desk to begin again.' };
    const reservation: Reservation = {
      ...choice,
      id: `SR-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      guest: `Sora guest ${this.records().length + 1}`,
      status: 'confirmed',
    };
    this.save([...this.records(), reservation]);
    return { ok: true, reservation };
  }
  edit(id: string, choice: ReservationChoice): ActionResult {
    const current = this.records().find((item) => item.id === id);
    if (!current || current.status !== 'confirmed')
      return { ok: false, error: 'This reservation can no longer be changed.' };
    const error = choiceError(choice, this.records(), localToday(this.clock), id);
    if (error) return { ok: false, error };
    const reservation = { ...current, ...choice };
    this.save(this.records().map((item) => (item.id === id ? reservation : item)));
    return { ok: true, reservation };
  }
  cancel(id: string): boolean {
    if (!this.records().some((item) => item.id === id && item.status === 'confirmed')) return false;
    this.save(
      this.records().map((item) => (item.id === id ? { ...item, status: 'cancelled' } : item)),
    );
    return true;
  }
  reset() {
    this.save(seedReservations(localToday(this.clock)));
  }
}
