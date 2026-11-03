import { ChangeDetectionStrategy, Component, input } from '@angular/core';
@Component({
  selector: 'app-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="form-field">
    <label [for]="controlId()">{{ label() }}</label
    ><ng-content />
    @if (error()) {
      <p [id]="controlId() + '-error'" class="field-error" aria-live="polite">{{ error() }}</p>
    } @else if (hint()) {
      <p class="field-hint">{{ hint() }}</p>
    }
  </div>`,
})
export class Field {
  readonly controlId = input.required<string>();
  readonly label = input.required<string>();
  readonly error = input<string | undefined>();
  readonly hint = input<string>();
}
