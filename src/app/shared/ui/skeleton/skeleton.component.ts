import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type SkeletonTone = 'default' | 'subtle';

@Component({
  selector: 'nvs-skeleton',
  template: '',
  styleUrl: './skeleton.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'nvs-skeleton',
    '[class.nvs-skeleton--subtle]': 'tone() === "subtle"',
    'aria-hidden': 'true',
  },
})
export class SkeletonComponent {
  readonly tone = input<SkeletonTone>('default');
}
