import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { map } from 'rxjs';
import {
  addDays,
  availableSeatings,
  dateError,
  localToday,
  partyError,
  type Reservation,
} from '../../domain/reservations';
import { CLOCK, ReservationStore } from '../../state/reservation-store';
import { Field } from '../../shared/field';
import { Modal } from '../../shared/modal';
@Component({
  selector: 'app-reservation-editor',
  imports: [ReactiveFormsModule, Field, Modal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ` <app-modal
    [open]="reservation() !== null"
    title="A little change of plan"
    (closed)="closed.emit()"
    ><p class="editor-reference">{{ reservation()?.id }} · {{ reservation()?.guest }}</p>
    <form [formGroup]="form" (ngSubmit)="save()" novalidate>
      <div class="editor-fields">
        <app-field
          controlId="edit-date"
          label="Evening"
          [error]="submitted() ? (dateError() ?? undefined) : undefined"
          ><input
            type="date"
            id="edit-date"
            formControlName="date"
            [min]="today"
            [max]="horizon"
            [attr.aria-invalid]="submitted() && !!dateError()"
            [attr.aria-describedby]="
              submitted() && dateError() ? 'edit-date-error' : null
            " /></app-field
        ><app-field controlId="edit-party" label="Guests"
          ><select id="edit-party" formControlName="party">
            @for (party of parties; track party) {
              <option [ngValue]="party">{{ party }} {{ party === 1 ? 'guest' : 'guests' }}</option>
            }
          </select></app-field
        >
      </div>
      <app-field controlId="edit-time" label="Seating"
        ><select id="edit-time" formControlName="time">
          <option value="">Choose an available time</option>
          @for (slot of slots(); track slot.time) {
            <option [value]="slot.time" [disabled]="!slot.available">
              {{ slot.time }} · {{ slot.available ? slot.remaining + ' places' : 'Full' }}
            </option>
          }
        </select></app-field
      >
      @if (notice()) {
        <p class="field-error" role="alert">{{ notice() }}</p>
      }
      <p class="privacy-note">
        Only date, guests and time change. The guest label is synthetic; no message is sent.
      </p>
      <div class="modal-actions">
        <button type="button" class="text-link" (click)="closed.emit()">Keep current choices</button
        ><button type="submit" class="button">Save changes ↗</button>
      </div>
    </form></app-modal
  >`,
})
export class ReservationEditor {
  readonly reservation = input<Reservation | null>(null);
  readonly closed = output<void>();
  readonly saved = output<Reservation>();
  private readonly store = inject(ReservationStore);
  private readonly clock = inject(CLOCK);
  readonly today = localToday(this.clock);
  readonly horizon = addDays(this.today, 180);
  readonly parties = [1, 2, 3, 4, 5, 6];
  readonly submitted = signal(false);
  readonly notice = signal('');
  readonly form = new FormGroup({
    date: new FormControl('', { nonNullable: true }),
    party: new FormControl(2, { nonNullable: true }),
    time: new FormControl('', { nonNullable: true }),
  });
  private readonly choice = toSignal(
    this.form.valueChanges.pipe(map(() => this.form.getRawValue())),
    { initialValue: this.form.getRawValue() },
  );
  readonly dateError = computed(() => dateError(this.choice().date, this.today));
  readonly slots = computed(() =>
    availableSeatings(
      this.choice().date,
      this.choice().party,
      this.store.reservations(),
      this.reservation()?.id,
    ),
  );
  constructor() {
    effect(() => {
      const reservation = this.reservation();
      if (reservation)
        untracked(() => {
          this.form.reset({
            date: reservation.date,
            party: reservation.party,
            time: reservation.time,
          });
          this.submitted.set(false);
          this.notice.set('');
        });
    });
  }
  save() {
    this.submitted.set(true);
    const reservation = this.reservation();
    if (!reservation) return;
    const value = this.form.getRawValue();
    const error = dateError(value.date, this.today) ?? partyError(value.party);
    if (error) {
      this.notice.set(error);
      return;
    }
    const result = this.store.edit(reservation.id, value);
    if (!result.ok) {
      this.notice.set(result.error);
      return;
    }
    this.saved.emit(result.reservation);
  }
}
