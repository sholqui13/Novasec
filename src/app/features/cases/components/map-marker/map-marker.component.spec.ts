import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MapMarkerComponent } from './map-marker.component';

describe('MapMarkerComponent', () => {
  let fixture: ComponentFixture<MapMarkerComponent>;
  let host: HTMLElement;
  let selected: ReturnType<typeof vi.fn<(caseId: string | number) => void>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapMarkerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MapMarkerComponent);
    host = fixture.nativeElement;
    selected = vi.fn();
    fixture.componentInstance.selected.subscribe(selected);
    fixture.componentRef.setInput('caseId', 1041);
    fixture.detectChanges();
  });

  function button(): HTMLButtonElement {
    return host.querySelector('button') as HTMLButtonElement;
  }

  it('renders a pin labelled with the case number', () => {
    expect(host.classList).toContain('nvs-map-marker--default');
    expect(host.querySelector('.nvs-map-marker__pin')?.getAttribute('aria-hidden')).toBe('true');
    expect(button().textContent?.trim()).toBe('Caso #1041');
    expect(button().getAttribute('aria-pressed')).toBe('false');
  });

  it('reflects the selected state', () => {
    fixture.componentRef.setInput('state', 'selected');
    fixture.detectChanges();

    expect(host.classList).toContain('nvs-map-marker--selected');
    expect(button().getAttribute('aria-pressed')).toBe('true');
  });

  it('emits the case id when clicked', () => {
    button().click();

    expect(selected).toHaveBeenCalledWith(1041);
  });

  it('renders a cluster with the number of cases', () => {
    fixture.componentRef.setInput('clusterCount', 7);
    fixture.detectChanges();

    expect(host.classList).toContain('nvs-map-marker--cluster');
    expect(host.querySelector('.nvs-map-marker__pin')).toBeNull();
    expect(button().textContent?.trim()).toBe('7');
    expect(button().getAttribute('aria-label')).toBe('7 casos en esta zona');
  });

  it('treats a count of one as a single marker', () => {
    fixture.componentRef.setInput('clusterCount', 1);
    fixture.detectChanges();

    expect(host.querySelector('.nvs-map-marker__pin')).toBeTruthy();
  });
});
