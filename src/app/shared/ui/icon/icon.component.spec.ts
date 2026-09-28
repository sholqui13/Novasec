import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IconComponent } from './icon.component';
import { ICON_NAMES } from './icon-registry';

describe('IconComponent', () => {
  let fixture: ComponentFixture<IconComponent>;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(IconComponent);
    host = fixture.nativeElement;
    fixture.componentRef.setInput('name', 'search');
  });

  it('renders the SVG of the requested icon', () => {
    fixture.detectChanges();

    expect(host.classList).toContain('nvs-icon');
    expect(host.querySelector('svg')).toBeTruthy();
  });

  it('renders every icon of the catalog', () => {
    for (const name of ICON_NAMES) {
      fixture.componentRef.setInput('name', name);
      fixture.detectChanges();

      expect(host.querySelector('svg')?.children.length, name).toBeGreaterThan(0);
    }
  });

  it('inherits size and color unless they are set', () => {
    fixture.detectChanges();
    expect(host.className).toBe('nvs-icon');

    fixture.componentRef.setInput('size', 'large');
    fixture.componentRef.setInput('color', 'error');
    fixture.detectChanges();
    expect(host.classList).toContain('nvs-icon--large');
    expect(host.classList).toContain('nvs-icon--error');
  });

  it('is decorative by default', () => {
    fixture.detectChanges();

    expect(host.getAttribute('aria-hidden')).toBe('true');
    expect(host.hasAttribute('role')).toBe(false);
  });

  it('is announced when it has a label', () => {
    fixture.componentRef.setInput('label', 'Buscar');
    fixture.detectChanges();

    expect(host.getAttribute('role')).toBe('img');
    expect(host.getAttribute('aria-label')).toBe('Buscar');
    expect(host.hasAttribute('aria-hidden')).toBe(false);
  });
});
