import { DestroyRef, DOCUMENT, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// Mismos cortes que styles/mixins/_breakpoints.scss.
export const BREAKPOINTS = {
  tablet: '37.5rem',
  desktop: '64rem',
} as const;

export type Viewport = 'mobile' | 'tablet' | 'desktop';

@Injectable({ providedIn: 'root' })
export class BreakpointService {
  private readonly _viewport = signal<Viewport>('desktop');

  readonly viewport = this._viewport.asReadonly();

  constructor() {
    const window = inject(DOCUMENT).defaultView;
    if (!isPlatformBrowser(inject(PLATFORM_ID)) || !window?.matchMedia) {
      return;
    }

    const tablet = window.matchMedia(`(width >= ${BREAKPOINTS.tablet})`);
    const desktop = window.matchMedia(`(width >= ${BREAKPOINTS.desktop})`);
    const update = () =>
      this._viewport.set(desktop.matches ? 'desktop' : tablet.matches ? 'tablet' : 'mobile');

    update();
    tablet.addEventListener('change', update);
    desktop.addEventListener('change', update);
    inject(DestroyRef).onDestroy(() => {
      tablet.removeEventListener('change', update);
      desktop.removeEventListener('change', update);
    });
  }
}
