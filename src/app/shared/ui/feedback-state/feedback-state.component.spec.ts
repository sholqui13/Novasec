import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeedbackStateComponent } from './feedback-state.component';

describe('FeedbackStateComponent', () => {
  let fixture: ComponentFixture<FeedbackStateComponent>;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedbackStateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FeedbackStateComponent);
    host = fixture.nativeElement;
  });

  function render(state: string, inputs: Record<string, unknown> = {}): void {
    fixture.componentRef.setInput('state', state);
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
  }

  it('shows a spinner and marks the region busy while loading', () => {
    render('loading', { title: 'Loading cases...', message: 'Fetching from server' });

    expect(host.classList).toContain('nvs-feedback-state--loading');
    expect(host.getAttribute('role')).toBe('status');
    expect(host.getAttribute('aria-busy')).toBe('true');
    expect(host.querySelector('.nvs-feedback-state__spinner')).toBeTruthy();
    expect(host.querySelector('nvs-icon')).toBeNull();
    expect(host.textContent).toContain('Loading cases...');
    expect(host.textContent).toContain('Fetching from server');
  });

  it('shows the empty icon by default', () => {
    render('empty', { title: 'No cases found' });

    expect(host.getAttribute('role')).toBe('status');
    expect(host.hasAttribute('aria-busy')).toBe(false);
    expect(host.querySelector('.nvs-feedback-state__spinner')).toBeNull();
    expect(host.querySelector('nvs-icon')).toBeTruthy();
  });

  it('announces errors and emits the action', () => {
    const action = vi.fn<() => void>();
    fixture.componentInstance.action.subscribe(action);
    render('error', { title: 'Failed to load', message: 'Connection error', actionLabel: 'Retry' });

    const button = host.querySelector('.nvs-feedback-state__action') as HTMLButtonElement;
    expect(host.getAttribute('role')).toBe('alert');
    expect(button.textContent?.trim()).toBe('Retry');

    button.click();
    expect(action).toHaveBeenCalledOnce();
  });

  it('hides the action without a label', () => {
    render('error', { title: 'Failed to load' });

    expect(host.querySelector('.nvs-feedback-state__action')).toBeNull();
  });
});
