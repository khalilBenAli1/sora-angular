import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { Modal } from './shared/modal';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Modal],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly router = inject(Router);
  private readonly location = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );
  protected readonly isHome = computed(() => this.location().split(/[?#]/)[0] === '/');
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
