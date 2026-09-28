import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, LOGIN_PATH } from '@core/auth';
import { AvatarComponent } from '@shared/ui/avatar';
import { ButtonComponent } from '@shared/ui/button';

// Provisional hasta que exista el dashboard.
@Component({
  selector: 'nvs-home-page',
  imports: [AvatarComponent, ButtonComponent],
  template: `
    @if (auth.user(); as user) {
      <main class="home">
        <nvs-avatar size="large" [initials]="user.initials" />
        <h2>Hola, {{ user.name }}</h2>
        <p>El dashboard todavía está en construcción.</p>
        <button nvsButton variant="secondary" icon="logout" (clicked)="logout()">Cerrar sesión</button>
      </main>
    }
  `,
  styles: `
    .home {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--nvs-space-4);
      padding-block: var(--nvs-space-16);
      text-align: center;
    }

    h2,
    p {
      margin: 0;
    }

    p {
      color: var(--nvs-color-text-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected logout(): void {
    this.auth.logout();
    void this.router.navigateByUrl(LOGIN_PATH);
  }
}
