import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';
import { ReservationFlow } from './reservation-flow';
import { AvailabilityService } from '../../services/availability';
import { availableSeatings } from '../../domain/reservations';
import { CLOCK, LOCAL_STORAGE, ReservationStore } from '../../state/reservation-store';
describe('reservation form orchestration', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ReservationFlow,
        { provide: CLOCK, useValue: () => new Date(2026, 10, 3, 12) },
        { provide: LOCAL_STORAGE, useValue: null },
        {
          provide: AvailabilityService,
          useValue: {
            check: (date: string, party: number) =>
              of({ slots: availableSeatings(date, party, []), message: 'Sample availability' }),
          },
        },
      ],
    });
  });
  it('rejects invalid date/party/time through typed reactive forms', () => {
    const flow = TestBed.inject(ReservationFlow);
    TestBed.tick();
    expect(flow.toDetails()).toBe(false);
    flow.form.controls.date.setValue('2026-11-02');
    flow.form.controls.time.setValue('19:00');
    expect(flow.toDetails()).toBe(false);
    flow.form.controls.date.setValue('2026-11-04');
    flow.form.controls.party.setValue(1.5);
    flow.form.controls.time.setValue('19:00');
    expect(flow.toDetails()).toBe(false);
  });
  it('rejects invalid contact details and requires simulation acknowledgement', () => {
    const flow = TestBed.inject(ReservationFlow);
    TestBed.tick();
    expect(flow.toReview()).toBe(false);
    expect(flow.contactErrors().name).toBeTruthy();
    expect(flow.contactErrors().email).toBeTruthy();
    flow.contactForm.setValue({ name: '  ', email: 'wrong', consent: true });
    expect(flow.toReview()).toBe(false);
    flow.sampleDetails();
    expect(flow.contactForm.controls.email.value).toBe('alex@example.com');
    expect(flow.toReview()).toBe(false);
    flow.contactForm.controls.consent.setValue(true);
    expect(flow.toReview()).toBe(true);
  });
  it.each(['alex<smith>@example.com', 'alex,smith@example.com'])(
    'does not advance the reactive contact form for unsupported email punctuation: %s',
    (email) => {
      const flow = TestBed.inject(ReservationFlow);
      TestBed.tick();
      flow.contactForm.setValue({ name: 'Léa Ben Ali', email, consent: true });
      expect(flow.toReview()).toBe(false);
      expect(flow.contactForm.controls.email.hasError('message')).toBe(true);
      expect(flow.contactErrors().email).toBe('Please enter a valid email address.');
    },
  );
  it('snapshots the confirmation, clears contacts, and restarts without reviving the reference', () => {
    const flow = TestBed.inject(ReservationFlow);
    const store = TestBed.inject(ReservationStore);
    TestBed.tick();
    flow.form.controls.date.setValue('2026-11-04');
    flow.chooseTime('18:00');
    expect(flow.toDetails()).toBe(true);
    flow.sampleDetails();
    flow.contactForm.controls.consent.setValue(true);
    expect(flow.toReview()).toBe(true);
    flow.complete();
    const snapshot = flow.confirmed();
    expect(snapshot?.firstName).toBe('Alex');
    expect(snapshot?.reservation.time).toBe('18:00');
    expect(flow.contactForm.controls.name.value).toBe('');
    expect(flow.contactForm.controls.email.value).toBe('');
    store.reset();
    expect(flow.confirmed()).toEqual(snapshot);
    flow.restart();
    expect(flow.confirmed()).toBeNull();
    expect(flow.step()).toBe(0);
    expect(flow.contactForm.controls.email.value).toBe('');
  });
});
