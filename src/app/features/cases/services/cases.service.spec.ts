import { TestBed } from '@angular/core/testing';
import { CasesApi } from './cases.api';
import { CasesService } from './cases.service';
import { FAKE_CASES } from './fake-cases.api';

describe('CasesService', () => {
  let getCases: ReturnType<typeof vi.fn>;
  let service: CasesService;

  beforeEach(() => {
    getCases = vi.fn().mockResolvedValue(FAKE_CASES);
    TestBed.configureTestingModule({
      providers: [{ provide: CasesApi, useValue: { getCases } }],
    });
    service = TestBed.inject(CasesService);
  });

  it('starts empty and idle', () => {
    expect(service.cases()).toEqual([]);
    expect(service.loading()).toBe(false);
    expect(service.error()).toBe(false);
    expect(service.selectedCase()).toBeNull();
  });

  it('loads the cases, exposing the loading state meanwhile', async () => {
    const load = service.load();
    expect(service.loading()).toBe(true);

    await load;

    expect(service.loading()).toBe(false);
    expect(service.cases()).toEqual(FAKE_CASES);
    expect(service.lastUpdated()).toBeInstanceOf(Date);
  });

  it('ignores a second load while one is in progress', async () => {
    await Promise.all([service.load(), service.load()]);

    expect(getCases).toHaveBeenCalledOnce();
  });

  it('exposes the error state when loading fails', async () => {
    getCases.mockRejectedValue(new Error('offline'));

    await service.load();

    expect(service.error()).toBe(true);
    expect(service.loading()).toBe(false);
    expect(service.lastUpdated()).toBeNull();
  });

  it('counts only open, in-progress and urgent cases as active', async () => {
    await service.load();

    expect(service.activeCases().map((item) => item.status)).toEqual([
      'in-progress',
      'urgent',
      'open',
    ]);
  });

  it('selects a case by id', async () => {
    await service.load();

    service.select('c-1038');
    expect(service.selectedCase()?.number).toBe(1038);

    service.select(null);
    expect(service.selectedCase()).toBeNull();
  });

  it('searches the active cases by number, title, location and assignee', async () => {
    await service.load();
    const numbers = (term: string) => {
      service.setSearch(term);
      return service.searchResults().map((item) => item.number);
    };

    expect(numbers('building')).toEqual([1042, 1043]);
    expect(numbers('parking')).toEqual([1038]);
    expect(numbers('#1042')).toEqual([1042]);
    expect(numbers('ana')).toEqual([1038]);
    expect(numbers('carlos')).toEqual([]);
    expect(numbers('  ')).toEqual(service.activeCases().map((item) => item.number));
  });

  it('selects the only result and clears a selection left out of the results', async () => {
    await service.load();

    service.setSearch('1038');
    expect(service.selectedCase()?.number).toBe(1038);

    service.setSearch('building');
    expect(service.selectedCase()).toBeNull();

    service.select('c-1042');
    service.setSearch('');
    expect(service.selectedCase()?.number).toBe(1042);
  });
});
