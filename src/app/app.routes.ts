import { isDevMode } from '@angular/core';
import { Routes } from '@angular/router';

export const routes: Routes = [
  ...(isDevMode()
    ? [
        {
          path: 'dev/ui',
          loadComponent: () =>
            import('./dev/ui-showcase/ui-showcase.component').then((m) => m.UiShowcaseComponent),
        },
      ]
    : []),
];
