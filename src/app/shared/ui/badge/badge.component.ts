import { booleanAttribute, ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type BadgeVariant = 'neutral' | 'info' | 'success' | 'warning' | 'error' | 'dark';

/** Variantes que llevan punto por defecto. */
const VARIANTS_WITH_DOT: ReadonlySet<BadgeVariant> = new Set(['info', 'success', 'warning', 'error']);

/** Etiqueta compacta de estado o categoría. El texto se pasa en `label` o como contenido. */
@Component({
  selector: 'nvs-badge',
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': '"nvs-badge nvs-badge--" + variant()',
  },
})
export class BadgeComponent {
  readonly variant = input<BadgeVariant>('neutral');
  readonly label = input('');
  readonly dot = input<boolean | undefined, unknown>(undefined, {
    transform: (value: unknown) => (value === undefined ? undefined : booleanAttribute(value)),
  });

  protected readonly showDot = computed(() => this.dot() ?? VARIANTS_WITH_DOT.has(this.variant()));
}
