import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { User } from '@core/models';
import { HeaderComponent } from './header.component';

const USER: User = {
  id: 'u-001',
  username: 'm.alvarez',
  name: 'María Álvarez',
  email: 'analista@novasec.com',
  role: 'analyst',
  initials: 'MA',
};

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    host = fixture.nativeElement;
    fixture.componentRef.setInput('title', 'Dashboard');
    fixture.detectChanges();
  });

  function menuButton(): HTMLButtonElement {
    return host.querySelector('.nvs-header__menu') as HTMLButtonElement;
  }

  it('renders the page title as the h1 with the default eyebrow and status', () => {
    expect(host.querySelector('h1')?.textContent).toBe('Dashboard');
    expect(host.querySelector('.nvs-header__eyebrow')?.textContent).toBe('Security Operations');
    expect(host.querySelector('.nvs-header__status')?.textContent).toContain('Sistema activo');
    expect(host.hasAttribute('title')).toBe(false);
  });

  it('announces when the connection is lost', () => {
    const status = host.querySelector('.nvs-header__status') as HTMLElement;
    expect(status.getAttribute('role')).toBe('status');

    fixture.componentRef.setInput('status', 'offline');
    fixture.detectChanges();

    expect(status.textContent).toContain('Sin conexión');
    expect(status.classList).toContain('nvs-header__status--offline');
  });

  it('shows the user avatar only when there is a user', () => {
    expect(host.querySelector('nvs-avatar')).toBeNull();

    fixture.componentRef.setInput('user', USER);
    fixture.detectChanges();

    expect(host.querySelector('nvs-avatar')?.getAttribute('aria-label')).toBe('María Álvarez');
  });

  it('reflects the menu state and emits menuToggle', () => {
    const toggled = vi.fn<() => void>();
    fixture.componentInstance.menuToggle.subscribe(toggled);
    fixture.componentRef.setInput('menuControls', 'app-shell-sidebar');
    fixture.detectChanges();

    expect(menuButton().getAttribute('aria-expanded')).toBe('false');
    expect(menuButton().getAttribute('aria-label')).toBe('Abrir menú');
    expect(menuButton().getAttribute('aria-controls')).toBe('app-shell-sidebar');

    menuButton().click();
    expect(toggled).toHaveBeenCalledOnce();

    fixture.componentRef.setInput('menuOpen', true);
    fixture.detectChanges();
    expect(menuButton().getAttribute('aria-expanded')).toBe('true');
    expect(menuButton().getAttribute('aria-label')).toBe('Cerrar menú');
  });

  it('can move focus to the menu button', () => {
    fixture.componentInstance.focusMenuButton();

    expect(document.activeElement).toBe(menuButton());
  });
});
