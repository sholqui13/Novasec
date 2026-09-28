import { isDevMode } from '@angular/core';
import { Routes } from '@angular/router';
import { authGuard, guestGuard } from '@core/auth';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Iniciar sesión · Novasec',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/pages/login/login-page.component').then((m) => m.LoginPageComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/app-shell').then((m) => m.AppShellComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        title: 'Dashboard · Novasec',
        data: { pageTitle: 'Dashboard' },
        loadComponent: () =>
          import('./features/pages/home/home-page.component').then((m) => m.HomePageComponent),
      },
    ],
  },
  ...(isDevMode()
    ? [
        {
          path: 'dev/ui',
          loadComponent: () =>
            import('./dev/ui-showcase/ui-showcase.component').then((m) => m.UiShowcaseComponent),
        },
      ]
    : []),
  { path: '**', redirectTo: '' },
];
