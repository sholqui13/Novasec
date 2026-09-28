import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalComponent, type ModalType } from './modal.component';

@Component({
  imports: [ModalComponent],
  template: `
    <nvs-modal
      [type]="type()"
      [destructive]="destructive()"
      title="Delete Case #1042?"
      message="This action is permanent and cannot be undone."
      confirmLabel="Yes, delete case"
      cancelLabel="Cancel"
      [confirmLoading]="loading()"
      [(open)]="open"
      (confirmed)="confirmedCount = confirmedCount + 1"
      (cancelled)="cancelledCount = cancelledCount + 1"
      (closed)="closedCount = closedCount + 1"
    />
  `,
})
class HostComponent {
  readonly type = signal<ModalType>('confirmation');
  readonly destructive = signal(true);
  readonly open = signal(false);
  readonly loading = signal(false);
  confirmedCount = 0;
  cancelledCount = 0;
  closedCount = 0;
}

describe('ModalComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let dialog: HTMLDialogElement;

  beforeAll(() => {
    const proto = HTMLDialogElement.prototype;
    proto.showModal ??= function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
    };
    proto.close ??= function (this: HTMLDialogElement) {
      if (this.hasAttribute('open')) {
        this.removeAttribute('open');
        this.dispatchEvent(new Event('close'));
      }
    };
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    dialog = fixture.nativeElement.querySelector('dialog');
  });

  function openModal(): void {
    host.open.set(true);
    fixture.detectChanges();
  }

  function footerButtons(): HTMLButtonElement[] {
    return Array.from(dialog.querySelectorAll('.nvs-modal__footer button'));
  }

  it('opens and closes with [(open)]', () => {
    expect(dialog.open).toBe(false);

    openModal();
    expect(dialog.open).toBe(true);

    host.open.set(false);
    fixture.detectChanges();
    expect(dialog.open).toBe(false);
    expect(host.closedCount).toBe(1);
  });

  it('is labelled by its title and described by its message', () => {
    const title = dialog.querySelector('.nvs-modal__title') as HTMLElement;
    const message = dialog.querySelector('.nvs-modal__message') as HTMLElement;

    expect(dialog.getAttribute('aria-labelledby')).toBe(title.id);
    expect(dialog.getAttribute('aria-describedby')).toBe(message.id);
    expect(title.textContent).toContain('Delete Case #1042?');
  });

  it('renders a destructive action with warning icon, danger button and safe focus', () => {
    const [cancel, confirm] = footerButtons();

    expect(dialog.querySelector('.nvs-modal__icon')).toBeTruthy();
    expect(confirm.classList).toContain('nvs-button--danger');
    expect(confirm.textContent).toContain('Yes, delete case');
    expect(cancel.hasAttribute('autofocus')).toBe(true);
  });

  it('renders a non-destructive action without warning icon', () => {
    host.destructive.set(false);
    fixture.detectChanges();
    const [cancel, confirm] = footerButtons();

    expect(dialog.querySelector('.nvs-modal__icon')).toBeNull();
    expect(confirm.classList).toContain('nvs-button--primary');
    expect(cancel.hasAttribute('autofocus')).toBe(false);
  });

  it('uses the alertdialog role only for confirmations', () => {
    expect(dialog.getAttribute('role')).toBe('alertdialog');

    host.type.set('standard');
    fixture.detectChanges();
    expect(dialog.hasAttribute('role')).toBe(false);
  });

  it('cancels and closes from the cancel button and the close icon', () => {
    for (const selector of ['.nvs-modal__footer button', '.nvs-modal__close']) {
      openModal();
      (dialog.querySelector(selector) as HTMLButtonElement).click();
      fixture.detectChanges();

      expect(host.open()).toBe(false);
      expect(dialog.open).toBe(false);
    }
    expect(host.cancelledCount).toBe(2);
  });

  it('cancels on Escape', () => {
    openModal();
    const escape = new Event('cancel', { cancelable: true });
    dialog.dispatchEvent(escape);
    fixture.detectChanges();

    expect(escape.defaultPrevented).toBe(true);
    expect(host.cancelledCount).toBe(1);
    expect(host.open()).toBe(false);
  });

  it('cancels when clicking the backdrop, but not inside the content', () => {
    openModal();
    (dialog.querySelector('.nvs-modal__body') as HTMLElement).dispatchEvent(
      new MouseEvent('click', { bubbles: true }),
    );
    expect(host.open()).toBe(true);

    dialog.dispatchEvent(new Event('pointerdown'));
    dialog.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();
    expect(host.open()).toBe(false);
  });

  it('emits confirmed without closing', () => {
    openModal();
    footerButtons()[1].click();
    fixture.detectChanges();

    expect(host.confirmedCount).toBe(1);
    expect(host.open()).toBe(true);
  });

  it('blocks cancelling while the confirmation is loading', () => {
    openModal();
    host.loading.set(true);
    fixture.detectChanges();

    dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
    fixture.detectChanges();

    expect(host.open()).toBe(true);
    expect(footerButtons()[0].disabled).toBe(true);
    expect((dialog.querySelector('.nvs-modal__close') as HTMLButtonElement).disabled).toBe(true);
  });
});
