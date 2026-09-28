import {
  afterRenderEffect,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  type ElementRef,
  input,
  model,
  output,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { IconComponent } from '../icon';
import { ButtonComponent } from '../button';

export type ModalType = 'standard' | 'confirmation';

let nextId = 0;

/**
 * Modal Novasec sobre `<dialog>` nativo (foco atrapado, Escape, fondo inerte y
 * retorno de foco los maneja el navegador).
 *
 * Abrir/cerrar con `[(open)]`. Cancelar (botón, X, Escape o click en el fondo) cierra solo;
 * confirmar solo emite `confirmed`: quien lo usa decide cuándo cerrar (p. ej. tras una petición).
 */
@Component({
  selector: 'nvs-modal',
  imports: [ButtonComponent, IconComponent],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Estilos para ::backdrop y el bloqueo de scroll en <html>.
  encapsulation: ViewEncapsulation.None,
  host: {
    // Evita el tooltip nativo que deja `title="..."` como atributo estático.
    '[attr.title]': 'null',
  },
})
export class ModalComponent {
  readonly type = input<ModalType>('standard');
  readonly title = input.required<string>();
  readonly message = input('');
  readonly open = model(false);
  readonly confirmLabel = input('Confirmar');
  readonly cancelLabel = input('Cancelar');
  /** Acción irreversible: icono de advertencia, botón danger y foco inicial en Cancelar. */
  readonly destructive = input(false, { transform: booleanAttribute });
  /** Muestra el spinner en confirmar y bloquea el cierre mientras la acción está en curso. */
  readonly confirmLoading = input(false, { transform: booleanAttribute });

  // Se evitan los nombres nativos `cancel`/`close` del <dialog>.
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();
  readonly closed = output<void>();

  private readonly baseId = `nvs-modal-${nextId++}`;
  protected readonly titleId = `${this.baseId}-title`;
  protected readonly messageId = `${this.baseId}-message`;

  protected readonly isConfirmation = computed(() => this.type() === 'confirmation');

  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  /** El click en el fondo solo cancela si también empezó en el fondo (evita cerrar al arrastrar). */
  private pointerDownOnBackdrop = false;

  constructor() {
    // Solo corre en el navegador: showModal() no existe en SSR.
    afterRenderEffect(() => {
      const dialog = this.dialog().nativeElement;
      if (this.open() && !dialog.open) {
        dialog.showModal();
      } else if (!this.open() && dialog.open) {
        dialog.close();
      }
    });
  }

  protected cancel(): void {
    if (this.confirmLoading()) {
      return;
    }
    this.cancelled.emit();
    this.open.set(false);
  }

  protected confirm(): void {
    this.confirmed.emit();
  }

  /** Escape: se cancela por nuestro flujo para mantener `open` sincronizado. */
  protected handleNativeCancel(event: Event): void {
    event.preventDefault();
    this.cancel();
  }

  protected handleNativeClose(): void {
    // El navegador puede cerrar sin pasar por `cancel` (p. ej. Escape repetido en Chrome).
    if (this.open()) {
      this.cancelled.emit();
      this.open.set(false);
    }
    this.closed.emit();
  }

  protected handlePointerDown(event: PointerEvent): void {
    this.pointerDownOnBackdrop = event.target === this.dialog().nativeElement;
  }

  protected handleClick(event: MouseEvent): void {
    const clickedBackdrop = event.target === this.dialog().nativeElement;
    if (clickedBackdrop && this.pointerDownOnBackdrop) {
      this.cancel();
    }
    this.pointerDownOnBackdrop = false;
  }
}
