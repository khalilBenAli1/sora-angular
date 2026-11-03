import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<section class="editorial-page">
    <div class="editorial-intro shell">
      <p class="eyebrow">A little off the menu · 404</p>
      <h1>Let's find you<br /><em>a place at the table.</em></h1>
      <p>This page isn't part of the evening.</p>
      <a routerLink="/" class="button">Back to Sora ↗</a>
    </div>
  </section>`,
})
export class NotFound {}
