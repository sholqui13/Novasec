import { ChangeDetectionStrategy, Component, inject, ViewEncapsulation } from '@angular/core';
import { ToastComponent } from './toast.component';
import { ToastService } from './toast.service';

/** Zona fija donde se apilan los toasts. Se coloca una sola vez, en AppComponent. */
@Component({
  selector: 'nvs-toast-region',
  imports: [ToastComponent],
  template: `
    <section class="nvs-toast-region" aria-label="Notificaciones">
      <!-- La lista existe desde el inicio para que los lectores de pantalla anuncien cada toast nuevo. -->
      <ol class="nvs-toast-region__list" aria-live="polite">
        @for (toast of toastService.toasts(); track toast.id) {
          <li class="nvs-toast-region__item">
            <nvs-toast
              [type]="toast.type"
              [title]="toast.title"
              [message]="toast.message"
              [duration]="toast.duration"
              (dismissed)="toastService.dismiss(toast.id)"
            />
          </li>
        }
      </ol>
    </section>
  `,
  styles: `
    @use 'mixins/breakpoints' as bp;

    .nvs-toast-region {
      position: fixed;
      inset-block-start: var(--nvs-space-6);
      inset-inline: var(--nvs-space-6);
      z-index: var(--nvs-z-toast);
      pointer-events: none;
    }

    .nvs-toast-region__list {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: var(--nvs-space-3);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .nvs-toast-region__item {
      display: flex;
      justify-content: flex-end;
      width: 100%;
    }

    @include bp.down(tablet) {
      .nvs-toast-region {
        inset-block-start: var(--nvs-space-4);
        inset-inline: var(--nvs-space-4);
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ToastRegionComponent {
  protected readonly toastService = inject(ToastService);
}
