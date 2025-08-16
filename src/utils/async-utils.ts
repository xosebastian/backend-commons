export interface RetryOptions {
  readonly retries: number;
  readonly delayMs: number;
}

export interface RetryResult<T> {
  readonly result?: T;
  readonly error?: unknown;
  readonly attempts: number;
}

export async function retry<T>(fn: () => Promise<T>, options: RetryOptions): Promise<RetryResult<T>> {
  let attempts = 0;
  let lastError: unknown;
  while (attempts < options.retries) {
    try {
      const result = await fn();
      return { result, attempts: attempts + 1 };
    } catch (err) {
      attempts += 1;
      lastError = err;
      if (attempts >= options.retries) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, options.delayMs));
    }
  }
  return { error: lastError, attempts };
}

