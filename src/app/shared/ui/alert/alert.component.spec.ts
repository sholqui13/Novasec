import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlertComponent, type AlertType } from './alert.component';

describe('AlertComponent', () => {
  let fixture: ComponentFixture<AlertComponent>;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AlertComponent);
    host = fixture.nativeElement;
    fixture.componentRef.setInput('title', 'No pudimos iniciar sesión');
    fixture.componentRef.setInput(
      'message',
      'El usuario o la contraseña no son correctos. Verifica los datos e inténtalo de nuevo.',
    );
  });

  it('renders title, message and a decorative icon', () => {
    fixture.detectChanges();

    expect(host.classList).toContain('nvs-alert--info');
    expect(host.querySelector('.nvs-alert__title')?.textContent).toBe('No pudimos iniciar sesión');
    expect(host.querySelector('.nvs-alert__message')?.textContent).toContain('Verifica los datos');
    expect(host.querySelector('.nvs-alert__icon')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('uses role alert for error and warning, status otherwise', () => {
    const expected: Record<AlertType, string> = {
      info: 'status',
      success: 'status',
      warning: 'alert',
      error: 'alert',
    };

    for (const [type, role] of Object.entries(expected)) {
      fixture.componentRef.setInput('type', type);
      fixture.detectChanges();

      expect(host.classList).toContain(`nvs-alert--${type}`);
      expect(host.getAttribute('role')).toBe(role);
    }
  });

  it('does not leave a native title tooltip on the host', () => {
    host.setAttribute('title', 'No pudimos iniciar sesión');
    fixture.detectChanges();

    expect(host.hasAttribute('title')).toBe(false);
  });

  it('is not dismissible by default', () => {
    fixture.detectChanges();

    expect(host.querySelector('.nvs-alert__close')).toBeNull();
  });

  it('emits dismissed from the close button', () => {
    const dismissed = vi.fn<() => void>();
    fixture.componentInstance.dismissed.subscribe(dismissed);
    fixture.componentRef.setInput('dismissible', true);
    fixture.detectChanges();

    const close = host.querySelector('.nvs-alert__close') as HTMLButtonElement;
    expect(close.getAttribute('aria-label')).toBe('Cerrar alerta');

    close.click();
    expect(dismissed).toHaveBeenCalledOnce();
  });
});
