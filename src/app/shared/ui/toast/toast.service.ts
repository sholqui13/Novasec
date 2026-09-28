import { Injectable, signal } from '@angular/core';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastOptions {
  readonly type?: ToastType;
  readonly title: string;
  readonly message?: string;
  /** Milisegundos antes de cerrarse solo. `0` lo deja fijo hasta que se cierre a mano. */
  readonly duration?: number;
}

export interface Toast extends Required<ToastOptions> {
  readonly id: number;
}

export const TOAST_DEFAULT_DURATION = 3500;
const MAX_VISIBLE_TOASTS = 4;

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 0;
  private readonly _toasts = signal<readonly Toast[]>([]);

  readonly toasts = this._toasts.asReadonly();

  show(options: ToastOptions): number {
    const toast: Toast = {
      id: this.nextId++,
      type: options.type ?? 'info',
      title: options.title,
      message: options.message ?? '',
      duration: options.duration ?? TOAST_DEFAULT_DURATION,
    };
    this._toasts.update((toasts) => [...toasts, toast].slice(-MAX_VISIBLE_TOASTS));
    return toast.id;
  }

  info(title: string, message?: string): number {
    return this.show({ type: 'info', title, message });
  }

  success(title: string, message?: string): number {
    return this.show({ type: 'success', title, message });
  }

  warning(title: string, message?: string): number {
    return this.show({ type: 'warning', title, message });
  }

  error(title: string, message?: string): number {
    return this.show({ type: 'error', title, message });
  }

  dismiss(id: number): void {
    this._toasts.update((toasts) => toasts.filter((toast) => toast.id !== id));
  }

  clear(): void {
    this._toasts.set([]);
  }
}
