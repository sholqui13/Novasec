import { TestBed } from '@angular/core/testing';
import { AuthApi } from './auth.api';
import { InvalidCredentialsError } from './auth.models';
import { FAKE_AUTH_DELAY, FAKE_USERS, FakeAuthApi } from './fake-auth.api';

describe('FakeAuthApi', () => {
  let api: AuthApi;

  beforeEach(() => {
    vi.useFakeTimers();
    api = TestBed.inject(AuthApi);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('is the default AuthApi implementation', () => {
    expect(api).toBeInstanceOf(FakeAuthApi);
  });

  it('resolves the fake user after a delay, ignoring case and spaces', async () => {
    const { user, password } = FAKE_USERS[0];
    const login = api.login({ username: `  ${user.username.toUpperCase()} `, password });

    await vi.advanceTimersByTimeAsync(FAKE_AUTH_DELAY);

    await expect(login).resolves.toEqual(user);
  });

  it('rejects wrong credentials', async () => {
    const login = api.login({ username: FAKE_USERS[0].user.username, password: 'wrong' });
    const assertion = expect(login).rejects.toBeInstanceOf(InvalidCredentialsError);

    await vi.advanceTimersByTimeAsync(FAKE_AUTH_DELAY);

    await assertion;
  });
});
