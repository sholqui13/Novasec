import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { CaseCardComponent } from '@features/cases/components/case-card';
import { CaseInformationComponent } from '@features/cases/components/case-information';
import { CasesMapComponent } from '@features/cases/components/cases-map';
import type { Case } from '@features/cases/models';
import { CasesService } from '@features/cases/services';
import { AlertComponent } from '@shared/ui/alert';
import { BreadcrumbComponent, type BreadcrumbItem } from '@shared/ui/breadcrumb';
import { FeedbackStateComponent } from '@shared/ui/feedback-state';
import { IconComponent } from '@shared/ui/icon';

@Component({
  selector: 'nvs-case-detail-page',
  imports: [
    AlertComponent,
    BreadcrumbComponent,
    CaseCardComponent,
    CaseInformationComponent,
    CasesMapComponent,
    FeedbackStateComponent,
    IconComponent,
  ],
  templateUrl: './case-detail-page.component.html',
  styleUrl: './case-detail-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CaseDetailPageComponent {
  readonly id = input.required<string>();

  protected readonly cases = inject(CasesService);
  private readonly router = inject(Router);

  protected readonly caseData = computed(
    () => this.cases.cases().find((item) => String(item.number) === this.id()) ?? null,
  );

  protected readonly breadcrumb = computed<readonly BreadcrumbItem[]>(() => [
    { label: 'Dashboard', link: '/' },
    { label: `Caso #${this.id()}` },
  ]);

  // El caso actual siempre aparece en el mapa, aunque ya no esté activo.
  protected readonly mapCases = computed(() => {
    const current = this.caseData();
    const active = this.cases.activeCases();
    return current && !active.includes(current) ? [...active, current] : active;
  });

  protected openCase(item: Case): void {
    void this.router.navigate(['/cases', item.number]);
  }

  protected goToDashboard(): void {
    void this.router.navigateByUrl('/');
  }
}
