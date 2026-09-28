import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BadgeComponent } from './badge.component';

describe('BadgeComponent', () => {
  let fixture: ComponentFixture<BadgeComponent>;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BadgeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BadgeComponent);
    host = fixture.nativeElement;
  });

  it('renders the label with the neutral variant by default', () => {
    fixture.componentRef.setInput('label', 'Default');
    fixture.detectChanges();

    expect(host.classList).toContain('nvs-badge');
    expect(host.classList).toContain('nvs-badge--neutral');
    expect(host.textContent).toContain('Default');
    expect(host.querySelector('.nvs-badge__dot')).toBeNull();
  });

  it('shows the dot by default for status variants', () => {
    for (const variant of ['info', 'success', 'warning', 'error'] as const) {
      fixture.componentRef.setInput('variant', variant);
      fixture.detectChanges();

      expect(host.classList).toContain(`nvs-badge--${variant}`);
      expect(host.querySelector('.nvs-badge__dot')).toBeTruthy();
    }
  });

  it('lets the dot be overridden explicitly', () => {
    fixture.componentRef.setInput('variant', 'dark');
    fixture.componentRef.setInput('dot', true);
    fixture.detectChanges();
    expect(host.querySelector('.nvs-badge__dot')).toBeTruthy();

    fixture.componentRef.setInput('variant', 'success');
    fixture.componentRef.setInput('dot', false);
    fixture.detectChanges();
    expect(host.querySelector('.nvs-badge__dot')).toBeNull();
  });

  it('hides the dot from assistive technology', () => {
    fixture.componentRef.setInput('variant', 'info');
    fixture.detectChanges();

    expect(host.querySelector('.nvs-badge__dot')?.getAttribute('aria-hidden')).toBe('true');
  });
});
