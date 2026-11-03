import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { formatDate } from '../../domain/reservations';
import type { ConfirmedReservation } from './reservation-flow';
@Component({
  selector: 'app-reservation-confirmation',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ` <section class="reservation-confirmation shell">
    <span class="confirmation-symbol" aria-hidden="true">✳</span>
    <p class="eyebrow">An evening to imagine</p>
    <h1 data-step-heading tabindex="-1">Your table.<br /><em>Your kind of evening.</em></h1>
    <p>Thank you, {{ confirmation().firstName }}. Your practice reservation is ready.</p>
    <div class="confirmation-ticket">
      <p class="eyebrow">Demo reference · {{ confirmation().reservation.id }}</p>
      <h2>SORA</h2>
      <p>{{ date(confirmation().reservation.date, { weekday: 'long', year: 'numeric' }) }}</p>
      <strong
        >{{ confirmation().reservation.time }} · {{ confirmation().reservation.party }}
        {{ confirmation().reservation.party === 1 ? 'guest' : 'guests' }}</strong
      >
      <p class="privacy-note">
        Added to the local demo desk as {{ confirmation().reservation.guest }}. No table is held, no
        email is sent, and your contact details are not saved.
      </p>
    </div>
    <div class="confirmation-actions">
      <button type="button" class="button" (click)="restart.emit()">
        Imagine another evening <span aria-hidden="true">↗</span></button
      ><a routerLink="/desk" class="text-link"
        >View the demo desk <span aria-hidden="true">↗</span></a
      >
    </div>
  </section>`,
})
export class ReservationConfirmation {
  readonly confirmation = input.required<ConfirmedReservation>();
  readonly restart = output<void>();
  protected readonly date = formatDate;
}
