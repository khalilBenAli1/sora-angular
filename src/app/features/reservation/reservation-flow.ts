import { DestroyRef, Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { FormControl, FormGroup, Validators, type ValidatorFn } from '@angular/forms';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { map, merge, type Subscription } from 'rxjs';
import {
  addDays,
  dateError,
  localToday,
  nextOpenDay,
  partyError,
  type Reservation,
} from '../../domain/reservations';
import { emailError, nameError, validateContact } from '../../domain/contact';
import { AvailabilityService, type Availability } from '../../services/availability';
import { CLOCK, ReservationStore } from '../../state/reservation-store';
export type AvailabilityState =
  | { status: 'idle' | 'loading' | 'error'; message: string; slots: Availability['slots'] }
  | ({ status: 'ready' } & Availability);
export interface ConfirmedReservation {
  reservation: Reservation;
  firstName: string;
}
function messageValidator(rule: (value: string) => string | null): ValidatorFn {
  return (control) => {
    const error = rule(String(control.value ?? ''));
    return error ? { message: error } : null;
  };
}
@Injectable()
export class ReservationFlow {
  private readonly destroyRef = inject(DestroyRef);
  private readonly availabilityService = inject(AvailabilityService);
  readonly store = inject(ReservationStore);
  private readonly clock = inject(CLOCK);
  readonly today = localToday(this.clock);
  readonly horizon = addDays(this.today, 180);
  readonly step = signal(0);
  readonly choiceSubmitted = signal(false);
  readonly contactSubmitted = signal(false);
  readonly notice = signal('');
  readonly confirmed = signal<ConfirmedReservation | null>(null);
  readonly form = new FormGroup({
    date: new FormControl(nextOpenDay(addDays(this.today, 1)), {
      nonNullable: true,
      validators: [messageValidator((value) => dateError(value, this.today))],
    }),
    party: new FormControl(2, {
      nonNullable: true,
      validators: [(control) => (partyError(Number(control.value)) ? { party: true } : null)],
    }),
    time: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });
  readonly contactForm = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [messageValidator(nameError)] }),
    email: new FormControl('', { nonNullable: true, validators: [messageValidator(emailError)] }),
    consent: new FormControl(false, { nonNullable: true, validators: [Validators.requiredTrue] }),
  });
  readonly choice = toSignal(this.form.valueChanges.pipe(map(() => this.form.getRawValue())), {
    initialValue: this.form.getRawValue(),
  });
  readonly contact = toSignal(
    this.contactForm.valueChanges.pipe(map(() => this.contactForm.getRawValue())),
    { initialValue: this.contactForm.getRawValue() },
  );
  readonly contactErrors = computed(() =>
    this.contactSubmitted() ? validateContact(this.contact()) : {},
  );
  readonly availability = signal<AvailabilityState>({ status: 'idle', slots: [], message: '' });
  readonly hasTimes = computed(() => this.availability().slots.some((slot) => slot.available));
  readonly dateError = computed(() =>
    this.choiceSubmitted() ? (dateError(this.choice().date, this.today) ?? undefined) : undefined,
  );
  readonly timeError = computed(() =>
    this.choiceSubmitted() && !this.choice().time
      ? 'Choose an available time for your evening.'
      : undefined,
  );
  private request?: Subscription;
  constructor() {
    merge(this.form.controls.date.valueChanges, this.form.controls.party.valueChanges)
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.notice.set('');
        this.load();
      });
    effect(() => {
      this.store.reservations();
      if (this.step() === 0) untracked(() => this.load());
    });
    this.destroyRef.onDestroy(() => this.request?.unsubscribe());
  }
  load(retry = false) {
    this.request?.unsubscribe();
    this.form.controls.time.setValue('');
    const { date, party } = this.form.getRawValue();
    if (dateError(date, this.today) || !Number.isInteger(party) || party < 1 || party > 6) {
      this.availability.set({
        status: 'idle',
        slots: [],
        message: 'Choose a valid date and party size.',
      });
      return;
    }
    this.availability.set({ status: 'loading', slots: [], message: 'Finding a place for you…' });
    this.request = this.availabilityService
      .check(date, party, this.store.reservations(), retry)
      .subscribe({
        next: (result) => this.availability.set({ status: 'ready', ...result }),
        error: () =>
          this.availability.set({
            status: 'error',
            slots: [],
            message: 'We couldn’t check this evening. Please try again.',
          }),
      });
  }
  chooseTime(time: string) {
    if (
      this.availability().status === 'ready' &&
      this.availability().slots.some((slot) => slot.time === time && slot.available)
    )
      this.form.controls.time.setValue(time);
  }
  toDetails(): boolean {
    this.choiceSubmitted.set(true);
    if (this.form.invalid || this.availability().status !== 'ready') return false;
    this.notice.set('');
    this.step.set(1);
    return true;
  }
  toReview(): boolean {
    this.contactSubmitted.set(true);
    if (this.contactForm.invalid) return false;
    this.step.set(2);
    return true;
  }
  complete() {
    if (this.contactForm.invalid) {
      this.contactSubmitted.set(true);
      this.step.set(1);
      return;
    }
    const result = this.store.book(this.form.getRawValue());
    if (!result.ok) {
      this.step.set(0);
      this.notice.set(result.error);
      return;
    }
    this.confirmed.set({
      reservation: { ...result.reservation },
      firstName: this.contact().name.trim().split(/\s+/)[0] ?? 'Guest',
    });
    this.contactForm.reset({ name: '', email: '', consent: false });
  }
  sampleDetails() {
    this.contactForm.setValue({ name: 'Alex Morgan', email: 'alex@example.com', consent: false });
    this.contactSubmitted.set(false);
  }
  restart() {
    this.confirmed.set(null);
    this.contactForm.reset({ name: '', email: '', consent: false });
    this.contactSubmitted.set(false);
    this.choiceSubmitted.set(false);
    this.form.reset({ date: nextOpenDay(addDays(this.today, 1)), party: 2, time: '' });
    this.step.set(0);
  }
}
