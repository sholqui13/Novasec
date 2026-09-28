import { TestBed } from '@angular/core/testing';
import { TOAST_DEFAULT_DURATION, ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    service = TestBed.inject(ToastService);
  });

  it('adds toasts with defaults', () => {
    service.show({ title: 'New case assigned' });

    expect(service.toasts()).toEqual([
      {
        id: 0,
        type: 'info',
        title: 'New case assigned',
        message: '',
        duration: TOAST_DEFAULT_DURATION,
      },
    ]);
  });

  it('offers a shortcut per type', () => {
    service.info('Info');
    service.success('Success');
    service.warning('Warning');
    service.error('Error', 'Failed to load case data.');

    expect(service.toasts().map((toast) => toast.type)).toEqual([
      'info',
      'success',
      'warning',
      'error',
    ]);
    expect(service.toasts()[3].message).toBe('Failed to load case data.');
  });

  it('dismisses a toast by id', () => {
    const first = service.info('First');
    service.info('Second');
    service.dismiss(first);

    expect(service.toasts().map((toast) => toast.title)).toEqual(['Second']);
  });

  it('keeps only the most recent toasts visible', () => {
    for (let i = 1; i <= 6; i++) {
      service.info(`Toast ${i}`);
    }

    expect(service.toasts().map((toast) => toast.title)).toEqual([
      'Toast 3',
      'Toast 4',
      'Toast 5',
      'Toast 6',
    ]);
  });

  it('clears all toasts', () => {
    service.info('First');
    service.info('Second');
    service.clear();

    expect(service.toasts()).toEqual([]);
  });
});
