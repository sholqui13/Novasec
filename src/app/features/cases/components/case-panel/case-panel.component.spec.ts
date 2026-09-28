import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { LOCALE_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { Case } from '../../models';
import { CasePanelComponent } from './case-panel.component';

const CASE: Case = {
  id: 'c-1042',
  number: 1042,
  title: 'Unauthorized access attempt — Server Room B',
  description: 'Se detectó un intento de acceso no autorizado en la puerta de Server Room B.',
  status: 'in-progress',
  priority: 'high',
  location: 'Building C — Floor 3',
  reportedAt: '2026-09-26T03:14:00',
};

registerLocaleData(localeEs);

describe('CasePanelComponent', () => {
  let fixture: ComponentFixture<CasePanelComponent>;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CasePanelComponent],
      providers: [{ provide: LOCALE_ID, useValue: 'es' }],
    }).compileComponents();

    fixture = TestBed.createComponent(CasePanelComponent);
    host = fixture.nativeElement;
  });

  function render(inputs: Record<string, unknown>): void {
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
  }

  function feedbackState(): HTMLElement | null {
    return host.querySelector('nvs-feedback-state');
  }

  it('shows the empty state when there is no case', () => {
    render({});

    expect(feedbackState()?.classList).toContain('nvs-feedback-state--empty');
    expect(feedbackState()?.textContent).toContain('No se encontraron casos');
  });

  it('allows customizing the empty state copy', () => {
    render({ emptyTitle: 'Selecciona un caso', emptyMessage: 'Haz clic en un marcador del mapa' });

    expect(feedbackState()?.textContent).toContain('Selecciona un caso');
    expect(feedbackState()?.textContent).toContain('Haz clic en un marcador del mapa');
  });

  it('shows the case details', () => {
    render({ case: CASE });

    const article = host.querySelector('article') as HTMLElement;
    const title = host.querySelector('h2') as HTMLElement;
    expect(feedbackState()).toBeNull();
    expect(article.getAttribute('aria-labelledby')).toBe(title.id);
    expect(title.textContent).toBe('Caso #1042');
    expect(host.querySelector('nvs-case-status-badge')?.textContent).toContain('En progreso');
    expect(host.querySelector('.nvs-case-panel__summary')?.textContent).toContain('Server Room B');
    expect(host.textContent).toContain('Building C — Floor 3');
    expect(host.querySelector('time')?.textContent?.trim()).toBe('26 sept 2026 · 03:14');
    expect(host.querySelector('time')?.getAttribute('datetime')).toBe(CASE.reportedAt);
    expect(host.textContent).toContain('Se detectó un intento de acceso');
  });

  it('emits viewDetails with the case', () => {
    const viewDetails = vi.fn<(item: Case) => void>();
    fixture.componentInstance.viewDetails.subscribe(viewDetails);
    render({ case: CASE });

    (host.querySelector('.nvs-case-panel__action') as HTMLButtonElement).click();

    expect(viewDetails).toHaveBeenCalledWith(CASE);
  });

  it('prioritizes loading over the case', () => {
    render({ case: CASE, loading: true });

    expect(feedbackState()?.classList).toContain('nvs-feedback-state--loading');
    expect(host.querySelector('article')).toBeNull();
  });

  it('shows the error state and emits retry', () => {
    const retry = vi.fn<() => void>();
    fixture.componentInstance.retry.subscribe(retry);
    render({ error: true });

    expect(feedbackState()?.classList).toContain('nvs-feedback-state--error');
    (host.querySelector('.nvs-feedback-state__action') as HTMLButtonElement).click();

    expect(retry).toHaveBeenCalledOnce();
  });
});
