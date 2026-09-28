import {
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  isDevMode,
  output,
  ViewEncapsulation,
} from '@angular/core';
import { IconComponent, type IconName } from '../icon';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';
export type ButtonType = 'button' | 'submit' | 'reset';

/**
 * Botón Novasec aplicado sobre el elemento nativo:
 * `<button nvsButton>` o `<a nvsButton>` para navegación.
 *
 * El texto puede venir del input `label` o proyectarse como contenido.
 * Atributos nativos (`aria-label`, `form`, `routerLink`, etc.) van directo al elemento.
 */
@Component({
  selector: 'button[nvsButton], a[nvsButton]',
  imports: [IconComponent],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'hostClasses()',
    '[attr.type]': 'isAnchor ? null : type()',
    '[attr.disabled]': '!isAnchor && disabled() ? "" : null',
    '[attr.aria-disabled]': 'inert() ? "true" : null',
    '[attr.aria-busy]': 'loading() || null',
    '[attr.tabindex]': 'isAnchor && disabled() ? -1 : null',
  },
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('medium');
  readonly label = input('');
  readonly icon = input<IconName | null>(null);
  readonly loading = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly type = input<ButtonType>('button');
  readonly clicked = output<void>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly isAnchor = this.host.nativeElement.tagName === 'A';

  protected readonly inert = computed(() => this.disabled() || this.loading());

  protected readonly hostClasses = computed(() =>
    [
      'nvs-button',
      `nvs-button--${this.variant()}`,
      `nvs-button--${this.size()}`,
      this.disabled() ? 'nvs-button--disabled' : '',
      this.loading() ? 'nvs-button--loading' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );

  constructor() {
    const el = this.host.nativeElement;
    const onClick = (event: Event) => this.handleClick(event);
    el.addEventListener('click', onClick, { capture: true });
    inject(DestroyRef).onDestroy(() =>
      el.removeEventListener('click', onClick, { capture: true }),
    );

    if (isDevMode()) {
      afterNextRender(() => this.warnIfMissingAccessibleName());
    }
  }

  private handleClick(event: Event): void {
    if (this.inert()) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    this.clicked.emit();
  }

  private warnIfMissingAccessibleName(): void {
    const el = this.host.nativeElement;
    const hasName =
      el.textContent?.trim() ||
      el.hasAttribute('aria-label') ||
      el.hasAttribute('aria-labelledby');

    if (!hasName) {
      console.warn(
        '[nvsButton] Botón sin nombre accesible. Agrega `label`, contenido o `aria-label`.',
        el,
      );
    }
  }
}
