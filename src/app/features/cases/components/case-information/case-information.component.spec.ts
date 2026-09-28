import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { LOCALE_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { Case } from '../../models';
import { CaseInformationComponent } from './case-information.component';

const CASE: Case = {
  id: 'c-1042',
  number: 1042,
  title: 'Unauthorized access attempt — Server Room B',
  description: 'Security alert triggered at 03:14 AM.',
  status: 'in-progress',
  priority: 'high',
  location: 'Building C — Floor 3',
  reportedAt: '2026-09-26T03:14:00',
  assignee: { id: 'u-001', name: 'María Álvarez', initials: 'MA' },
};

registerLocaleData(localeEs);

describe('CaseInformationComponent', () => {
  let fixture: ComponentFixture<CaseInformationComponent>;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaseInformationComponent],
      providers: [{ provide: LOCALE_ID, useValue: 'es' }],
    }).compileComponents();

    fixture = TestBed.createComponent(CaseInformationComponent);
    host = fixture.nativeElement;
    fixture.componentRef.setInput('case', CASE);
    fixture.detectChanges();
  });

  function rows(): Record<string, string> {
    return Object.fromEntries(
      Array.from(host.querySelectorAll('.nvs-case-information__row')).map((row) => [
        row.querySelector('dt')?.textContent?.trim() ?? '',
        row.querySelector('dd')?.textContent?.trim() ?? '',
      ]),
    );
  }

  it('is a section labelled by its title', () => {
    const section = host.querySelector('section') as HTMLElement;
    const title = host.querySelector('h2') as HTMLElement;

    expect(title.textContent).toBe('Información del caso');
    expect(section.getAttribute('aria-labelledby')).toBe(title.id);
  });

  it('lists the case information as label/value pairs', () => {
    expect(rows()).toEqual({
      'Número de caso': '#1042',
      Estado: 'En progreso',
      Prioridad: 'Alta',
      Responsable: 'María Álvarez',
      Ubicación: 'Building C — Floor 3',
      Apertura: '26 sept 2026 · 03:14',
    });
    expect(host.querySelector('time')?.getAttribute('datetime')).toBe(CASE.reportedAt);
  });

  it('shows when the case is unassigned', () => {
    fixture.componentRef.setInput('case', { ...CASE, assignee: undefined });
    fixture.detectChanges();

    expect(rows()['Responsable']).toBe('Sin asignar');
  });
});
