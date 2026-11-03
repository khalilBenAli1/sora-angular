import { ChangeDetectionStrategy, Component, ElementRef, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Field } from '../../shared/field';
import { ReservationFlow } from './reservation-flow';
@Component({
  selector: 'app-contact-step',
  imports: [ReactiveFormsModule, Field],
  template: ` <p class="eyebrow">02 · A little introduction</p>
    <h2 data-step-heading tabindex="-1">An evening<br /><em>with your name on it.</em></h2>
    <p class="step-intro">
      Use sample details for this practice reservation. Contact information stays in this tab.
    </p>
    <button class="text-link sample-details" type="button" (click)="flow.sampleDetails()">
      Use sample details <span aria-hidden="true">↗</span>
    </button>
    <form [formGroup]="flow.contactForm" (ngSubmit)="submit()" novalidate>
      <app-field controlId="guest-name" label="Your name" [error]="flow.contactErrors().name"
        ><input
          id="guest-name"
          formControlName="name"
          autocomplete="off"
          maxlength="100"
          [attr.aria-invalid]="!!flow.contactErrors().name"
          [attr.aria-describedby]="flow.contactErrors().name ? 'guest-name-error' : null"
      /></app-field>
      <app-field controlId="guest-email" label="Email address" [error]="flow.contactErrors().email"
        ><input
          id="guest-email"
          formControlName="email"
          type="email"
          autocomplete="off"
          maxlength="254"
          [attr.aria-invalid]="!!flow.contactErrors().email"
          [attr.aria-describedby]="flow.contactErrors().email ? 'guest-email-error' : null"
      /></app-field>
      <label class="consent-field"
        ><input
          type="checkbox"
          formControlName="consent"
          [attr.aria-invalid]="!!flow.contactErrors().consent"
          [attr.aria-describedby]="flow.contactErrors().consent ? 'consent-error' : null"
        /><span
          >I understand this is a simulated reservation. No table is held and no email is
          sent.</span
        ></label
      >
      @if (flow.contactErrors().consent) {
        <p id="consent-error" class="field-error">{{ flow.contactErrors().consent }}</p>
      }
      <p class="privacy-note">
        Your date, party and time are saved locally. The demo desk uses a generated guest label;
        your name and email are never saved.
      </p>
      <button class="button full-width" type="submit">
        Review my evening <span aria-hidden="true">↗</span></button
      ><button type="button" class="back-button" (click)="flow.step.set(0)">
        ← Change date & time
      </button>
    </form>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactStep {
  protected readonly flow = inject(ReservationFlow);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  protected submit() {
    if (!this.flow.toReview())
      requestAnimationFrame(() =>
        this.host.nativeElement.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
      );
  }
}
