import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type { User } from '@core/models';
import { AuthApi } from './auth.api';
import type { LoginCredentials } from './auth.models';

export const AUTH_STORAGE_KEY = 'nvs.session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(AuthApi);
  private readonly storage = isPlatformBrowser(inject(PLATFORM_ID)) ? sessionStorage : null;

  private readonly _user = signal<User | null>(this.restoreSession());

  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);

  async login(credentials: LoginCredentials): Promise<User> {
    const user = await this.api.login(credentials);
    this._user.set(user);
    this.storage?.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    return user;
  }

  logout(): void {
    this._user.set(null);
    this.storage?.removeItem(AUTH_STORAGE_KEY);
  }

  private restoreSession(): User | null {
    try {
      const raw = this.storage?.getItem(AUTH_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }
}
