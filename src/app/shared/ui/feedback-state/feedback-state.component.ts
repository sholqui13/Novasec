import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { ButtonComponent } from '../button';
import { IconComponent, type IconName } from '../icon';

export type FeedbackStateType = 'loading' | 'empty' | 'error';

const DEFAULT_ICONS: Readonly<Record<Exclude<FeedbackStateType, 'loading'>, IconName>> = {
  empty: 'clipboard',
  error: 'alert-circle',
};

@Component({
  selector: 'nvs-feedback-state',
  imports: [ButtonComponent, IconComponent],
  templateUrl: './feedback-state.component.html',
  styleUrl: './feedback-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': '"nvs-feedback-state nvs-feedback-state--" + state()',
    '[attr.role]': 'state() === "error" ? "alert" : "status"',
    '[attr.aria-busy]': 'state() === "loading" || null',
    '[attr.title]': 'null',
  },
})
export class FeedbackStateComponent {
  readonly state = input.required<FeedbackStateType>();
  readonly title = input('');
  readonly message = input('');
  readonly actionLabel = input('');
  readonly icon = input<IconName | null>(null);
  readonly action = output<void>();

  protected readonly resolvedIcon = computed(() => {
    const state = this.state();
    return state === 'loading' ? null : (this.icon() ?? DEFAULT_ICONS[state]);
  });
}
