import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from '@core/auth';
import { BreakpointService, type Viewport } from '@core/services';
import type { Case } from '@features/cases/models';
import { CasesService, FAKE_CASES } from '@features/cases/services';
import { AppShellComponent } from './app-shell.component';

@Component({ template: '<p class="page">Contenido</p>' })
class PageStubComponent {}

describe('AppShellComponent', () => {
  let fixture: ComponentFixture<AppShellComponent>;
  let host: HTMLElement;
  const viewport = signal<Viewport>('desktop');
  const logout = vi.fn();
  const activeCases = signal<readonly Case[]>([]);
  const loadCases = vi.fn();
  const setSearch = vi.fn();

  beforeAll(() => {
    const proto = HTMLDialogElement.prototype;
    proto.showModal ??= function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
    };
    proto.close ??= function (this: HTMLDialogElement) {
      this.removeAttribute('open');
      this.dispatchEvent(new Event('close'));
    };
  });

  beforeEach(async () => {
    viewport.set('desktop');
    logout.mockReset();
    loadCases.mockReset();
    setSearch.mockReset();
    activeCases.set([]);

    await TestBed.configureTestingModule({
      imports: [AppShellComponent],
      providers: [
        provideRouter([
          { path: '', component: PageStubComponent, data: { pageTitle: 'Dashboard' } },
          { path: 'otra', component: PageStubComponent, data: { pageTitle: 'Casos' } },
          { path: 'login', component: PageStubComponent },
        ]),
        { provide: AuthService, useValue: { user: signal(null), logout } },
        { provide: BreakpointService, useValue: { viewport } },
        { provide: CasesService, useValue: { activeCases, load: loadCases, searchTerm: signal(''), setSearch } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppShellComponent);
    host = fixture.nativeElement;
    fixture.detectChanges();
  });

  function query<T extends HTMLElement>(selector: string): T {
    return host.querySelector(selector) as T;
  }

  function click(selector: string): void {
    query(selector).click();
    fixture.detectChanges();
  }

  function useMobile(): void {
    viewport.set('mobile');
    fixture.detectChanges();
  }

  it('renders the sidebar, header and the routed page inside main', async () => {
    await TestBed.inject(Router).navigateByUrl('/');
    fixture.detectChanges();

    expect(query('nvs-sidebar nav').getAttribute('aria-label')).toBe('Navegación principal');
    expect(query('nvs-header h1').textContent).toBe('Dashboard');
    expect(query('main#main-content .page').textContent).toBe('Contenido');
  });

  it('moves focus to main from the skip link', () => {
    query('.app-shell__skip-link').click();

    expect(document.activeElement).toBe(query('main'));
  });

  it('starts as a rail on desktop, expands from the avatar and collapses from the arrow', () => {
    expect(host.classList).toContain('app-shell--collapsed');
    expect(query('nvs-sidebar').classList).toContain('nvs-sidebar--collapsed');

    click('.nvs-sidebar__avatar-button');
    expect(host.classList).not.toContain('app-shell--collapsed');
    expect(document.activeElement).toBe(query('.nvs-sidebar__collapse'));

    click('.nvs-sidebar__collapse');
    expect(host.classList).toContain('app-shell--collapsed');
  });

  it('opens the mobile drawer expanded, inerts the page and moves focus into it', () => {
    useMobile();
    click('.nvs-header__menu');

    expect(host.classList).toContain('app-shell--nav-open');
    expect(query('nvs-sidebar').classList).not.toContain('nvs-sidebar--collapsed');
    expect(query('.nvs-header__menu').getAttribute('aria-expanded')).toBe('true');
    expect(query('main').inert).toBe(true);
    expect(document.activeElement).toBe(query('.nvs-sidebar__collapse'));
    expect(query('.nvs-sidebar__collapse').getAttribute('aria-label')).toBe('Cerrar menú');
  });

  it('closes the mobile drawer from its arrow and returns focus to the menu button', () => {
    useMobile();
    click('.nvs-header__menu');

    click('.nvs-sidebar__collapse');

    expect(host.classList).not.toContain('app-shell--nav-open');
    expect(query('main').inert).toBe(false);
    expect(document.activeElement).toBe(query('.nvs-header__menu'));
  });

  it('closes the mobile drawer with Escape', () => {
    useMobile();
    click('.nvs-header__menu');

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(host.classList).not.toContain('app-shell--nav-open');
    expect(document.activeElement).toBe(query('.nvs-header__menu'));
  });

  it('closes the mobile drawer when clicking the backdrop', () => {
    useMobile();
    click('.nvs-header__menu');

    click('.app-shell__backdrop');

    expect(host.classList).not.toContain('app-shell--nav-open');
  });

  it('closes the mobile drawer after navigating', async () => {
    useMobile();
    click('.nvs-header__menu');

    await TestBed.inject(Router).navigateByUrl('/otra');
    fixture.detectChanges();

    expect(host.classList).not.toContain('app-shell--nav-open');
  });

  it('shows the title declared by the active route in the header', async () => {
    const router = TestBed.inject(Router);

    await router.navigateByUrl('/otra');
    fixture.detectChanges();

    expect(query('nvs-header h1').textContent).toBe('Casos');
  });

  it('loads the cases and shows the active count on the Cases item', () => {
    const casesBadge = () =>
      host.querySelector('a[href="/cases"] .nvs-sidebar__badge')?.textContent?.trim();
    expect(loadCases).toHaveBeenCalledOnce();
    expect(casesBadge()).toBeUndefined();

    activeCases.set(FAKE_CASES.slice(0, 3));
    fixture.detectChanges();

    expect(casesBadge()).toBe('3');
  });

  it('searches cases and shows the results on the dashboard', async () => {
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/otra');
    const navigate = vi.spyOn(router, 'navigateByUrl');
    click('.nvs-sidebar__avatar-button');
    const input = query<HTMLInputElement>('input[type="search"]');

    input.value = 'parking';
    query('form[role="search"]').dispatchEvent(new Event('submit', { cancelable: true }));

    expect(setSearch).toHaveBeenCalledWith('parking');
    expect(navigate).toHaveBeenCalledWith('/');
  });

  it('asks for confirmation before logging out', async () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl');

    click('.nvs-sidebar button.nvs-sidebar__link');
    expect(query<HTMLDialogElement>('dialog').open).toBe(true);
    expect(logout).not.toHaveBeenCalled();

    query<HTMLButtonElement>('dialog .nvs-button--danger').click();
    fixture.detectChanges();

    expect(logout).toHaveBeenCalledOnce();
    expect(navigate).toHaveBeenCalledWith('/login');
  });
});
