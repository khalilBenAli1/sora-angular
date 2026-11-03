import { Injectable } from '@angular/core';
import { map, timer, type Observable } from 'rxjs';
import {
  availableSeatings,
  closedMonday,
  type Reservation,
  type Seating,
} from '../domain/reservations';
export interface Availability {
  slots: Seating[];
  message: string;
}
@Injectable({ providedIn: 'root' })
export class AvailabilityService {
  check(
    date: string,
    party: number,
    records: readonly Reservation[],
    retry = false,
  ): Observable<Availability> {
    return timer(250).pipe(
      map(() => {
        if (date.endsWith('-13') && !retry)
          throw new Error('We couldn’t check this evening. Please try again.');
        const slots = availableSeatings(date, party, records);
        const message = closedMonday(date)
          ? 'The kitchen rests on Mondays. Try another evening.'
          : slots.some((slot) => slot.available)
            ? 'A little time, just for you.'
            : 'This evening is fully booked. Try another date.';
        return { slots, message };
      }),
    );
  }
}
