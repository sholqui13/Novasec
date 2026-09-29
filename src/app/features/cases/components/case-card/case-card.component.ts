import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { AvatarComponent } from '@shared/ui/avatar';
import { CaseStatusBadgeComponent } from '@shared/ui/case-status-badge';
import { IconComponent } from '@shared/ui/icon';
import type { Case } from '../../models';

export type CaseCardDensity = 'comfortable' | 'compact';

@Component({
  selector: 'nvs-case-card',
  imports: [AvatarComponent, CaseStatusBadgeComponent, IconComponent],
  templateUrl: './case-card.component.html',
  styleUrl: './case-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': '"nvs-case-card nvs-case-card--" + density()',
    '[class.nvs-case-card--active]': 'active()',
  },
})
export class CaseCardComponent {
  readonly caseData = input.required<Case>({ alias: 'case' });
  readonly density = input<CaseCardDensity>('comfortable');
  readonly active = input(false, { transform: booleanAttribute });
  readonly interactive = input(true, { transform: booleanAttribute });

  readonly selected = output<Case>();
  readonly viewDetails = output<Case>();

  protected readonly assigneeFirstName = computed(
    () => this.caseData().assignee?.name.split(' ')[0] ?? '',
  );

  protected activate(): void {
    if (this.active()) {
      this.viewDetails.emit(this.caseData());
    } else {
      this.selected.emit(this.caseData());
    }
  }
}
