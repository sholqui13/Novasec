import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CasePanelComponent } from '@features/cases/components/case-panel';
import { CasesMapComponent } from '@features/cases/components/cases-map';
import type { Case } from '@features/cases/models';
import { CasesService } from '@features/cases/services';
import { ToastService } from '@shared/ui/toast';

@Component({
  selector: 'nvs-dashboard-page',
  imports: [DatePipe, CasePanelComponent, CasesMapComponent],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent {
  protected readonly cases = inject(CasesService);
  private readonly toast = inject(ToastService);

  protected readonly mapImageUrl = 'assets/images/map/campus-map.jpg';

  protected viewDetails(item: Case): void {
    this.toast.info('Próximamente', `El detalle del caso #${item.number} está en construcción.`);
  }
}
