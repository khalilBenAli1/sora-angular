import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  input,
  output,
  viewChild,
} from '@angular/core';
@Component({
  selector: 'app-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ` <dialog #dialog [attr.aria-label]="title()" (cancel)="cancel($event)">
    <div class="modal-heading">
      <h2>{{ title() }}</h2>
      <button
        class="icon-button"
        type="button"
        [attr.aria-label]="'Close ' + title()"
        (click)="closed.emit()"
      >
        ×
      </button>
    </div>
    <ng-content />
  </dialog>`,
})
export class Modal {
  readonly open = input(false);
  readonly title = input.required<string>();
  readonly closed = output<void>();
  readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('dialog');
  constructor() {
    effect(() => {
      const dialog = this.dialog()?.nativeElement;
      if (!dialog) return;
      if (this.open() && !dialog.open) dialog.showModal();
      else if (!this.open() && dialog.open) dialog.close();
    });
  }
  cancel(event: Event) {
    // Parent state owns closing. Native close events can arrive after a rapid reopen.
    event.preventDefault();
    this.closed.emit();
  }
}
