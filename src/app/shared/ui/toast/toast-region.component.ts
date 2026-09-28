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
    .nvs-toast-region {
      position: fixed;
      inset-block-start: var(--nvs-toast-region-offset);
      inset-inline-end: var(--nvs-toast-region-offset);
      z-index: var(--nvs-z-toast);
      width: min(var(--nvs-toast-max-width), 100% - 2 * var(--nvs-toast-region-offset-mobile));
      pointer-events: none;
    }

    .nvs-toast-region__list {
      display: flex;
      flex-direction: column;
      gap: var(--nvs-toast-stack-gap);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    @media (max-width: 37.5rem) {
      .nvs-toast-region {
        inset-block-start: var(--nvs-toast-region-offset-mobile);
        inset-inline: var(--nvs-toast-region-offset-mobile);
        width: auto;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ToastRegionComponent {
  protected readonly toastService = inject(ToastService);
}
