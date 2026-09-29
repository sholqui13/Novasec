import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  output,
  viewChild,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import type { User } from '@core/models';
import { AvatarComponent } from '@shared/ui/avatar';
import { IconComponent } from '@shared/ui/icon';
import type { NavSection, SidebarTheme } from './sidebar.models';

@Component({
  selector: 'nvs-sidebar',
  imports: [RouterLink, RouterLinkActive, AvatarComponent, IconComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': '"nvs-sidebar nvs-sidebar--" + theme()',
    '[class.nvs-sidebar--collapsed]': 'collapsed()',
  },
})
export class SidebarComponent {
  readonly sections = input<readonly NavSection[]>([]);
  readonly user = input<User | null>(null);
  readonly theme = input<SidebarTheme>('dark');
  readonly collapsed = input(false, { transform: booleanAttribute });
  readonly drawer = input(false, { transform: booleanAttribute });
  readonly searchTerm = input('');

  readonly toggle = output<void>();
  readonly search = output<string>();
  readonly logout = output<void>();

  private readonly toggleButton = viewChild<ElementRef<HTMLButtonElement>>('toggleButton');

  focus(): void {
    this.toggleButton()?.nativeElement.focus();
  }

  protected expandRail(): void {
    if (this.collapsed()) {
      this.toggle.emit();
    }
  }

  protected submitSearch(event: Event, query: string): void {
    event.preventDefault();
    const term = query.trim();
    if (term) {
      this.search.emit(term);
    }
  }

  protected clearSearch(query: string): void {
    if (!query.trim() && this.searchTerm()) {
      this.search.emit('');
    }
  }
}
