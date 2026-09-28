import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

export type MapMarkerState = 'default' | 'hover' | 'selected';

@Component({
  selector: 'nvs-map-marker',
  templateUrl: './map-marker.component.html',
  styleUrl: './map-marker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': '"nvs-map-marker nvs-map-marker--" + state()',
    '[class.nvs-map-marker--cluster]': 'isCluster()',
  },
})
export class MapMarkerComponent {
  readonly caseId = input<string | number>('');
  readonly state = input<MapMarkerState>('default');
  readonly clusterCount = input(0);

  readonly selected = output<string | number>();

  protected readonly isCluster = computed(() => this.clusterCount() > 1);
}
