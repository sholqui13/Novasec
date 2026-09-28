import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  output,
  ViewEncapsulation,
} from '@angular/core';
import { IconComponent } from '../icon';
import { TOAST_DEFAULT_DURATION, type ToastType } from './toast.service';

/**
 * Notificación temporal. Se cierra sola tras `duration` ms (0 = fija) y pausa
 * la cuenta mientras el usuario la tiene bajo el mouse o con foco (WCAG 2.2.1).
 */
@Component({
  selector: 'nvs-toast',
  imports: [IconComponent],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': '"nvs-toast nvs-toast--" + type()',
    '(mouseenter)': 'setHovered(true)',
    '(mouseleave)': 'setHovered(false)',
    '(focusin)': 'setFocused(true)',
    '(focusout)': 'setFocused(false)',
    // Evita el tooltip nativo que deja `title="..."` como atributo estático.
    '[attr.title]': 'null',
  },
})
export class ToastComponent {
  readonly type = input<ToastType>('info');
  readonly title = input.required<string>();
  readonly message = input('');
  readonly duration = input(TOAST_DEFAULT_DURATION);
  readonly dismissed = output<void>();

  private timer: ReturnType<typeof setTimeout> | undefined;
  private remaining = 0;
  private startedAt = 0;
  private hovered = false;
  private focused = false;

  constructor() {
    afterNextRender(() => {
      this.remaining = this.duration();
      this.syncTimer();
    });
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  protected dismiss(): void {
    clearTimeout(this.timer);
    this.timer = undefined;
    this.dismissed.emit();
  }

  protected setHovered(hovered: boolean): void {
    this.hovered = hovered;
    this.syncTimer();
  }

  protected setFocused(focused: boolean): void {
    this.focused = focused;
    this.syncTimer();
  }

  private syncTimer(): void {
    const paused = this.hovered || this.focused;

    if (paused && this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
      this.remaining -= Date.now() - this.startedAt;
    } else if (!paused && !this.timer && this.remaining > 0) {
      this.startedAt = Date.now();
      this.timer = setTimeout(() => this.dismiss(), this.remaining);
    }
  }
}
