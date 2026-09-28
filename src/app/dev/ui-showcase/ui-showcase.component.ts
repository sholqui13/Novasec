import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DOCUMENT,
  inject,
  signal,
} from '@angular/core';
import { ICON_NAMES, IconComponent } from '../../shared/ui/icon';
import { ButtonComponent } from '../../shared/ui/button';
import { InputComponent } from '../../shared/ui/input';
import { BadgeComponent } from '../../shared/ui/badge';
import type { CaseStatus } from '../../core/models';
import { CaseStatusBadgeComponent } from '../../shared/ui/case-status-badge';
import { ModalComponent } from '../../shared/ui/modal';
import { ToastComponent, ToastService, type ToastOptions } from '../../shared/ui/toast';
import { AlertComponent, type AlertType } from '../../shared/ui/alert';
import { AvatarComponent } from '../../shared/ui/avatar';
import { FeedbackStateComponent } from '../../shared/ui/feedback-state';

const CASE_REFERENCE = /^CASE-\d{4}-\d{4}$/;

/** Página de desarrollo para revisar componentes UI contra Figma. */
@Component({
  selector: 'nvs-ui-showcase',
  imports: [
    ButtonComponent,
    InputComponent,
    BadgeComponent,
    CaseStatusBadgeComponent,
    ModalComponent,
    ToastComponent,
    AlertComponent,
    AvatarComponent,
    IconComponent,
    FeedbackStateComponent,
  ],
  templateUrl: './ui-showcase.component.html',
  styleUrl: './ui-showcase.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiShowcaseComponent {
  private readonly document = inject(DOCUMENT);
  private readonly toastService = inject(ToastService);

  protected readonly sampleToasts: readonly Required<ToastOptions>[] = [
    {
      type: 'success',
      title: 'Case resolved',
      message: 'Case #1042 has been marked as resolved successfully.',
      duration: 0,
    },
    {
      type: 'info',
      title: 'New case assigned',
      message: 'A new case has been added to your queue.',
      duration: 0,
    },
    {
      type: 'warning',
      title: 'Session expiring',
      message: 'Your session expires in 5 minutes. Save your work.',
      duration: 0,
    },
    {
      type: 'error',
      title: 'Connection lost',
      message: 'Failed to load case data. Check your connection and try again.',
      duration: 0,
    },
  ];

  protected readonly iconNames = ICON_NAMES;
  protected readonly dark = signal(false);
  protected readonly saving = signal(false);
  protected readonly deleteModalOpen = signal(false);
  protected readonly logoutModalOpen = signal(false);
  protected readonly standardModalOpen = signal(false);
  protected readonly deleting = signal(false);
  protected readonly retrying = signal(false);
  protected readonly caseStatuses: readonly CaseStatus[] = [
    'open',
    'in-progress',
    'resolved',
    'closed',
    'urgent',
  ];
  protected readonly alertTypes: readonly AlertType[] = ['info', 'success', 'warning', 'error'];
  protected readonly dismissibleAlertVisible = signal(true);
  protected readonly caseReference = signal('');
  protected readonly caseReferenceError = computed(() => {
    const value = this.caseReference();
    return value && !CASE_REFERENCE.test(value) ? 'Case reference format is invalid.' : '';
  });

  protected toggleTheme(): void {
    this.dark.update((dark) => !dark);
    const root = this.document.documentElement;
    if (this.dark()) {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
  }

  protected simulateDelete(): void {
    this.deleting.set(true);
    setTimeout(() => {
      this.deleting.set(false);
      this.deleteModalOpen.set(false);
      this.toastService.success('Case deleted', 'Case #1042 has been permanently removed.');
    }, 1500);
  }

  protected showToast({ type, title, message }: ToastOptions): void {
    this.toastService.show({ type, title, message });
  }

  protected simulateRetry(): void {
    this.retrying.set(true);
    setTimeout(() => this.retrying.set(false), 1500);
  }

  protected simulateSave(): void {
    this.saving.set(true);
    setTimeout(() => this.saving.set(false), 2000);
  }
}
