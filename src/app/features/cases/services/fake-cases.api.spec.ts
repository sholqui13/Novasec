import { TestBed } from '@angular/core/testing';
import { CasesApi } from './cases.api';
import { FAKE_CASES, FAKE_CASES_DELAY, FAKE_CASES_ERROR_KEY, FakeCasesApi } from './fake-cases.api';

describe('FakeCasesApi', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.removeItem(FAKE_CASES_ERROR_KEY);
  });

  it('can simulate a connection error', async () => {
    localStorage.setItem(FAKE_CASES_ERROR_KEY, '1');
    const cases = TestBed.inject(CasesApi).getCases();
    const assertion = expect(cases).rejects.toThrow('Simulated connection error');

    await vi.advanceTimersByTimeAsync(FAKE_CASES_DELAY);

    await assertion;
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
