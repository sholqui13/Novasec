import { TestBed } from '@angular/core/testing';
import { SystemStatusService } from './system-status.service';

describe('SystemStatusService', () => {
  let onLine: boolean;

  beforeEach(() => {
    onLine = true;
    vi.spyOn(window.navigator, 'onLine', 'get').mockImplementation(() => onLine);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts from the current connection state', () => {
    onLine = false;

    expect(TestBed.inject(SystemStatusService).status()).toBe('offline');
  });

  it('follows the browser online and offline events', () => {
    const service = TestBed.inject(SystemStatusService);
    expect(service.status()).toBe('online');

    onLine = false;
    window.dispatchEvent(new Event('offline'));
    expect(service.status()).toBe('offline');

    onLine = true;
    window.dispatchEvent(new Event('online'));
    expect(service.status()).toBe('online');
  });
});
