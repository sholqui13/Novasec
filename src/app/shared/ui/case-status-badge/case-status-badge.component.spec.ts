import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { CaseStatus } from '@core/models';
import { CASE_STATUS_CONFIG, CaseStatusBadgeComponent } from './case-status-badge.component';

describe('CaseStatusBadgeComponent', () => {
  let fixture: ComponentFixture<CaseStatusBadgeComponent>;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaseStatusBadgeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CaseStatusBadgeComponent);
    host = fixture.nativeElement;
  });

  it('maps every status to its label, variant and dot', () => {
    for (const [status, config] of Object.entries(CASE_STATUS_CONFIG)) {
      fixture.componentRef.setInput('status', status as CaseStatus);
      fixture.detectChanges();

      const badge = host.querySelector('nvs-badge') as HTMLElement;
      expect(host.classList).toContain(`nvs-case-status-badge--${status}`);
      expect(badge.classList).toContain(`nvs-badge--${config.variant}`);
      expect(badge.textContent?.trim()).toBe(config.label);
      expect(badge.querySelector('.nvs-badge__dot')).toBeTruthy();
    }
  });

  it('allows overriding the label', () => {
    fixture.componentRef.setInput('status', 'in-progress');
    fixture.componentRef.setInput('label', 'En curso');
    fixture.detectChanges();

    expect(host.textContent?.trim()).toBe('En curso');
  });
});
