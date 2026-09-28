import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  provideRouter,
  Router,
  UrlTree,
  type ActivatedRouteSnapshot,
  type RouterStateSnapshot,
} from '@angular/router';
import { authGuard, guestGuard } from './auth.guards';
import { AuthService } from './auth.service';

describe('auth guards', () => {
  const isAuthenticated = signal(false);

  beforeEach(() => {
    isAuthenticated.set(false);
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: { isAuthenticated } }],
    });
  });

  function run(guard: typeof authGuard, url = '/cases/1042') {
    return TestBed.runInInjectionContext(() =>
      guard({} as ActivatedRouteSnapshot, { url } as RouterStateSnapshot),
    );
  }

  function serialize(result: unknown): string {
    expect(result).toBeInstanceOf(UrlTree);
    return TestBed.inject(Router).serializeUrl(result as UrlTree);
  }

  it('authGuard redirects guests to login keeping the requested url', () => {
    expect(serialize(run(authGuard))).toBe('/login?returnUrl=%2Fcases%2F1042');
  });

  it('authGuard lets authenticated users in', () => {
    isAuthenticated.set(true);

    expect(run(authGuard)).toBe(true);
  });

  it('guestGuard lets guests in', () => {
    expect(run(guestGuard)).toBe(true);
  });

  it('guestGuard sends authenticated users home', () => {
    isAuthenticated.set(true);

    expect(serialize(run(guestGuard))).toBe('/');
  });
});
