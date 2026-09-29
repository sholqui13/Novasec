import { booleanAttribute, Component, input, output, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { CasesMapComponent } from '@features/cases/components/cases-map';
import type { Case } from '@features/cases/models';
import { CasesService, FAKE_CASES } from '@features/cases/services';
import { CaseDetailPageComponent } from './case-detail-page.component';

@Component({ selector: 'nvs-cases-map', template: '' })
class CasesMapStubComponent {
  readonly imageUrl = input('');
  readonly cases = input<readonly Case[]>([]);
  readonly selectedId = input<string | null>(null);
  readonly summary = input(false, { transform: booleanAttribute });
  readonly lastUpdated = input<Date | null>(null);
  readonly selected = output<Case>();
}

describe('CaseDetailPageComponent', () => {
  let fixture: ComponentFixture<CaseDetailPageComponent>;
  let host: HTMLElement;
  const cases = signal<readonly Case[]>([]);
  const loading = signal(false);
  const error = signal(false);
  const load = vi.fn();

  const casesStub = {
    cases,
    loading,
    error,
    load,
    lastUpdated: signal<Date | null>(null),
    activeCases: () => cases().filter((item) => !['resolved', 'closed'].includes(item.status)),
  };

  async function setup(id: string): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [CaseDetailPageComponent],
      providers: [provideRouter([]), { provide: CasesService, useValue: casesStub }],
    })
      .overrideComponent(CaseDetailPageComponent, {
        remove: { imports: [CasesMapComponent] },
        add: { imports: [CasesMapStubComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(CaseDetailPageComponent);
    host = fixture.nativeElement;
    fixture.componentRef.setInput('id', id);
    fixture.detectChanges();
  }

  function map(): CasesMapStubComponent {
    return fixture.debugElement.query((node) => node.name === 'nvs-cases-map')
      .componentInstance as CasesMapStubComponent;
  }

  beforeEach(() => {
    cases.set(FAKE_CASES);
    loading.set(false);
    error.set(false);
    load.mockReset();
  });

  it('shows the breadcrumb back to the dashboard', async () => {
    await setup('1042');

    expect(host.querySelector('nvs-breadcrumb a')?.getAttribute('href')).toBe('/');
    expect(host.querySelector('[aria-current="page"]')?.textContent?.trim()).toBe('Caso #1042');
  });

  it('shows the case header, card, description, notice and information', async () => {
    await setup('1042');

    expect(host.querySelector('.case-detail__eyebrow')?.textContent).toContain(
      'Caso #1042 · Incidente de acceso',
    );
    expect(host.querySelector('h2')?.textContent).toBe(
      'Unauthorized access attempt — Server Room B',
    );
    expect(host.querySelector('nvs-case-card')?.classList).toContain('nvs-case-card--active');
    expect(host.querySelector('nvs-case-card button')).toBeNull();
    expect(host.querySelector('.case-detail__description')?.textContent).toContain('46 segundos');
    expect(host.querySelector('nvs-alert')?.textContent).toContain('Validación de credenciales');
    expect(host.querySelector('nvs-case-information')).toBeTruthy();
  });

  it('focuses the case on the map and opens other cases from it', async () => {
    await setup('1042');
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const other = FAKE_CASES.find((item) => item.number === 1038) as Case;

    expect(map().selectedId()).toBe('c-1042');
    expect(map().summary()).toBe(true);

    map().selected.emit(other);
    expect(navigate).toHaveBeenCalledWith(['/cases', 1038]);
  });

  it('keeps an inactive case on the map', async () => {
    await setup('1041');

    expect(map().cases().map((item) => item.number)).toContain(1041);
  });

  it('shows the loading state while cases load', async () => {
    cases.set([]);
    loading.set(true);
    await setup('1042');

    expect(host.querySelector('nvs-feedback-state')?.classList).toContain(
      'nvs-feedback-state--loading',
    );
  });

  it('shows a not found state with a way back', async () => {
    await setup('9999');
    const navigateByUrl = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);

    const empty = host.querySelector('nvs-feedback-state');
    expect(empty?.textContent).toContain('Caso no encontrado');
    expect(empty?.textContent).toContain('#9999');

    (host.querySelector('.nvs-feedback-state__action') as HTMLButtonElement).click();
    expect(navigateByUrl).toHaveBeenCalledWith('/');
  });
});
