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
  addDays,
  addMonths,
  closedMonday,
  dateError,
  formatDate,
  isDateOnly,
  localToday,
  monthDays,
} from '../domain/reservations';
@Component({
  selector: 'app-calendar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ` <div class="calendar">
    <div class="calendar-navigation">
      <button
        type="button"
        class="icon-button"
        aria-label="Previous month"
        [disabled]="month() <= earliest().slice(0, 7) + '-01'"
        (click)="move(-1)"
      >
        ‹
      </button>
      <p aria-live="polite">{{ monthLabel() }}</p>
      <button
        type="button"
        class="icon-button"
        aria-label="Next month"
        [disabled]="month().slice(0, 7) >= horizon().slice(0, 7)"
        (click)="move(1)"
      >
        ›
      </button>
    </div>
    <div class="calendar-weekdays" aria-hidden="true">
      @for (day of weekdays; track $index) {
        <span>{{ day }}</span>
      }
    </div>
    <div class="calendar-days">
      @for (day of days(); track day) {
        <button
          type="button"
          [class.outside]="day.slice(0, 7) !== month().slice(0, 7)"
          [class.selected]="day === date()"
          [class.resting]="isClosed(day)"
          [disabled]="day.slice(0, 7) !== month().slice(0, 7) || invalid(day)"
          [attr.aria-hidden]="day.slice(0, 7) !== month().slice(0, 7) ? true : null"
          [attr.aria-pressed]="day === date()"
          [attr.aria-label]="label(day)"
          (click)="chosen.emit(day)"
        >
          {{ +day.slice(-2) }}
        </button>
      }
    </div>
    <p class="calendar-hint">Evenings Tuesday–Sunday. Mondays, we rest.</p>
  </div>`,
})
export class Calendar {
  readonly date = input.required<string>();
  readonly earliest = input.required<string>();
  readonly chosen = output<string>();
  readonly month = signal(`${localToday().slice(0, 7)}-01`);
  readonly weekdays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  readonly days = computed(() => monthDays(this.month()));
  readonly horizon = computed(() => addDays(this.earliest(), 180));
  readonly monthLabel = computed(() =>
    formatDate(this.month(), { day: undefined, month: 'long', year: 'numeric' }),
  );
  constructor() {
    effect(() => {
      const date = this.date();
      this.month.set(
        `${(isDateOnly(date) && date >= this.earliest() ? date : this.earliest()).slice(0, 7)}-01`,
      );
    });
  }
  move(offset: number) {
    this.month.update((value) => addMonths(value, offset));
  }
  invalid(day: string) {
    return dateError(day, this.earliest()) !== null;
  }
  isClosed = closedMonday;
  label(day: string) {
    return `${formatDate(day, { weekday: 'long', year: 'numeric' })}${day === this.date() ? ', selected' : ''}${closedMonday(day) ? ', kitchen closed' : ''}`;
  }
}
