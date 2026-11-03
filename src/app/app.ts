import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Modal } from './shared/modal';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Modal],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly menuOpen = signal(false);
  protected skip(event: Event) {
    event.preventDefault();
    document.getElementById('main-content')?.focus();
  }
  protected onNavigate() {
    requestAnimationFrame(() =>
      document.getElementById('main-content')?.focus({ preventScroll: true }),
    );
  }
}
