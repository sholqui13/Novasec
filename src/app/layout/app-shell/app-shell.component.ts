import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Injector,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { AuthService, LOGIN_PATH } from '@core/auth';
import { BreakpointService, SystemStatusService } from '@core/services';
import { ModalComponent } from '@shared/ui/modal';
import { HeaderComponent } from '../header';
import { SidebarComponent } from '../sidebar';
import { NAV_SECTIONS } from './navigation';

@Component({
  selector: 'nvs-app-shell',
  imports: [RouterOutlet, HeaderComponent, SidebarComponent, ModalComponent],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'app-shell',
    '[class.app-shell--nav-open]': 'mobileNavOpen()',
    '[class.app-shell--collapsed]': 'sidebarCollapsed()',
    '(document:keydown.escape)': 'closeMobileNav(true)',
  },
})
export class AppShellComponent {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly injector = inject(Injector);

  protected readonly navSections = NAV_SECTIONS;
  protected readonly user = this.auth.user;
  protected readonly systemStatus = inject(SystemStatusService).status;
  private readonly viewport = inject(BreakpointService).viewport;
  protected readonly isMobile = computed(() => this.viewport() === 'mobile');

  protected readonly mobileNavOpen = signal(false);
  protected readonly sidebarCollapsed = signal(true);
  protected readonly logoutModalOpen = signal(false);

  private readonly navigationEnd$ = this.router.events.pipe(
    filter((event) => event instanceof NavigationEnd),
    takeUntilDestroyed(),
  );

  protected readonly pageTitle = toSignal(
    this.navigationEnd$.pipe(map(() => this.currentPageTitle())),
    { initialValue: this.currentPageTitle() },
  );

  private readonly header = viewChild.required(HeaderComponent);
  private readonly sidebar = viewChild.required(SidebarComponent);

  constructor() {
    this.navigationEnd$.subscribe(() => this.closeMobileNav());
  }

  toggleMobileNav(): void {
    if (this.mobileNavOpen()) {
      this.closeMobileNav(true);
      return;
    }
    this.mobileNavOpen.set(true);
    afterNextRender(() => this.sidebar().focus(), { injector: this.injector });
  }

  closeMobileNav(restoreFocus = false): void {
    if (!this.mobileNavOpen()) {
      return;
    }
    this.mobileNavOpen.set(false);
    if (restoreFocus) {
      afterNextRender(() => this.header().focusMenuButton(), { injector: this.injector });
    }
  }

  protected toggleSidebar(): void {
    if (this.isMobile()) {
      this.closeMobileNav(true);
      return;
    }
    this.sidebarCollapsed.update((collapsed) => !collapsed);
    afterNextRender(() => this.sidebar().focus(), { injector: this.injector });
  }

  protected search(term: string): void {
    // Pendiente: conectar con la búsqueda de casos cuando exista el servicio.
    void term;
  }

  protected confirmLogout(): void {
    this.logoutModalOpen.set(false);
    this.auth.logout();
    void this.router.navigateByUrl(LOGIN_PATH);
  }

  protected skipToContent(event: Event, main: HTMLElement): void {
    event.preventDefault();
    main.focus();
  }

  private currentPageTitle(): string {
    let route = this.router.routerState.snapshot.root;
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route.data['pageTitle'] ?? '';
  }
}
