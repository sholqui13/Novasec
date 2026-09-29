import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CasePanelComponent } from '@features/cases/components/case-panel';
import { CasesMapComponent } from '@features/cases/components/cases-map';
import type { Case } from '@features/cases/models';
import { CasesService } from '@features/cases/services';
import { AlertComponent } from '@shared/ui/alert';
import { ButtonComponent } from '@shared/ui/button';
import { FeedbackStateComponent } from '@shared/ui/feedback-state';
import { SkeletonComponent } from '@shared/ui/skeleton';

@Component({
  selector: 'nvs-dashboard-page',
  imports: [
    AlertComponent,
    ButtonComponent,
    CasePanelComponent,
    CasesMapComponent,
    FeedbackStateComponent,
    SkeletonComponent,
  ],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent {
  protected readonly cases = inject(CasesService);
  private readonly router = inject(Router);

  private readonly noResults = computed(
    () => !!this.cases.searchTerm() && this.cases.searchResults().length === 0,
  );
  protected readonly emptyTitle = computed(() =>
    this.noResults() ? 'Sin resultados' : 'Selecciona un caso',
  );
  protected readonly emptyMessage = computed(() => {
    const term = this.cases.searchTerm();
    if (!term) {
      return 'Haz clic en un marcador del mapa';
    }
    const count = this.cases.searchResults().length;
    if (count === 0) {
      return `Ningún caso activo coincide con “${term}”.`;
    }
    return count === 1
      ? `1 caso coincide con “${term}”.`
      : `${count} casos coinciden con “${term}”.`;
  });

  protected viewDetails(item: Case): void {
    void this.router.navigate(['/cases', item.number]);
  }
}
