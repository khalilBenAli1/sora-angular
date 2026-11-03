import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { formatDate } from '../../domain/reservations';
import { ReservationFlow } from './reservation-flow';
@Component({
  selector: 'app-review-step',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ` <p class="eyebrow">03 · Just one last look</p>
    <h2 data-step-heading tabindex="-1">A good evening<br /><em>starts here.</em></h2>
    <p class="step-intro">Your choices, all together. Nothing to rush.</p>
    <dl class="review-list">
      <div>
        <dt>Your evening</dt>
        <dd>
          {{ date(flow.choice().date, { weekday: 'long', year: 'numeric' })
          }}<button type="button" (click)="flow.step.set(0)">Edit</button>
        </dd>
      </div>
      <div>
        <dt>Your table</dt>
        <dd>
          {{ flow.choice().party }} {{ flow.choice().party === 1 ? 'guest' : 'guests' }} ·
          {{ flow.choice().time }}
        </dd>
      </div>
      <div>
        <dt>Your details</dt>
        <dd>
          {{ flow.contact().name }}<br />{{ flow.contact().email
          }}<button type="button" (click)="flow.step.set(1)">Edit</button>
        </dd>
      </div>
    </dl>
    <div class="simulation-note">
      <span aria-hidden="true">✳</span>
      <p>
        This is a practice reservation. No actual table is held, no payment is taken and no message
        is sent.
      </p>
    </div>
    <button class="button full-width" type="button" (click)="flow.complete()">
      Complete demo reservation <span aria-hidden="true">↗</span>
    </button>`,
})
export class ReviewStep {
  protected readonly flow = inject(ReservationFlow);
  protected readonly date = formatDate;
}
