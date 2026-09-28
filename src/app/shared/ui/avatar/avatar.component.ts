import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  linkedSignal,
} from '@angular/core';

export type AvatarSize = 'small' | 'medium' | 'large';

/**
 * Avatar circular con imagen o iniciales. Si la imagen falla, muestra las iniciales.
 * Sin `name` es decorativo (el nombre suele estar al lado); con `name` se anuncia.
 */
@Component({
  selector: 'nvs-avatar',
  template: `
    @if (showImage()) {
      <img class="nvs-avatar__image" [src]="imageUrl()" alt="" (error)="imageFailed.set(true)" />
    } @else {
      <span class="nvs-avatar__initials">{{ normalizedInitials() }}</span>
    }
  `,
  styleUrl: './avatar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': '"nvs-avatar nvs-avatar--" + size()',
    '[attr.role]': 'name() ? "img" : null',
    '[attr.aria-label]': 'name() || null',
    '[attr.aria-hidden]': 'name() ? null : "true"',
  },
})
export class AvatarComponent {
  readonly size = input<AvatarSize>('medium');
  readonly initials = input('');
  readonly imageUrl = input<string | null | undefined>(null);
  /** Nombre de la persona, para lectores de pantalla. */
  readonly name = input('');

  protected readonly imageFailed = linkedSignal({
    source: this.imageUrl,
    computation: () => false,
  });

  protected readonly showImage = computed(() => !!this.imageUrl() && !this.imageFailed());
  protected readonly normalizedInitials = computed(() =>
    this.initials().trim().slice(0, 2).toUpperCase(),
  );
}
