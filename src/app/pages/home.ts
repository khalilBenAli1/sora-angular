import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
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
}
