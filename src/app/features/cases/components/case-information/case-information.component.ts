import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CaseStatusBadgeComponent } from '@shared/ui/case-status-badge';
import type { Case, CasePriority } from '../../models';

const PRIORITY_LABELS: Readonly<Record<CasePriority, string>> = {
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
};

let nextId = 0;

@Component({
  selector: 'nvs-case-information',
  imports: [DatePipe, CaseStatusBadgeComponent],
  templateUrl: './case-information.component.html',
  styleUrl: './case-information.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CaseInformationComponent {
  readonly caseData = input.required<Case>({ alias: 'case' });

  protected readonly titleId = `nvs-case-information-${nextId++}-title`;
  protected readonly priorityLabel = computed(() => PRIORITY_LABELS[this.caseData().priority]);
}
