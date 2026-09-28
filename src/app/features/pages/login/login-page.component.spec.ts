import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { AuthService, InvalidCredentialsError } from '@core/auth';
import { LoginPageComponent } from './login-page.component';

describe('LoginPageComponent', () => {
  let fixture: ComponentFixture<LoginPageComponent>;
  let host: HTMLElement;
  let login: ReturnType<typeof vi.fn>;
  let navigateByUrl: ReturnType<typeof vi.spyOn>;

  async function setup(queryParams: Record<string, string> = {}): Promise<void> {
    login = vi.fn();
    await TestBed.configureTestingModule({
      imports: [LoginPageComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { login } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap(queryParams) } },
        },
      ],
    }).compileComponents();

    navigateByUrl = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    fixture = TestBed.createComponent(LoginPageComponent);
    host = fixture.nativeElement;
    fixture.detectChanges();
  }

  function inputs(): HTMLInputElement[] {
    return Array.from(host.querySelectorAll('input'));
  }

  function type(input: HTMLInputElement, value: string): void {
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  async function submit(): Promise<void> {
    host.querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('renders the card with username and password fields', async () => {
    await setup();
    const [username, password] = inputs();

    expect(host.querySelector('h1')?.textContent).toContain('Accede a Novasec');
    expect(username.getAttribute('autocomplete')).toBe('username');
    expect(password.type).toBe('password');
    expect(password.getAttribute('autocomplete')).toBe('current-password');
  });

  it('shows required errors only after submitting', async () => {
    await setup();
    expect(host.textContent).not.toContain('Ingresa tu usuario.');

    await submit();

    expect(host.textContent).toContain('Ingresa tu usuario.');
    expect(host.textContent).toContain('Ingresa tu contraseña.');
    expect(login).not.toHaveBeenCalled();
  });

  it('logs in and navigates to the return url', async () => {
    await setup({ returnUrl: '/cases/1042' });
    login.mockResolvedValue({});
    const [username, password] = inputs();
    type(username, 'm.alvarez');
    type(password, 'novasec123');

    await submit();

    expect(login).toHaveBeenCalledWith({ username: 'm.alvarez', password: 'novasec123' });
    expect(navigateByUrl).toHaveBeenCalledWith('/cases/1042');
  });

  it('ignores external return urls', async () => {
    await setup({ returnUrl: '//evil.com' });
    login.mockResolvedValue({});
    const [username, password] = inputs();
    type(username, 'm.alvarez');
    type(password, 'novasec123');

    await submit();

    expect(navigateByUrl).toHaveBeenCalledWith('/');
  });

  it('shows an alert for invalid credentials and hides it when typing again', async () => {
    await setup();
    login.mockRejectedValue(new InvalidCredentialsError());
    const [username, password] = inputs();
    type(username, 'm.alvarez');
    type(password, 'wrong');

    await submit();

    const alert = host.querySelector('nvs-alert');
    expect(alert?.textContent).toContain('No pudimos iniciar sesión');
    expect(alert?.getAttribute('role')).toBe('alert');
    expect(navigateByUrl).not.toHaveBeenCalled();

    type(password, 'novasec123');
    fixture.detectChanges();
    expect(host.querySelector('nvs-alert')).toBeNull();
  });
});
