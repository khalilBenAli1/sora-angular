import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-visit',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<section class="editorial-page">
    <div class="editorial-intro shell">
      <p class="eyebrow">Before the evening begins</p>
      <h1>A little planning.<br /><em>A lot to look forward to.</em></h1>
      <p>A quiet table. A thoughtful plate. An evening at your own pace.</p>
    </div>
    <div class="visit-grid shell">
      <section>
        <p class="eyebrow">The rhythm</p>
        <h2>Evenings,<br /><em>well spent.</em></h2>
        <dl>
          <div>
            <dt>Tuesday–Sunday</dt>
            <dd>18:00–22:30</dd>
          </div>
          <div>
            <dt>Monday</dt>
            <dd>The kitchen rests</dd>
          </div>
          <div>
            <dt>Seatings</dt>
            <dd>18:00–20:30</dd>
          </div>
          <div>
            <dt>Your company</dt>
            <dd>1–6 guests</dd>
          </div>
        </dl>
      </section>
      <section>
        <p class="eyebrow">A place to imagine</p>
        <h2>Try the<br /><em>Sora experience.</em></h2>
        <p>
          This is a fictional restaurant, so there is no physical address to visit. Explore the
          seasonal menu, make a practice reservation, and see it appear in the local demo desk.
        </p>
        <a routerLink="/reserve" class="button">Reserve a demo table ↗</a
        ><a routerLink="/" class="text-link">Explore the menu ↗</a>
      </section>
    </div>
  </section>`,
})
export class Visit {}
