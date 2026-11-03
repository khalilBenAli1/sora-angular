import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { formatDate, type Reservation } from '../../domain/reservations';
@Component({
  selector: 'app-reservation-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ` <div class="desk-list-heading" aria-hidden="true">
      <span>Guest / Reference</span><span>Evening</span><span>Company</span><span>Time</span
      ><span>Status</span><span>Manage</span>
    </div>
    <div class="desk-list">
      @for (item of records(); track item.id) {
        <article class="desk-record" [attr.aria-label]="item.guest + ', ' + item.id">
          <div class="record-guest">
            <h3>{{ item.guest }}</h3>
            <span>{{ item.id }}</span>
          </div>
          <div class="record-date">
            <span class="mobile-label">Evening</span
            >{{ date(item.date, { weekday: 'short', month: 'short' }) }}
          </div>
          <div>
            <span class="mobile-label">Company</span>{{ item.party }}
            {{ item.party === 1 ? 'guest' : 'guests' }}
          </div>
          <div><span class="mobile-label">Time</span>{{ item.time }}</div>
          <div>
            <span class="status-badge" [class.cancelled]="item.status === 'cancelled'">{{
              item.status
            }}</span>
          </div>
          <div class="record-actions">
            @if (item.status === 'confirmed') {
              <button
                type="button"
                (click)="edited.emit(item)"
                [attr.aria-label]="'Edit ' + item.id"
              >
                Edit</button
              ><button
                type="button"
                (click)="cancelled.emit(item)"
                [attr.aria-label]="'Cancel ' + item.id"
              >
                Cancel
              </button>
            } @else {
              <span class="cancelled-note">No table held</span>
            }
          </div>
        </article>
      }
    </div>`,
})
export class ReservationList {
  readonly records = input.required<readonly Reservation[]>();
  readonly edited = output<Reservation>();
  readonly cancelled = output<Reservation>();
  protected readonly date = formatDate;
}
