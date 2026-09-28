import { TestBed } from '@angular/core/testing';
import type { User } from '@core/models';
import { AuthApi } from './auth.api';
import { InvalidCredentialsError } from './auth.models';
import { AUTH_STORAGE_KEY, AuthService } from './auth.service';

const USER: User = {
  id: 'u-001',
  username: 'm.alvarez',
  name: 'María Álvarez',
  email: 'analista@novasec.com',
  role: 'analyst',
  initials: 'MA',
};

describe('AuthService', () => {
  let api: { login: ReturnType<typeof vi.fn> };

  function createService(): AuthService {
    TestBed.configureTestingModule({
      providers: [{ provide: AuthApi, useValue: api }],
    });
    return TestBed.inject(AuthService);
  }

  beforeEach(() => {
    sessionStorage.clear();
    api = { login: vi.fn() };
  });

  it('starts without a session', () => {
    const service = createService();

    expect(service.user()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('logs in and persists the session', async () => {
    api.login.mockResolvedValue(USER);
    const service = createService();

    await service.login({ username: USER.username, password: 'novasec123' });

    expect(service.user()).toEqual(USER);
    expect(service.isAuthenticated()).toBe(true);
    expect(JSON.parse(sessionStorage.getItem(AUTH_STORAGE_KEY)!)).toEqual(USER);
  });

  it('keeps the user logged out when credentials are invalid', async () => {
    api.login.mockRejectedValue(new InvalidCredentialsError());
    const service = createService();

    await expect(service.login({ username: 'nadie', password: 'bad' })).rejects.toBeInstanceOf(
      InvalidCredentialsError,
    );
    expect(service.isAuthenticated()).toBe(false);
    expect(sessionStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });

  it('restores the session after a reload', () => {
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(USER));

    expect(createService().user()).toEqual(USER);
  });

  it('ignores a corrupted stored session', () => {
    sessionStorage.setItem(AUTH_STORAGE_KEY, '{not json');

    expect(createService().user()).toBeNull();
  });

  it('logs out and clears the session', async () => {
    api.login.mockResolvedValue(USER);
    const service = createService();
    await service.login({ username: USER.username, password: 'novasec123' });

    service.logout();

    expect(service.isAuthenticated()).toBe(false);
    expect(sessionStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });
});
