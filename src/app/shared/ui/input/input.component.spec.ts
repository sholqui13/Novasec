import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputComponent, type InputType } from './input.component';

@Component({
  imports: [InputComponent, ReactiveFormsModule],
  template: `
    <nvs-input
      [type]="type()"
      [label]="label()"
      [hint]="hint()"
      [error]="error()"
      [disabled]="disabled()"
      [(value)]="value"
      (blurred)="blurCount = blurCount + 1"
    />
    <nvs-input label="Referencia" [formControl]="control" />
  `,
})
class HostComponent {
  readonly type = signal<InputType>('text');
  readonly label = signal('Caso');
  readonly hint = signal('');
  readonly error = signal('');
  readonly disabled = signal(false);
  readonly value = signal('');
  readonly control = new FormControl('CASE-2026-0001');
  blurCount = 0;
}

describe('InputComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let field: HTMLElement;
  let input: HTMLInputElement;
  let formInput: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    [field] = fixture.nativeElement.querySelectorAll('nvs-input');
    [input, formInput] = fixture.nativeElement.querySelectorAll('input');
  });

  function type(el: HTMLInputElement, value: string): void {
    el.value = value;
    el.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  it('associates the label with the input', () => {
    const label = field.querySelector('label') as HTMLLabelElement;

    expect(label.textContent).toContain('Caso');
    expect(label.htmlFor).toBe(input.id);
  });

  it('supports two-way binding with [(value)]', () => {
    type(input, 'Server Room B');
    expect(host.value()).toBe('Server Room B');

    host.value.set('Otro');
    fixture.detectChanges();
    expect(input.value).toBe('Otro');
  });

  it('works with reactive forms', () => {
    expect(formInput.value).toBe('CASE-2026-0001');

    type(formInput, 'CASE-2026-0002');
    expect(host.control.value).toBe('CASE-2026-0002');

    formInput.dispatchEvent(new FocusEvent('blur'));
    expect(host.control.touched).toBe(true);

    host.control.disable();
    fixture.detectChanges();
    expect(formInput.disabled).toBe(true);
  });

  it('describes the input with the hint', () => {
    host.hint.set('Format: CASE-YYYY-NNNN');
    fixture.detectChanges();

    const hint = field.querySelector('.nvs-input__message') as HTMLElement;
    expect(hint.textContent).toContain('Format: CASE-YYYY-NNNN');
    expect(input.getAttribute('aria-describedby')).toBe(hint.id);
    expect(input.hasAttribute('aria-invalid')).toBe(false);
  });

  it('shows the error instead of the hint and marks the input invalid', () => {
    host.hint.set('Format: CASE-YYYY-NNNN');
    host.error.set('Case reference format is invalid.');
    fixture.detectChanges();

    const messages = field.querySelectorAll('.nvs-input__message');
    expect(messages.length).toBe(1);
    expect(messages[0].textContent).toContain('Case reference format is invalid.');
    expect(field.classList).toContain('nvs-input--invalid');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe(messages[0].id);
  });

  it('renders the search icon only for type search', () => {
    expect(field.querySelector('.nvs-input__icon')).toBeNull();

    host.type.set('search');
    fixture.detectChanges();
    expect(field.querySelector('.nvs-input__icon')).toBeTruthy();
    expect(input.type).toBe('search');
  });

  it('toggles password visibility', () => {
    host.type.set('password');
    fixture.detectChanges();

    const toggle = field.querySelector('.nvs-input__action') as HTMLButtonElement;
    expect(input.type).toBe('password');
    expect(toggle.type).toBe('button');
    expect(toggle.getAttribute('aria-label')).toBe('Mostrar contraseña');
    expect(toggle.getAttribute('aria-pressed')).toBe('false');

    toggle.click();
    fixture.detectChanges();
    expect(input.type).toBe('text');
    expect(toggle.getAttribute('aria-label')).toBe('Ocultar contraseña');
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
  });

  it('shows the password toggle only for type password', () => {
    expect(field.querySelector('.nvs-input__action')).toBeNull();
  });

  it('disables the input', () => {
    host.disabled.set(true);
    fixture.detectChanges();

    expect(input.disabled).toBe(true);
    expect(field.classList).toContain('nvs-input--disabled');
  });

  it('emits blurred', () => {
    input.dispatchEvent(new FocusEvent('blur'));
    expect(host.blurCount).toBe(1);
  });
});
