import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-story',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<section class="editorial-page">
    <div class="editorial-intro shell">
      <p class="eyebrow">The Sora philosophy</p>
      <h1>Less complication.<br /><em>More season.</em></h1>
      <p>
        Our imagined kitchen begins with a simple idea: good ingredients deserve attention, and good
        company deserves an unhurried table.
      </p>
    </div>
    <figure class="editorial-photo">
      <img
        src="images/seasonal-plate-1920.webp"
        width="1672"
        height="941"
        alt="Roasted roots and herbs, an illustrated plate from the Sora kitchen"
      />
      <figcaption>A seasonal plate. An open-ended evening.</figcaption>
    </figure>
    <div class="editorial-reading shell">
      <p class="eyebrow">An appetite for discovery</p>
      <h2>Let the evening<br /><em>find its rhythm.</em></h2>
      <p>
        A bright beginning. A generous main. Something small and sweet at the end. This fictional
        menu follows a feeling: thoughtful food, natural textures, and the pleasure of sitting down
        together.
      </p>
      <p>
        Sora is an original restaurant portfolio demo. The photography is original generated
        imagery, the dishes are illustrative, and the reservation experience is a local simulation.
      </p>
      <a routerLink="/reserve" class="button">Imagine your evening ↗</a>
    </div>
  </section>`,
})
export class Story {}
