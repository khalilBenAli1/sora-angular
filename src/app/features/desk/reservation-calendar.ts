import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import {
  addMonths,
  formatDate,
  isDateOnly,
  localToday,
  monthDays,
  type Reservation,
} from '../../domain/reservations';
import { dayCounts } from '../../domain/desk';
@Component({
  selector: 'app-reservation-calendar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ` <div class="desk-calendar-navigation">
      <button type="button" class="icon-button" aria-label="Previous month" (click)="move(-1)">
        ‹
      </button>
      <h2 aria-live="polite">{{ label() }}</h2>
      <button type="button" class="icon-button" aria-label="Next month" (click)="move(1)">›</button>
    </div>
    <div class="desk-calendar-weekdays" aria-hidden="true">
      @for (day of weekdays; track day) {
        <span>{{ day }}</span>
      }
    </div>
    <div class="desk-calendar-days">
      @for (day of days(); track day) {
        <button
          type="button"
          [class.outside]="day.slice(0, 7) !== month().slice(0, 7)"
          [class.chosen]="day === selected()"
          [attr.aria-pressed]="day === selected()"
          [attr.aria-label]="dayLabel(day)"
          (click)="chosen.emit(day)"
        >
          <strong>{{ +day.slice(-2) }}</strong>
          @if (counts()[day]; as count) {
            <span class="calendar-count"
              >{{ count.reservations }}
              {{ count.reservations === 1 ? 'reservation' : 'reservations' }}</span
            ><small>{{ count.covers }} guests</small>
          }
        </button>
      }
    </div>
    <p class="calendar-desk-hint">
      Choose a day to see and manage its reservations. Cancelled records are retained in the
      history.
    </p>`,
})
export class ReservationCalendar {
  readonly records = input.required<readonly Reservation[]>();
  readonly selected = input('');
  readonly chosen = output<string>();
  readonly month = signal(`${localToday().slice(0, 7)}-01`);
  readonly weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  readonly counts = computed(() => dayCounts(this.records()));
  readonly days = computed(() => monthDays(this.month()));
  readonly label = computed(() =>
    formatDate(this.month(), { day: undefined, month: 'long', year: 'numeric' }),
  );
  constructor() {
    effect(() => {
      const day = this.selected();
      if (isDateOnly(day)) this.month.set(`${day.slice(0, 7)}-01`);
    });
  }
  move(offset: number) {
    this.month.update((month) => addMonths(month, offset));
  }
  dayLabel(day: string) {
    const count = this.counts()[day];
    return `${formatDate(day, { weekday: 'long', year: 'numeric' })}, ${count?.reservations ?? 0} reservations`;
  }
}
