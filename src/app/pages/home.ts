import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { categories, euros, menu, type Dish, type MenuCategory } from '../data/menu';
import { Modal } from '../shared/modal';
@Component({
  selector: 'app-home',
  imports: [RouterLink, Modal],
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  protected readonly categories = categories;
  protected readonly selected = signal<MenuCategory>('To begin');
  protected readonly dishes = computed(() =>
    menu.filter((dish) => dish.category === this.selected()),
  );
  protected readonly detail = signal<Dish | null>(null);
  protected readonly euros = euros;
  private readonly injector = inject(Injector);
  private readonly rail = viewChild<ElementRef<HTMLElement>>('courseRail');
  protected readonly canPrevious = signal(false);
  protected readonly canNext = signal(false);
  constructor() {
    effect((cleanup) => {
      const rail = this.rail()?.nativeElement;
      if (!rail) return;
      const observer = new ResizeObserver(() => this.updateRail());
      observer.observe(rail);
      cleanup(() => observer.disconnect());
    });
    effect(() => {
      this.selected();
      afterNextRender(
        () => {
          this.rail()?.nativeElement.scrollTo({ left: 0 });
          this.updateRail();
        },
        { injector: this.injector },
      );
    });
  }
  protected updateRail() {
    const rail = this.rail()?.nativeElement;
    if (rail) {
      this.canPrevious.set(rail.scrollLeft > 2);
      this.canNext.set(rail.scrollLeft < rail.scrollWidth - rail.clientWidth - 2);
    }
  }
  protected moveCourses(direction: number) {
    const rail = this.rail()?.nativeElement;
    rail?.scrollBy({
      left: rail.clientWidth * direction,
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  }
  protected revealCourse(event: FocusEvent) {
    const target = event.target;
    if (target instanceof HTMLElement) {
      requestAnimationFrame(() =>
        target.scrollIntoView({ block: 'nearest', inline: 'start', behavior: 'instant' }),
      );
    }
  }

  protected scrollToMenu() {
    document.getElementById('menu-heading')?.focus({ preventScroll: true });
    document.getElementById('menu')?.scrollIntoView({
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  }
}
