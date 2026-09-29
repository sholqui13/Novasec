import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface BreadcrumbItem {
  readonly label: string;
  readonly link?: string;
}

@Component({
  selector: 'nvs-breadcrumb',
  imports: [RouterLink],
  template: `
    <nav aria-label="Ruta de navegación">
      <ol class="nvs-breadcrumb__list">
        @for (item of items(); track $index; let last = $last) {
          <li class="nvs-breadcrumb__item">
            @if (item.link && !last) {
              <a class="nvs-breadcrumb__link" [routerLink]="item.link">{{ item.label }}</a>
              <span class="nvs-breadcrumb__separator" aria-hidden="true">/</span>
            } @else {
              <span class="nvs-breadcrumb__current" [attr.aria-current]="last ? 'page' : null">
                {{ item.label }}
              </span>
            }
          </li>
        }
      </ol>
    </nav>
  `,
  styleUrl: './breadcrumb.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreadcrumbComponent {
  readonly items = input.required<readonly BreadcrumbItem[]>();
}
