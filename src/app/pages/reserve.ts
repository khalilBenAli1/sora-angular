import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  effect,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReservationFlow } from '../features/reservation/reservation-flow';
import { SeatingStep } from '../features/reservation/seating-step';
import { ContactStep } from '../features/reservation/contact-step';
import { ReviewStep } from '../features/reservation/review-step';
import { ReservationConfirmation } from '../features/reservation/confirmation';
import { formatDate, isDateOnly } from '../domain/reservations';
@Component({
  selector: 'app-reserve',
  imports: [RouterLink, SeatingStep, ContactStep, ReviewStep, ReservationConfirmation],
  providers: [ReservationFlow],
  templateUrl: './reserve.html',
  styleUrl: './reserve.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Reserve {
  protected readonly flow = inject(ReservationFlow);
  protected readonly date = formatDate;
  protected readonly validDate = isDateOnly;
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  constructor() {
    effect(() => {
      this.flow.step();
      this.flow.confirmed();
      afterNextRender(
        () =>
          this.host.nativeElement
            .querySelector<HTMLElement>('[data-step-heading]')
            ?.focus({ preventScroll: true }),
        { injector: this.injector },
      );
    });
  }
}
