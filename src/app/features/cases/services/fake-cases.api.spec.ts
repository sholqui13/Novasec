import { TestBed } from '@angular/core/testing';
import { CasesApi } from './cases.api';
import { FAKE_CASES, FAKE_CASES_DELAY, FakeCasesApi } from './fake-cases.api';

describe('FakeCasesApi', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('is the default CasesApi implementation', () => {
    expect(TestBed.inject(CasesApi)).toBeInstanceOf(FakeCasesApi);
  });

  it('resolves the fake cases after a delay', async () => {
    const cases = TestBed.inject(CasesApi).getCases();

    await vi.advanceTimersByTimeAsync(FAKE_CASES_DELAY);

    await expect(cases).resolves.toEqual(FAKE_CASES);
  });
});
