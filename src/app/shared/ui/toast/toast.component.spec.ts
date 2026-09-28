import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastComponent } from './toast.component';

describe('ToastComponent', () => {
  let fixture: ComponentFixture<ToastComponent>;
  let host: HTMLElement;
  let dismissed: ReturnType<typeof vi.fn<() => void>>;

  beforeEach(async () => {
    vi.useFakeTimers();

    await TestBed.configureTestingModule({
      imports: [ToastComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ToastComponent);
    host = fixture.nativeElement;
    dismissed = vi.fn<() => void>();
    fixture.componentInstance.dismissed.subscribe(dismissed);
    fixture.componentRef.setInput('title', 'Case resolved');
    fixture.componentRef.setInput('message', 'Case #1042 has been marked as resolved successfully.');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function render(): void {
    fixture.detectChanges();
  }

  it('renders the type, title, message and close button', () => {
    fixture.componentRef.setInput('type', 'success');
    render();

    expect(host.classList).toContain('nvs-toast--success');
    expect(host.querySelector('.nvs-toast__title')?.textContent).toBe('Case resolved');
    expect(host.querySelector('.nvs-toast__message')?.textContent).toContain('Case #1042');
    expect(host.querySelector('.nvs-toast__close')?.getAttribute('aria-label')).toBe(
      'Cerrar notificación',
    );
    expect(host.querySelector('.nvs-toast__icon')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('dismisses automatically after 3.5 seconds by default', () => {
    render();

    vi.advanceTimersByTime(3499);
    expect(dismissed).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(dismissed).toHaveBeenCalledOnce();
  });

  it('does not auto-dismiss when duration is 0', () => {
    fixture.componentRef.setInput('duration', 0);
    render();

    vi.advanceTimersByTime(60_000);
    expect(dismissed).not.toHaveBeenCalled();
  });

  it('pauses while hovered and resumes with the remaining time', () => {
    render();

    vi.advanceTimersByTime(2000);
    host.dispatchEvent(new MouseEvent('mouseenter'));
    vi.advanceTimersByTime(10_000);
    expect(dismissed).not.toHaveBeenCalled();

    host.dispatchEvent(new MouseEvent('mouseleave'));
    vi.advanceTimersByTime(1499);
    expect(dismissed).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(dismissed).toHaveBeenCalledOnce();
  });

  it('pauses while focus is inside', () => {
    render();

    host.dispatchEvent(new FocusEvent('focusin'));
    vi.advanceTimersByTime(10_000);
    expect(dismissed).not.toHaveBeenCalled();

    host.dispatchEvent(new FocusEvent('focusout'));
    vi.advanceTimersByTime(3500);
    expect(dismissed).toHaveBeenCalledOnce();
  });

  it('dismisses from the close button only once', () => {
    render();

    (host.querySelector('.nvs-toast__close') as HTMLButtonElement).click();
    vi.advanceTimersByTime(10_000);

    expect(dismissed).toHaveBeenCalledOnce();
  });
});
