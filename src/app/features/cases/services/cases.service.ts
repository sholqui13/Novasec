import { computed, inject, Injectable, signal } from '@angular/core';
import type { CaseStatus } from '@core/models';
import type { Case } from '../models';
import { CasesApi } from './cases.api';

type LoadStatus = 'idle' | 'loading' | 'loaded' | 'error';

const INACTIVE_STATUSES: ReadonlySet<CaseStatus> = new Set(['resolved', 'closed']);

@Injectable({ providedIn: 'root' })
export class CasesService {
  private readonly api = inject(CasesApi);

  private readonly _cases = signal<readonly Case[]>([]);
  private readonly _loadStatus = signal<LoadStatus>('idle');
  private readonly _selectedId = signal<string | null>(null);
  private readonly _lastUpdated = signal<Date | null>(null);

  readonly cases = this._cases.asReadonly();
  readonly lastUpdated = this._lastUpdated.asReadonly();
  readonly loading = computed(() => this._loadStatus() === 'loading');
  readonly error = computed(() => this._loadStatus() === 'error');
  readonly selectedCase = computed(
    () => this._cases().find((item) => item.id === this._selectedId()) ?? null,
  );
  readonly activeCases = computed(() =>
    this._cases().filter((item) => !INACTIVE_STATUSES.has(item.status)),
  );

  async load(): Promise<void> {
    if (this.loading()) {
      return;
    }
    this._loadStatus.set('loading');
    try {
      this._cases.set(await this.api.getCases());
      this._lastUpdated.set(new Date());
      this._loadStatus.set('loaded');
    } catch {
      this._loadStatus.set('error');
    }
  }

  select(id: string | null): void {
    this._selectedId.set(id);
  }

  search(term: string): readonly Case[] {
    const query = term.trim().toLowerCase().replace(/^#/, '');
    if (!query) {
      return this._cases();
    }
    return this._cases().filter((item) =>
      [String(item.number), item.title, item.location, item.assignee?.name ?? '']
        .some((field) => field.toLowerCase().includes(query)),
    );
  }
}
