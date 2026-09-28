import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { Case } from '../../models';
import { FAKE_CASES } from '../../services';
import { CasesMapComponent } from './cases-map.component';

const IMAGE_SIZE = { width: 1000, height: 800 };

// jsdom no carga imágenes ni tiene ResizeObserver; se simulan con lo mínimo necesario.
class FakeImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  naturalWidth = IMAGE_SIZE.width;
  naturalHeight = IMAGE_SIZE.height;

  set src(_value: string) {
    queueMicrotask(() => this.onload?.());
  }
}

class FakeResizeObserver {
  observe(): void {}
  disconnect(): void {}
}

describe('CasesMapComponent', () => {
  let fixture: ComponentFixture<CasesMapComponent>;
  let host: HTMLElement;
  const mappedCases = FAKE_CASES.filter((item) => item.mapPosition);

  beforeEach(async () => {
    vi.stubGlobal('Image', FakeImage);
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(800);
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(600);

    await TestBed.configureTestingModule({
      imports: [CasesMapComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CasesMapComponent);
    host = fixture.nativeElement;
    fixture.componentRef.setInput('imageUrl', 'assets/images/map/campus-map.jpg');
    fixture.componentRef.setInput('cases', FAKE_CASES);
    fixture.detectChanges();
    await vi.waitFor(() => expect(host.querySelector('.leaflet-container')).toBeTruthy());
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  function markers(): HTMLElement[] {
    return Array.from(host.querySelectorAll('.nvs-cases-map__marker nvs-map-marker'));
  }

  it('renders the campus image as the map background', () => {
    expect(host.querySelector('img.leaflet-image-layer')?.getAttribute('src')).toBe(
      'assets/images/map/campus-map.jpg',
    );
  });

  it('adds a marker only for the cases with a map position', async () => {
    await vi.waitFor(() => expect(markers()).toHaveLength(mappedCases.length));

    expect(markers().map((marker) => marker.textContent?.trim())).toEqual(
      mappedCases.map((item) => `Caso #${item.number}`),
    );
  });

  it('marks the selected case and emits the clicked one', async () => {
    const selected = vi.fn<(item: Case) => void>();
    fixture.componentInstance.selected.subscribe(selected);
    await vi.waitFor(() => expect(markers()).toHaveLength(mappedCases.length));

    fixture.componentRef.setInput('selectedId', mappedCases[1].id);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(markers()[1].classList).toContain('nvs-map-marker--selected');

    (markers()[0].querySelector('button') as HTMLButtonElement).click();
    expect(selected).toHaveBeenCalledWith(mappedCases[0]);
  });

  it('removes the markers of cases that are no longer listed', async () => {
    await vi.waitFor(() => expect(markers()).toHaveLength(mappedCases.length));

    fixture.componentRef.setInput('cases', mappedCases.slice(0, 1));
    fixture.detectChanges();

    await vi.waitFor(() => expect(markers()).toHaveLength(1));
  });
});
