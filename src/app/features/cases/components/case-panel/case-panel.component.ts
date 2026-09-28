import { DatePipe } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { ButtonComponent } from '@shared/ui/button';
import { CaseStatusBadgeComponent } from '@shared/ui/case-status-badge';
import { FeedbackStateComponent } from '@shared/ui/feedback-state';
import { IconComponent } from '@shared/ui/icon';
import type { Case } from '../../models';

let nextId = 0;

@Component({
  selector: 'nvs-case-panel',
  imports: [DatePipe, ButtonComponent, CaseStatusBadgeComponent, FeedbackStateComponent, IconComponent],
  templateUrl: './case-panel.component.html',
  styleUrl: './case-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CasePanelComponent {
  readonly caseData = input<Case | null>(null, { alias: 'case' });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly error = input(false, { transform: booleanAttribute });
  readonly emptyTitle = input('No se encontraron casos');
  readonly emptyMessage = input('Intenta ajustar los filtros');

  readonly viewDetails = output<Case>();
  readonly retry = output<void>();

  protected readonly titleId = `nvs-case-panel-${nextId++}-title`;
}
