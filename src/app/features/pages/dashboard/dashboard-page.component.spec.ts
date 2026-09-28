import { Component, computed, input, output, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CasesMapComponent } from '@features/cases/components/cases-map';
import type { Case } from '@features/cases/models';
import { CasesService, FAKE_CASES } from '@features/cases/services';
import { ToastService } from '@shared/ui/toast';
import { DashboardPageComponent } from './dashboard-page.component';

@Component({ selector: 'nvs-cases-map', template: '' })
class CasesMapStubComponent {
  readonly imageUrl = input('');
  readonly cases = input<readonly Case[]>([]);
  readonly selectedId = input<string | null>(null);
  readonly selected = output<Case>();
}

describe('DashboardPageComponent', () => {
  let fixture: ComponentFixture<DashboardPageComponent>;
  let host: HTMLElement;
  const selectedId = signal<string | null>(null);
  const loading = signal(false);
  const error = signal(false);
  const activeCases = signal<readonly Case[]>([]);
  const load = vi.fn();

  const casesStub = {
    activeCases,
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
    load.mockReset();

    await TestBed.configureTestingModule({
      imports: [DashboardPageComponent],
      providers: [
        { provide: CasesService, useValue: casesStub },
        { provide: ToastService, useValue: { info: vi.fn() } },
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

  it('passes the campus image and the active cases to the map', () => {
    expect(map().imageUrl()).toBe('assets/images/map/campus-map.jpg');
    expect(map().cases()).toHaveLength(3);
    expect(map().selectedId()).toBeNull();
  });

  it('shows the active count and the last update time', () => {
    const status = host.querySelector('.dashboard__chip--status')?.textContent;

    expect(status).toContain('3 casos activos');
    expect(status).toContain('Actualizado 03:18');
  });

  it('shows the empty panel until a case is selected', () => {
    const empty = host.querySelector('nvs-case-panel nvs-feedback-state');
    expect(empty?.textContent).toContain('Selecciona un caso');
    expect(empty?.textContent).toContain('Haz clic en un marcador del mapa');
  });

  it('selects the case chosen on the map and shows it in the panel', () => {
    const urgentCase = FAKE_CASES.find((item) => item.number === 1038) as Case;

    map().selected.emit(urgentCase);
    fixture.detectChanges();

    expect(map().selectedId()).toBe(urgentCase.id);
    expect(host.querySelector('nvs-case-panel h2')?.textContent).toBe('Caso #1038');
  });

  it('retries loading from the error state', () => {
    error.set(true);
    fixture.detectChanges();

    (host.querySelector('.nvs-feedback-state__action') as HTMLButtonElement).click();

    expect(load).toHaveBeenCalledOnce();
  });
});
