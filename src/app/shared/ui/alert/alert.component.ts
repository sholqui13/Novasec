import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  ViewEncapsulation,
} from '@angular/core';
import { IconComponent, type IconName } from '../icon';

export type AlertType = 'info' | 'success' | 'warning' | 'error';

const ALERT_ICONS: Readonly<Record<AlertType, IconName>> = {
  info: 'alert-circle',
  success: 'check-circle',
  warning: 'alert-triangle',
  error: 'x-circle',
};

/**
 * Mensaje de feedback dentro de la página. Al cerrarlo solo emite `dismissed`:
 * quien lo usa decide si lo quita (p. ej. con `@if`).
 */
@Component({
  selector: 'nvs-alert',
  imports: [IconComponent],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': '"nvs-alert nvs-alert--" + type()',
    '[attr.role]': 'urgent() ? "alert" : "status"',
    // Evita el tooltip nativo que deja `title="..."` como atributo estático.
    '[attr.title]': 'null',
  },
})
export class AlertComponent {
  readonly type = input<AlertType>('info');
  readonly title = input('');
  readonly message = input('');
  readonly dismissible = input(false, { transform: booleanAttribute });
  readonly dismissed = output<void>();

  protected readonly icon = computed(() => ALERT_ICONS[this.type()]);
  protected readonly urgent = computed(() => this.type() === 'error' || this.type() === 'warning');
}
