import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { CaseStatus } from '../../../core/models';
import { BadgeComponent, type BadgeVariant } from '../badge';

interface CaseStatusConfig {
  readonly label: string;
  readonly variant: BadgeVariant;
}

export const CASE_STATUS_CONFIG: Readonly<Record<CaseStatus, CaseStatusConfig>> = {
  open: { label: 'Open', variant: 'info' },
  'in-progress': { label: 'In Progress', variant: 'warning' },
  resolved: { label: 'Resolved', variant: 'success' },
  closed: { label: 'Closed', variant: 'dark' },
  urgent: { label: 'Urgent', variant: 'error' },
};

@Component({
  selector: 'nvs-case-status-badge',
  imports: [BadgeComponent],
  template: `<nvs-badge [variant]="config().variant" [label]="label() || config().label" dot />`,
  styleUrl: './case-status-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': '"nvs-case-status-badge nvs-case-status-badge--" + status()',
  },
})
export class CaseStatusBadgeComponent {
  readonly status = input.required<CaseStatus>();
  readonly label = input('');

  protected readonly config = computed(() => CASE_STATUS_CONFIG[this.status()]);
}
