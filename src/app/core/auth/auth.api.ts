import { Injectable } from '@angular/core';
import type { User } from '@core/models';
import type { LoginCredentials } from './auth.models';
import { FakeAuthApi } from './fake-auth.api';

// Para conectar un backend real, cambia `useClass` por una implementación HTTP.
@Injectable({ providedIn: 'root', useClass: FakeAuthApi })
export abstract class AuthApi {
  abstract login(credentials: LoginCredentials): Promise<User>;
}
