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
  private readonly _searchTerm = signal('');

  readonly cases = this._cases.asReadonly();
  readonly lastUpdated = this._lastUpdated.asReadonly();
  readonly searchTerm = this._searchTerm.asReadonly();
  readonly loading = computed(() => this._loadStatus() === 'loading');
  readonly error = computed(() => this._loadStatus() === 'error');
  readonly selectedCase = computed(
    () => this._cases().find((item) => item.id === this._selectedId()) ?? null,
  );
  readonly activeCases = computed(() =>
    this._cases().filter((item) => !INACTIVE_STATUSES.has(item.status)),
  );
  readonly searchResults = computed(() =>
    this.activeCases().filter((item) => matchesSearch(item, this._searchTerm())),
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

  setSearch(term: string): void {
    this._searchTerm.set(term.trim());
    const results = this.searchResults();
    if (this._searchTerm() && results.length === 1) {
      this.select(results[0].id);
    } else if (!results.some((item) => item.id === this._selectedId())) {
      this.select(null);
    }
  }
}

function matchesSearch(item: Case, term: string): boolean {
  const query = term.trim().toLowerCase().replace(/^#/, '');
  return (
    !query ||
    [String(item.number), item.title, item.location, item.assignee?.name ?? ''].some((field) =>
      field.toLowerCase().includes(query),
    )
  );
}
