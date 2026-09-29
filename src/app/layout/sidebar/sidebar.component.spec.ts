import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import type { User } from '@core/models';
import { SidebarComponent } from './sidebar.component';
import type { NavSection } from './sidebar.models';

@Component({ template: '' })
class PageStubComponent {}

const USER: User = {
  id: 'u-001',
  username: 'm.alvarez',
  name: 'María Álvarez',
  email: 'analista@novasec.com',
  role: 'analyst',
  jobTitle: 'Senior Analyst',
  initials: 'MA',
};

const SECTIONS: readonly NavSection[] = [
  {
    label: 'Main',
    items: [
      { label: 'Dashboard', icon: 'dashboard', path: '/', exact: true },
      { label: 'Cases', icon: 'clipboard', path: '/cases', badge: 3 },
    ],
  },
  { items: [{ label: 'Settings', icon: 'settings', path: '/settings' }] },
];

describe('SidebarComponent', () => {
  let fixture: ComponentFixture<SidebarComponent>;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [
        provideRouter([
          { path: '', component: PageStubComponent },
          { path: 'cases', component: PageStubComponent },
          { path: 'settings', component: PageStubComponent },
        ]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    host = fixture.nativeElement;
    fixture.componentRef.setInput('sections', SECTIONS);
    fixture.componentRef.setInput('user', USER);
    fixture.detectChanges();
  });

  function links(): HTMLAnchorElement[] {
    return Array.from(host.querySelectorAll('a.nvs-sidebar__link'));
  }

  it('renders the profile, search and navigation when expanded', () => {
    expect(host.classList).toContain('nvs-sidebar--dark');
    expect(host.querySelector('.nvs-sidebar__user-name')?.textContent).toBe('María Álvarez');
    expect(host.querySelector('.nvs-sidebar__user-role')?.textContent).toBe('Senior Analyst');
    expect(host.querySelector('form[role="search"]')).toBeTruthy();
    expect(host.querySelector('nav')?.getAttribute('aria-label')).toBe('Navegación principal');
    expect(host.querySelector('.nvs-sidebar__section-label')?.textContent).toBe('Main');
    expect(links().map((link) => link.querySelector('.nvs-sidebar__label')?.textContent)).toEqual([
      'Dashboard',
      'Cases',
      'Settings',
    ]);
    expect(links()[1].querySelector('.nvs-sidebar__badge')?.textContent).toBe('3');
    expect(links()[1].querySelector('.nvs-sidebar__sr-only')?.textContent).toContain('3 pendientes');
  });

  it('marks the active route with aria-current', async () => {
    await TestBed.inject(Router).navigateByUrl('/cases');
    fixture.detectChanges();

    const [dashboard, cases] = links();
    expect(cases.classList).toContain('nvs-sidebar__link--active');
    expect(cases.getAttribute('aria-current')).toBe('page');
    expect(dashboard.hasAttribute('aria-current')).toBe(false);
  });

  it('collapses into a rail with an avatar button to expand', () => {
    const toggled = vi.fn<() => void>();
    fixture.componentInstance.toggle.subscribe(toggled);
    fixture.componentRef.setInput('collapsed', true);
    fixture.detectChanges();

    const expand = host.querySelector('.nvs-sidebar__avatar-button') as HTMLButtonElement;
    expect(host.classList).toContain('nvs-sidebar--collapsed');
    expect(host.querySelector('form[role="search"]')).toBeNull();
    expect(expand.getAttribute('aria-label')).toBe('Expandir menú');
    expect(links()[0].getAttribute('title')).toBe('Dashboard');

    expand.click();
    expect(toggled).toHaveBeenCalledOnce();
  });

  it('expands the rail when clicking any navigation option, but not when expanded', () => {
    const toggled = vi.fn<() => void>();
    fixture.componentInstance.toggle.subscribe(toggled);
    fixture.componentRef.setInput('collapsed', true);
    fixture.detectChanges();

    links()[1].click();
    expect(toggled).toHaveBeenCalledOnce();

    fixture.componentRef.setInput('collapsed', false);
    fixture.detectChanges();
    links()[1].click();
    expect(toggled).toHaveBeenCalledOnce();
  });

  it('labels the arrow as close when used as a drawer', () => {
    const arrow = () => host.querySelector('.nvs-sidebar__collapse') as HTMLButtonElement;
    expect(arrow().getAttribute('aria-label')).toBe('Contraer menú');

    fixture.componentRef.setInput('drawer', true);
    fixture.detectChanges();

    expect(arrow().getAttribute('aria-label')).toBe('Cerrar menú');
  });

  it('emits the trimmed search term on submit', () => {
    const searched = vi.fn<(term: string) => void>();
    fixture.componentInstance.search.subscribe(searched);
    const input = host.querySelector('input[type="search"]') as HTMLInputElement;
    const form = host.querySelector('form') as HTMLFormElement;

    input.value = '   ';
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    expect(searched).not.toHaveBeenCalled();

    input.value = '  1042 ';
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    expect(searched).toHaveBeenCalledWith('1042');
  });

  it('shows the active term and emits an empty search when the field is cleared', () => {
    const searched = vi.fn<(term: string) => void>();
    fixture.componentInstance.search.subscribe(searched);
    fixture.componentRef.setInput('searchTerm', '1042');
    fixture.detectChanges();
    const input = host.querySelector('input[type="search"]') as HTMLInputElement;
    expect(input.value).toBe('1042');

    input.value = '10';
    input.dispatchEvent(new Event('input'));
    expect(searched).not.toHaveBeenCalled();

    input.value = '';
    input.dispatchEvent(new Event('input'));
    expect(searched).toHaveBeenCalledWith('');
  });

  it('emits logout', () => {
    const loggedOut = vi.fn<() => void>();
    fixture.componentInstance.logout.subscribe(loggedOut);

    (host.querySelector('button.nvs-sidebar__link') as HTMLButtonElement).click();

    expect(loggedOut).toHaveBeenCalledOnce();
  });

  it('supports the light theme', () => {
    fixture.componentRef.setInput('theme', 'light');
    fixture.detectChanges();

    expect(host.classList).toContain('nvs-sidebar--light');
  });
});
