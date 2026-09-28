import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  ViewEncapsulation,
} from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { NVS_ICONS, type IconName } from './icon-registry';

export type IconSize = 'xs' | 'small' | 'medium' | 'large';
export type IconColor =
  | 'current'
  | 'muted'
  | 'accent'
  | 'inverse'
  | 'info'
  | 'success'
  | 'warning'
  | 'error';

@Component({
  selector: 'nvs-icon',
  imports: [LucideAngularModule],
  template: `<lucide-angular [img]="data()" [strokeWidth]="strokeWidth()" />`,
  styleUrl: './icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'hostClasses()',
    '[attr.role]': 'label() ? "img" : null',
    '[attr.aria-label]': 'label() || null',
    '[attr.aria-hidden]': 'label() ? null : "true"',
  },
})
export class IconComponent {
  readonly name = input.required<IconName>();
  readonly size = input<IconSize | null>(null);
  readonly color = input<IconColor>('current');
  readonly strokeWidth = input(2);
  readonly label = input('');

  protected readonly data = computed(() => NVS_ICONS[this.name()]);

  protected readonly hostClasses = computed(() =>
    [
      'nvs-icon',
      this.size() ? `nvs-icon--${this.size()}` : '',
      this.color() !== 'current' ? `nvs-icon--${this.color()}` : '',
    ]
      .filter(Boolean)
      .join(' '),
  );
}
