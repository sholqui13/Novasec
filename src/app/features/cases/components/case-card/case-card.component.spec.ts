import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { Case } from '../../models';
import { CaseCardComponent } from './case-card.component';

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

describe('CaseCardComponent', () => {
  let fixture: ComponentFixture<CaseCardComponent>;
  let host: HTMLElement;
  let selected: ReturnType<typeof vi.fn<(item: Case) => void>>;
  let viewDetails: ReturnType<typeof vi.fn<(item: Case) => void>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaseCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CaseCardComponent);
    host = fixture.nativeElement;
    selected = vi.fn();
    viewDetails = vi.fn();
    fixture.componentInstance.selected.subscribe(selected);
    fixture.componentInstance.viewDetails.subscribe(viewDetails);
    fixture.componentRef.setInput('case', CASE);
    fixture.detectChanges();
  });

  function trigger(): HTMLButtonElement {
    return host.querySelector('.nvs-case-card__trigger') as HTMLButtonElement;
  }

  it('renders the full card in comfortable density', () => {
    expect(host.classList).toContain('nvs-case-card--comfortable');
    expect(host.querySelector('.nvs-case-card__number')?.textContent).toBe('#1042');
    expect(host.querySelector('nvs-case-status-badge')?.textContent).toContain('En progreso');
    expect(host.querySelector('h3')?.textContent).toContain('Server Room B');
    expect(host.querySelector('.nvs-case-card__description')?.textContent).toContain('03:14 AM');
    expect(host.querySelector('.nvs-case-card__location')?.textContent).toContain('Building C');
    expect(host.querySelector('.nvs-case-card__assignee')?.textContent).toContain('María');
    expect(host.querySelector('nvs-avatar')?.classList).toContain('nvs-avatar--dark');
  });

  it('shows only the header and title in compact density', () => {
    fixture.componentRef.setInput('density', 'compact');
    fixture.detectChanges();

    expect(host.classList).toContain('nvs-case-card--compact');
    expect(host.querySelector('h3')).toBeTruthy();
    expect(host.querySelector('.nvs-case-card__description')).toBeNull();
    expect(host.querySelector('.nvs-case-card__footer')).toBeNull();
  });

  it('omits the assignee when the case is unassigned', () => {
    fixture.componentRef.setInput('case', { ...CASE, assignee: undefined });
    fixture.detectChanges();

    expect(host.querySelector('.nvs-case-card__assignee')).toBeNull();
  });

  it('emits selected on the first click', () => {
    expect(trigger().getAttribute('aria-pressed')).toBe('false');

    trigger().click();

    expect(selected).toHaveBeenCalledWith(CASE);
    expect(viewDetails).not.toHaveBeenCalled();
  });

  it('emits viewDetails when the card is already active', () => {
    fixture.componentRef.setInput('active', true);
    fixture.detectChanges();
    expect(host.classList).toContain('nvs-case-card--active');
    expect(trigger().getAttribute('aria-pressed')).toBe('true');

    trigger().click();

    expect(viewDetails).toHaveBeenCalledWith(CASE);
    expect(selected).not.toHaveBeenCalled();
  });
});
