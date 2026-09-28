import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { IconName } from '../icon';
import { ButtonComponent, type ButtonVariant } from './button.component';

@Component({
  imports: [ButtonComponent],
  template: `
    <button
      nvsButton
      [variant]="variant()"
      [size]="'large'"
      [label]="label()"
      [icon]="icon()"
      [loading]="loading()"
      [disabled]="disabled()"
      [attr.aria-label]="ariaLabel()"
      (clicked)="clickedCount = clickedCount + 1"
      (click)="nativeClickCount = nativeClickCount + 1"
    ></button>
    <a nvsButton href="#" [disabled]="linkDisabled()">Ver detalle</a>
  `,
})
class HostComponent {
  readonly variant = signal<ButtonVariant>('primary');
  readonly label = signal('Guardar');
  readonly icon = signal<IconName | null>(null);
  readonly loading = signal(false);
  readonly disabled = signal(false);
  readonly ariaLabel = signal<string | null>(null);
  readonly linkDisabled = signal(false);
  clickedCount = 0;
  nativeClickCount = 0;
}

describe('ButtonComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let button: HTMLButtonElement;
  let link: HTMLAnchorElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    button = fixture.nativeElement.querySelector('button');
    link = fixture.nativeElement.querySelector('a');
  });

  it('applies variant and size classes to the native button', () => {
    host.variant.set('secondary');
    fixture.detectChanges();

    expect(button.classList).toContain('nvs-button');
    expect(button.classList).toContain('nvs-button--secondary');
    expect(button.classList).toContain('nvs-button--large');
    expect(button.getAttribute('type')).toBe('button');
    expect(button.textContent).toContain('Guardar');
  });

  it('emits clicked when enabled', () => {
    button.click();

    expect(host.clickedCount).toBe(1);
    expect(host.nativeClickCount).toBe(1);
  });

  it('does not emit when disabled', () => {
    host.disabled.set(true);
    fixture.detectChanges();
    button.click();

    expect(button.disabled).toBe(true);
    expect(host.clickedCount).toBe(0);
  });

  it('keeps focus while loading but blocks clicks', () => {
    host.loading.set(true);
    fixture.detectChanges();
    button.click();

    expect(button.disabled).toBe(false);
    expect(button.getAttribute('aria-disabled')).toBe('true');
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.querySelector('.nvs-button__spinner')).toBeTruthy();
    expect(host.clickedCount).toBe(0);
    expect(host.nativeClickCount).toBe(0);
  });

  it('renders the icon and forwards native aria-label', () => {
    host.label.set('');
    host.icon.set('plus');
    host.ariaLabel.set('Nuevo caso');
    fixture.detectChanges();

    expect(button.querySelector('.nvs-button__icon')).toBeTruthy();
    expect(button.getAttribute('aria-label')).toBe('Nuevo caso');
  });

  it('supports anchors and disables them accessibly', () => {
    expect(link.classList).toContain('nvs-button');
    expect(link.hasAttribute('type')).toBe(false);

    host.linkDisabled.set(true);
    fixture.detectChanges();
    const event = new MouseEvent('click', { cancelable: true });
    link.dispatchEvent(event);

    expect(link.getAttribute('aria-disabled')).toBe('true');
    expect(link.getAttribute('tabindex')).toBe('-1');
    expect(event.defaultPrevented).toBe(true);
  });
});
