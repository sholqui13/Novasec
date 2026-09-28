import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastRegionComponent } from './toast-region.component';
import { ToastService } from './toast.service';

describe('ToastRegionComponent', () => {
  let fixture: ComponentFixture<ToastRegionComponent>;
  let service: ToastService;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastRegionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ToastRegionComponent);
    service = TestBed.inject(ToastService);
    host = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('exposes a polite live region before any toast appears', () => {
    const list = host.querySelector('ol') as HTMLElement;

    expect(host.querySelector('section')?.getAttribute('aria-label')).toBe('Notificaciones');
    expect(list.getAttribute('aria-live')).toBe('polite');
    expect(list.children.length).toBe(0);
  });

  it('renders the toasts from the service and removes them when dismissed', () => {
    service.success('Case resolved');
    service.error('Connection lost');
    fixture.detectChanges();

    const toasts = host.querySelectorAll('nvs-toast');
    expect(toasts.length).toBe(2);
    expect(toasts[1].classList).toContain('nvs-toast--error');

    (toasts[0].querySelector('.nvs-toast__close') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(service.toasts().map((toast) => toast.title)).toEqual(['Connection lost']);
    expect(host.querySelectorAll('nvs-toast').length).toBe(1);
  });
});
