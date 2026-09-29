import { DatePipe } from '@angular/common';
import {
  afterNextRender,
  ApplicationRef,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  type ComponentRef,
  createComponent,
  DestroyRef,
  effect,
  type ElementRef,
  EnvironmentInjector,
  inject,
  input,
  output,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import type * as Leaflet from 'leaflet';
import type { Case, MapPosition } from '../../models';
import { MapMarkerComponent } from '../map-marker';

type MappedCase = Case & { readonly mapPosition: MapPosition };

interface MarkerEntry {
  readonly marker: Leaflet.Marker;
  readonly component: ComponentRef<MapMarkerComponent>;
}

// Leaflet se carga solo en el navegador: accede a `window` al importarse.
async function loadLeaflet(): Promise<typeof Leaflet> {
  const module = await import('leaflet');
  return ('default' in module ? module.default : module) as typeof Leaflet;
}

function loadImageSize(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = reject;
    image.src = url;
  });
}

export const CAMPUS_MAP_IMAGE = 'assets/images/map/campus-map.jpg';

@Component({
  selector: 'nvs-cases-map',
  imports: [DatePipe],
  template: `
    <div #container class="nvs-cases-map__container"></div>
    @if (summary()) {
      <p class="nvs-cases-map__summary">
        <span class="nvs-cases-map__summary-dot" aria-hidden="true"></span>
        <span>{{ cases().length }} casos activos</span>
        @if (lastUpdated(); as updated) {
          <span class="nvs-cases-map__updated">Actualizado {{ updated | date: 'HH:mm' }}</span>
        }
      </p>
    }
  `,
  styleUrl: './cases-map.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Los marcadores viven dentro de elementos que crea Leaflet.
  encapsulation: ViewEncapsulation.None,
  host: { class: 'nvs-cases-map' },
})
export class CasesMapComponent {
  readonly imageUrl = input(CAMPUS_MAP_IMAGE);
  readonly cases = input<readonly Case[]>([]);
  readonly selectedId = input<string | null>(null);
  readonly summary = input(false, { transform: booleanAttribute });
  readonly lastUpdated = input<Date | null>(null);
  readonly selected = output<Case>();

  private readonly container = viewChild.required<ElementRef<HTMLElement>>('container');
  private readonly appRef = inject(ApplicationRef);
  private readonly environmentInjector = inject(EnvironmentInjector);

  private leaflet?: typeof Leaflet;
  private map?: Leaflet.Map;
  private imageSize = { width: 0, height: 0 };
  private readonly markers = new Map<string, MarkerEntry>();
  private readonly ready = signal(false);
  private destroyed = false;
  // `undefined` hasta la primera sincronización: el primer encuadre no se anima.
  private focusedId: string | null | undefined;

  constructor() {
    afterNextRender(() => void this.initMap());

    effect(() => {
      const cases = this.cases().filter((item): item is MappedCase => !!item.mapPosition);
      const selectedId = this.selectedId();
      if (this.ready()) {
        this.syncMarkers(cases, selectedId);
      }
    });

    inject(DestroyRef).onDestroy(() => this.destroy());
  }

  private async initMap(): Promise<void> {
    let leaflet: typeof Leaflet;
    let size: { width: number; height: number };
    try {
      [leaflet, size] = await Promise.all([loadLeaflet(), loadImageSize(this.imageUrl())]);
    } catch {
      return;
    }
    if (this.destroyed) {
      return;
    }

    const element = this.container().nativeElement;
    const bounds = leaflet.latLngBounds([0, 0], [size.height, size.width]);

    this.leaflet = leaflet;
    this.imageSize = size;
    this.map = leaflet.map(element, {
      crs: leaflet.CRS.Simple,
      attributionControl: false,
      maxBounds: bounds,
      maxBoundsViscosity: 1,
      zoomSnap: 0.25,
    });
    leaflet.imageOverlay(this.imageUrl(), bounds).addTo(this.map);
    this.fitToContainer();

    const resizeObserver = new ResizeObserver(() => {
      this.map?.invalidateSize();
      this.fitToContainer();
    });
    resizeObserver.observe(element);
    this.map.on('unload', () => resizeObserver.disconnect());

    this.ready.set(true);
  }

