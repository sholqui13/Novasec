import { booleanAttribute, Component, computed, input, output, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { CasesMapComponent } from '@features/cases/components/cases-map';
import type { Case } from '@features/cases/models';
import { CasesService, FAKE_CASES } from '@features/cases/services';
import { DashboardPageComponent } from './dashboard-page.component';

@Component({ selector: 'nvs-cases-map', template: '' })
class CasesMapStubComponent {
  readonly imageUrl = input('');
  readonly cases = input<readonly Case[]>([]);
  readonly selectedId = input<string | null>(null);
  readonly summary = input(false, { transform: booleanAttribute });
  readonly lastUpdated = input<Date | null>(null);
  readonly selected = output<Case>();
}

describe('DashboardPageComponent', () => {
  let fixture: ComponentFixture<DashboardPageComponent>;
  let host: HTMLElement;
  const selectedId = signal<string | null>(null);
  const loading = signal(false);
  const error = signal(false);
  const activeCases = signal<readonly Case[]>([]);
  const searchTerm = signal('');
  const load = vi.fn();

  const casesStub = {
    activeCases,
    searchResults: activeCases,
    searchTerm,
    loading,
    error,
    load,
    lastUpdated: signal(new Date('2026-09-26T03:18:00')),
    selectedCase: computed(() => FAKE_CASES.find((item) => item.id === selectedId()) ?? null),
    select: (id: string | null) => selectedId.set(id),
  };

  beforeEach(async () => {
    selectedId.set(null);
    loading.set(false);
    error.set(false);
    activeCases.set(FAKE_CASES.filter((item) => item.mapPosition));
    searchTerm.set('');
    load.mockReset();

    await TestBed.configureTestingModule({
      imports: [DashboardPageComponent],
      providers: [
        provideRouter([]),
        { provide: CasesService, useValue: casesStub },
      ],
    })
      .overrideComponent(DashboardPageComponent, {
        remove: { imports: [CasesMapComponent] },
        add: { imports: [CasesMapStubComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(DashboardPageComponent);
    host = fixture.nativeElement;
    fixture.detectChanges();
  });

  function map(): CasesMapStubComponent {
    return fixture.debugElement.query((node) => node.name === 'nvs-cases-map')
      .componentInstance as CasesMapStubComponent;
  }

  it('passes the active cases and the last update to the map', () => {
    expect(map().summary()).toBe(true);
    expect(map().lastUpdated()).toEqual(new Date('2026-09-26T03:18:00'));
    expect(map().cases()).toHaveLength(3);
    expect(map().selectedId()).toBeNull();
  });

  it('shows the empty panel until a case is selected', () => {
    const empty = host.querySelector('nvs-case-panel nvs-feedback-state');
    expect(empty?.textContent).toContain('Selecciona un caso');
    expect(empty?.textContent).toContain('Haz clic en un marcador del mapa');
  });

  it('explains the search results in the empty panel', () => {
    const empty = () => host.querySelector('nvs-case-panel nvs-feedback-state')?.textContent;

    searchTerm.set('building');
    activeCases.set(FAKE_CASES.slice(0, 2));
    fixture.detectChanges();
    expect(map().cases()).toHaveLength(2);
    expect(empty()).toContain('2 casos coinciden con “building”.');

    activeCases.set([]);
    fixture.detectChanges();
    expect(empty()).toContain('Sin resultados');
    expect(empty()).toContain('Ningún caso activo coincide con “building”.');
  });

  it('selects the case chosen on the map and shows it in the panel', () => {
    const urgentCase = FAKE_CASES.find((item) => item.number === 1038) as Case;

    map().selected.emit(urgentCase);
    fixture.detectChanges();

    expect(map().selectedId()).toBe(urgentCase.id);
    expect(host.querySelector('nvs-case-panel h2')?.textContent).toBe('Caso #1038');
  });

  it('opens the case detail from the panel', () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    selectedId.set('c-1042');
    fixture.detectChanges();

    (host.querySelector('.nvs-case-panel__action') as HTMLButtonElement).click();

    expect(navigate).toHaveBeenCalledWith(['/cases', 1042]);
  });

  it('shows the skeleton instead of the map and panel while loading', () => {
    loading.set(true);
    fixture.detectChanges();

    expect(host.querySelector('.dashboard')?.getAttribute('aria-busy')).toBe('true');
    expect(host.querySelector('[role="status"]')?.textContent).toContain('Cargando casos');
    expect(host.querySelectorAll('nvs-skeleton').length).toBeGreaterThan(0);
    expect(host.querySelector('nvs-cases-map')).toBeNull();
    expect(host.querySelector('nvs-case-panel')).toBeNull();

    loading.set(false);
    fixture.detectChanges();

    expect(host.querySelector('nvs-skeleton')).toBeNull();
    expect(host.querySelector('nvs-cases-map')).toBeTruthy();
  });

  it('shows the error state in the map area and in the panel', () => {
    error.set(true);
    fixture.detectChanges();

    expect(host.querySelector('nvs-cases-map')).toBeNull();
    expect(host.querySelector('.dashboard-error__map nvs-feedback-state')?.classList).toContain(
      'nvs-feedback-state--error',
    );
    expect(host.querySelector('.dashboard-error__panel nvs-alert')?.textContent).toContain(
      'No pudimos cargar los casos',
    );
  });

  it('retries loading from both error actions', () => {
    error.set(true);
    fixture.detectChanges();

    (host.querySelector('.nvs-feedback-state__action') as HTMLButtonElement).click();
    (host.querySelector('.dashboard-error__retry') as HTMLButtonElement).click();

    expect(load).toHaveBeenCalledTimes(2);
  });
});
