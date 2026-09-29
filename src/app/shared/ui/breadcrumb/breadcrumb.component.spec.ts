import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BreadcrumbComponent } from './breadcrumb.component';

describe('BreadcrumbComponent', () => {
  let fixture: ComponentFixture<BreadcrumbComponent>;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BreadcrumbComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(BreadcrumbComponent);
    host = fixture.nativeElement;
    fixture.componentRef.setInput('items', [
      { label: 'Dashboard', link: '/' },
      { label: 'Casos', link: '/cases' },
      { label: 'Caso #1042' },
    ]);
    fixture.detectChanges();
  });

  it('is a labelled navigation landmark with an ordered list', () => {
    expect(host.querySelector('nav')?.getAttribute('aria-label')).toBe('Ruta de navegación');
    expect(host.querySelectorAll('ol > li')).toHaveLength(3);
  });

  it('links every level except the current page', () => {
    const links = Array.from(host.querySelectorAll('a'));

    expect(links.map((link) => link.textContent?.trim())).toEqual(['Dashboard', 'Casos']);
    expect(links.map((link) => link.getAttribute('href'))).toEqual(['/', '/cases']);
  });

  it('marks the last level as the current page', () => {
    const current = host.querySelector('[aria-current="page"]');

    expect(current?.textContent?.trim()).toBe('Caso #1042');
    expect(current?.tagName).toBe('SPAN');
  });

  it('hides the separators from assistive technology', () => {
    const separators = Array.from(host.querySelectorAll('.nvs-breadcrumb__separator'));

    expect(separators).toHaveLength(2);
    expect(separators.every((item) => item.getAttribute('aria-hidden') === 'true')).toBe(true);
  });
});
