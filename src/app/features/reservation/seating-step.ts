import { ChangeDetectionStrategy, Component, ElementRef, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { addDays, nextOpenDay } from '../../domain/reservations';
import { Calendar } from '../../shared/calendar';
import { Field } from '../../shared/field';
import { ReservationFlow } from './reservation-flow';
@Component({
  selector: 'app-seating-step',
  imports: [ReactiveFormsModule, Calendar, Field],
  templateUrl: './seating-step.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeatingStep {
  protected readonly flow = inject(ReservationFlow);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly parties = [1, 2, 3, 4, 5, 6];
  protected submit() {
    if (!this.flow.toDetails())
      requestAnimationFrame(() =>
        this.host.nativeElement.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
      );
  }
  protected nextEvening() {
    this.flow.form.controls.date.setValue(nextOpenDay(addDays(this.flow.choice().date, 1)));
  }
}
