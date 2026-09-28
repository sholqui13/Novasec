import { Injectable } from '@angular/core';
import type { User } from '@core/models';
import type { AuthApi } from './auth.api';
import { InvalidCredentialsError, type LoginCredentials } from './auth.models';

export const FAKE_AUTH_DELAY = 800;

export const FAKE_USERS: readonly { readonly password: string; readonly user: User }[] = [
  {
    password: 'novasec123',
    user: {
      id: 'u-001',
      username: 'm.alvarez',
      name: 'María Álvarez',
      email: 'analista@novasec.com',
      role: 'analyst',
      jobTitle: 'Senior Analyst',
      initials: 'MA',
    },
  },
  {
    password: 'novasec123',
    user: {
      id: 'u-002',
      username: 'j.perez',
      name: 'Juan Pérez',
      email: 'supervisor@novasec.com',
      role: 'supervisor',
      jobTitle: 'Operations Supervisor',
      initials: 'JP',
    },
  },
];

@Injectable({ providedIn: 'root' })
export class FakeAuthApi implements AuthApi {
  async login({ username, password }: LoginCredentials): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, FAKE_AUTH_DELAY));

    const match = FAKE_USERS.find(
      (entry) =>
        entry.user.username === username.trim().toLowerCase() &&
        entry.password === password,
    );
    if (!match) {
      throw new InvalidCredentialsError();
    }
    return match.user;
  }
}
