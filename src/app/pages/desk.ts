import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReservationStore } from '../state/reservation-store';
import { filterReservations, type DeskFilters } from '../domain/desk';
import type { Reservation } from '../domain/reservations';
import { Modal } from '../shared/modal';
import { ReservationList } from '../features/desk/reservation-list';
import { ReservationCalendar } from '../features/desk/reservation-calendar';
import { ReservationEditor } from '../features/desk/reservation-editor';
@Component({
  selector: 'app-desk',
  imports: [RouterLink, Modal, ReservationList, ReservationCalendar, ReservationEditor],
  templateUrl: './desk.html',
  styleUrl: './desk.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Desk {
  protected readonly store = inject(ReservationStore);
  protected readonly query = signal('');
  protected readonly date = signal('');
  protected readonly status = signal<DeskFilters['status']>('all');
  protected readonly view = signal<'list' | 'calendar'>('list');
  protected readonly editing = signal<Reservation | null>(null);
  protected readonly cancelling = signal<Reservation | null>(null);
  protected readonly resetOpen = signal(false);
  protected readonly notice = signal('');
  protected readonly noticeElement = viewChild<ElementRef<HTMLElement>>('deskNotice');
  protected readonly matching = computed(() =>
    filterReservations(this.store.reservations(), {
      query: this.query(),
      date: this.date(),
      status: this.status(),
    }),
  );
  protected filterStatus(value: string) {
    this.status.set(value === 'confirmed' || value === 'cancelled' ? value : 'all');
  }
  protected clearFilters() {
    this.query.set('');
    this.date.set('');
    this.status.set('all');
  }
  protected saved(reservation: Reservation) {
    this.editing.set(null);
    this.announce(`${reservation.id} has been updated.`);
  }
  protected cancel() {
    const item = this.cancelling();
    if (item && this.store.cancel(item.id))
      this.announce(`${item.id} has been cancelled. Its places are available again.`);
    this.cancelling.set(null);
  }
  protected reset() {
    this.store.reset();
    this.clearFilters();
    this.resetOpen.set(false);
    this.announce('The local demo has been reset to its four sample reservations.');
  }
  private announce(message: string) {
    this.notice.set(message);
    requestAnimationFrame(() => this.noticeElement()?.nativeElement.focus());
  }
}
