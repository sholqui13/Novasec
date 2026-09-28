import { DestroyRef, DOCUMENT, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type SystemStatus = 'online' | 'offline';

@Injectable({ providedIn: 'root' })
export class SystemStatusService {
  private readonly _status = signal<SystemStatus>('online');

  readonly status = this._status.asReadonly();

  constructor() {
    const window = inject(DOCUMENT).defaultView;
    if (!isPlatformBrowser(inject(PLATFORM_ID)) || !window) {
      return;
    }

    const update = () => this._status.set(window.navigator.onLine ? 'online' : 'offline');
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    inject(DestroyRef).onDestroy(() => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    });
  }
}
