import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  input,
  output,
  viewChild,
} from '@angular/core';
import type { User } from '@core/models';
import type { SystemStatus } from '@core/services';
import { AvatarComponent } from '@shared/ui/avatar';
import { IconComponent } from '@shared/ui/icon';

@Component({
  selector: 'nvs-header',
  imports: [AvatarComponent, IconComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.title]': 'null',
  },
})
export class HeaderComponent {
  readonly title = input('');
  readonly eyebrow = input('Security Operations');
  readonly status = input<SystemStatus>('online');
  readonly user = input<User | null>(null);
  readonly menuOpen = input(false, { transform: booleanAttribute });
  readonly menuControls = input<string | null>(null);
  readonly menuToggle = output<void>();

  protected readonly statusLabel = computed(() =>
    this.status() === 'online' ? 'Sistema activo' : 'Sin conexión',
  );

  private readonly menuButton = viewChild.required<ElementRef<HTMLButtonElement>>('menuButton');

  focusMenuButton(): void {
    this.menuButton().nativeElement.focus();
  }
}
