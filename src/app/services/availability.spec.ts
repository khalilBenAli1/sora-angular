import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AvailabilityService } from './availability';
describe('typed fixture availability service', () => {
  afterEach(() => vi.useRealTimers());
  it('resolves through a real loading interval and returns available capacities', async () => {
    vi.useFakeTimers();
    const service = TestBed.inject(AvailabilityService);
    let settled = false;
    const result = firstValueFrom(service.check('2026-11-04', 2, [])).then((value) => {
      settled = true;
      return value;
    });
    expect(settled).toBe(false);
    await vi.advanceTimersByTimeAsync(250);
    expect((await result).slots[0]?.remaining).toBe(12);
  });
  it('provides a deterministic failure and a successful retry', async () => {
    vi.useFakeTimers();
    const service = TestBed.inject(AvailabilityService);
    const rejected = expect(firstValueFrom(service.check('2026-11-13', 2, []))).rejects.toThrow(
      'Please try again',
    );
    await vi.advanceTimersByTimeAsync(250);
    await rejected;
    const retry = firstValueFrom(service.check('2026-11-13', 2, [], true));
    await vi.advanceTimersByTimeAsync(250);
    expect((await retry).slots.some((slot) => slot.available)).toBe(true);
  });
  it('distinguishes a closed kitchen and a fully booked evening', async () => {
    vi.useFakeTimers();
    const service = TestBed.inject(AvailabilityService);
    const closed = firstValueFrom(service.check('2026-11-09', 2, []));
    await vi.advanceTimersByTimeAsync(250);
    expect((await closed).slots).toEqual([]);
    expect((await closed).message).toContain('Mondays');
    const full = firstValueFrom(service.check('2026-11-17', 2, []));
    await vi.advanceTimersByTimeAsync(250);
    expect((await full).slots.every((slot) => !slot.available)).toBe(true);
    expect((await full).message).toContain('fully booked');
  });
});
