import { retry } from './async-utils';

describe('retry', () => {
  it('resolves when the function succeeds within the allowed retries', async () => {
    let attempts = 0;
    const fn = () => {
      attempts += 1;
      if (attempts < 3) {
        return Promise.reject(new Error('fail'));
      }
      return Promise.resolve('ok');
    };

    const result = await retry(fn, { retries: 5, delayMs: 0 });

    expect(result).toEqual({ result: 'ok', attempts: 3 });
  });

  it('returns the last error when all retries fail', async () => {
    const error = new Error('boom');
    const fn = () => Promise.reject(error);

    const result = await retry(fn, { retries: 3, delayMs: 0 });

    expect(result.error).toBe(error);
    expect(result.result).toBeUndefined();
    expect(result.attempts).toBe(3);
  });

  it('stops retrying after a successful attempt', async () => {
    const fn = jest.fn().mockResolvedValue('ok');

    const result = await retry(fn, { retries: 5, delayMs: 0 });

    expect(fn).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ result: 'ok', attempts: 1 });
  });

  it('waits the specified delay between retries', async () => {
    jest.useFakeTimers();
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('ok');

    const promise = retry(fn, { retries: 2, delayMs: 100 });

    expect(fn).toHaveBeenCalledTimes(1);

    await jest.advanceTimersByTimeAsync(100);
    const result = await promise;

    expect(fn).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ result: 'ok', attempts: 2 });

    jest.useRealTimers();
  });
});