  // La imagen cubre todo el contenedor (como object-fit: cover) y no se puede alejar más.
  // Se calcula a mano: getBoundsZoom() de Leaflet no baja del zoom mínimo (0 por defecto).
  private fitToContainer(): void {
    if (!this.map || !this.leaflet) {
      return;
    }
    const { width, height } = this.imageSize;
    const bounds = this.leaflet.latLngBounds([0, 0], [height, width]);
    const size = this.map.getSize();
    const scale = Math.max(size.x / width, size.y / height);
    const zoomSnap = this.map.options.zoomSnap || 1;
    const coverZoom = Math.ceil(Math.log2(scale) / zoomSnap) * zoomSnap;
    this.map.setMinZoom(coverZoom);
    if (this.map.getZoom() === undefined || this.map.getZoom() < coverZoom) {
      this.map.setView(bounds.getCenter(), coverZoom, { animate: false });
    }
  }

  private toLatLng({ x, y }: MapPosition): Leaflet.LatLngExpression {
    return [this.imageSize.height * (1 - y / 100), (this.imageSize.width * x) / 100];
  }

  private syncMarkers(cases: readonly MappedCase[], selectedId: string | null): void {
    const map = this.map;
    const leaflet = this.leaflet;
    if (!map || !leaflet) {
      return;
    }

    const ids = new Set(cases.map((item) => item.id));
    for (const [id, entry] of this.markers) {
      if (!ids.has(id)) {
        this.removeMarker(id, entry);
      }
    }

    for (const item of cases) {
      const entry = this.markers.get(item.id) ?? this.addMarker(leaflet, map, item);
      entry.marker.setLatLng(this.toLatLng(item.mapPosition));
      entry.component.setInput('caseId', item.number);
      entry.component.setInput('state', item.id === selectedId ? 'selected' : 'default');
      entry.marker.setZIndexOffset(item.id === selectedId ? 1000 : 0);
    }

    const selectedCase = cases.find((item) => item.id === selectedId);
    if (selectedCase && selectedId !== this.focusedId) {
      map.panTo(this.toLatLng(selectedCase.mapPosition), { animate: this.focusedId !== undefined });
    }
    this.focusedId = selectedId;
  }

  private addMarker(leaflet: typeof Leaflet, map: Leaflet.Map, item: MappedCase): MarkerEntry {
    const icon = leaflet.divIcon({ className: 'nvs-cases-map__marker', html: '', iconSize: [0, 0] });
    const marker = leaflet.marker(this.toLatLng(item.mapPosition), { icon, keyboard: false }).addTo(map);
    const element = marker.getElement() as HTMLElement;
    leaflet.DomEvent.disableClickPropagation(element);

    const component = createComponent(MapMarkerComponent, {
      environmentInjector: this.environmentInjector,
      hostElement: element.appendChild(document.createElement('nvs-map-marker')),
    });
    component.instance.selected.subscribe(() => {
      const current = this.cases().find((candidate) => candidate.id === item.id);
      if (current) {
        this.selected.emit(current);
      }
    });
    this.appRef.attachView(component.hostView);

    const entry = { marker, component };
    this.markers.set(item.id, entry);
    return entry;
  }

  private removeMarker(id: string, { marker, component }: MarkerEntry): void {
    this.appRef.detachView(component.hostView);
    component.destroy();
    marker.remove();
    this.markers.delete(id);
  }

  private destroy(): void {
    this.destroyed = true;
    for (const [id, entry] of this.markers) {
      this.removeMarker(id, entry);
    }
    this.map?.remove();
  }
}
