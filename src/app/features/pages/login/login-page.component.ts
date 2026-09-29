import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, HOME_PATH, InvalidCredentialsError } from '@core/auth';
import { AlertComponent } from '@shared/ui/alert';
import { ButtonComponent } from '@shared/ui/button';
import { InputComponent } from '@shared/ui/input';

export const APP_VERSION = '1.0';

const INVALID_CREDENTIALS_MESSAGE =
  'El usuario o la contraseña no son correctos. Verifica los datos e inténtalo de nuevo.';
const UNEXPECTED_ERROR_MESSAGE = 'Ocurrió un error inesperado. Inténtalo de nuevo en unos minutos.';

@Component({
  selector: 'nvs-login-page',
  imports: [ReactiveFormsModule, AlertComponent, ButtonComponent, InputComponent],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPageComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly version = APP_VERSION;

  protected readonly form = inject(NonNullableFormBuilder).group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  protected readonly loading = signal(false);
  protected readonly submitted = signal(false);
  protected readonly authError = signal('');
  private readonly invalidCredentials = signal(false);

  private readonly formValue = toSignal(this.form.valueChanges);

  protected readonly usernameError = computed(
    () =>
      this.requiredError('username', 'Ingresa tu usuario.') ||
      (this.invalidCredentials() ? 'Usuario no reconocido.' : ''),
  );
  protected readonly passwordError = computed(
    () =>
      this.requiredError('password', 'Ingresa tu contraseña.') ||
      (this.invalidCredentials() ? 'Revisa tus credenciales.' : ''),
  );

  constructor() {
    this.form.valueChanges.subscribe(() => {
      this.authError.set('');
      this.invalidCredentials.set(false);
    });
  }

  protected async submit(): Promise<void> {
    this.submitted.set(true);
    if (this.form.invalid || this.loading()) {
      return;
    }

    this.loading.set(true);
    this.form.disable({ emitEvent: false });
    try {
      await this.auth.login(this.form.getRawValue());
      await this.router.navigateByUrl(this.returnUrl());
    } catch (error) {
      const invalidCredentials = error instanceof InvalidCredentialsError;
      this.invalidCredentials.set(invalidCredentials);
      this.authError.set(
        invalidCredentials ? INVALID_CREDENTIALS_MESSAGE : UNEXPECTED_ERROR_MESSAGE,
      );
    } finally {
      this.form.enable({ emitEvent: false });
      this.loading.set(false);
    }
  }

  private requiredError(control: 'username' | 'password', message: string): string {
    this.formValue();
    return this.submitted() && this.form.controls[control].hasError('required') ? message : '';
  }

  private returnUrl(): string {
    const url = this.route.snapshot.queryParamMap.get('returnUrl');
    return url?.startsWith('/') && !url.startsWith('//') ? url : HOME_PATH;
  }
}
