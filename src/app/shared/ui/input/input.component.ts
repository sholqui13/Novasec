import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  model,
  output,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { type ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconComponent } from '../icon';

export type InputType = 'text' | 'search' | 'password' | 'email' | 'tel' | 'url' | 'number';

let nextId = 0;

/**
 * Campo de formulario Novasec con label, hint y mensaje de error.
 *
 * Funciona con Reactive Forms (`formControlName`), `ngModel` o `[(value)]`.
 * El estado de foco lo maneja CSS (:focus-within); el de error, el input `error`.
 */
@Component({
  selector: 'nvs-input',
  imports: [IconComponent],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
  host: {
    class: 'nvs-input',
    '[class.nvs-input--invalid]': 'invalid()',
    '[class.nvs-input--disabled]': 'isDisabled()',
  },
})
export class InputComponent implements ControlValueAccessor {
  readonly type = input<InputType>('text');
  readonly label = input('');
  readonly value = model('');
  readonly placeholder = input('');
  readonly hint = input('');
  readonly error = input('');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly name = input<string | null>(null);
  readonly autocomplete = input<string | null>(null);
  readonly ariaLabel = input<string | null>(null);

  readonly focused = output<FocusEvent>();
  readonly blurred = output<FocusEvent>();


  protected readonly inputId = `nvs-input-${nextId++}`;
  protected readonly hintId = `${this.inputId}-hint`;
  protected readonly errorId = `${this.inputId}-error`;

  private readonly formDisabled = signal(false);
  protected readonly passwordVisible = signal(false);

  protected readonly isPassword = computed(() => this.type() === 'password');
  protected readonly nativeType = computed(() =>
    this.isPassword() && this.passwordVisible() ? 'text' : this.type(),
  );

  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  protected readonly invalid = computed(() => this.error().trim().length > 0);
  protected readonly showHint = computed(() => !this.invalid() && this.hint().length > 0);
  protected readonly describedBy = computed(() =>
    this.invalid() ? this.errorId : this.showHint() ? this.hintId : null,
  );

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  protected focusControl(event: MouseEvent, control: HTMLInputElement): void {
    if (!(event.target as Element).closest('button')) {
      control.focus();
    }
  }

  protected togglePasswordVisibility(): void {
    this.passwordVisible.update((visible) => !visible);
  }

  protected handleInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value.set(value);
    this.onChange(value);
  }

  protected handleFocus(event: FocusEvent): void {
    this.focused.emit(event);
  }

  protected handleBlur(event: FocusEvent): void {
    this.onTouched();
    this.blurred.emit(event);
  }

  // ControlValueAccessor

  writeValue(value: string | null | undefined): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }
}
