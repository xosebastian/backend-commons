export interface RetryOptions {
  readonly retries: number;
  readonly delayMs: number;
}

export interface RetryResult<T> {
  readonly result?: T;
  readonly error?: unknown;
  readonly attempts: number;
}

/**
 * Retries the provided async function until it succeeds or the retry limit is reached.
 * @param fn Async function to invoke.
 * @param options Configuration for retry behavior.
 * @returns Object containing either the result or last error and attempt count.
 */
export async function retry<T>(
  fn: () => Promise<T>,
  { retries, delayMs }: RetryOptions
): Promise<RetryResult<T>> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await fn();
      return { result, attempts: attempt };
    } catch (err) {
      lastError = err;
      if (attempt === retries) {
        break;
      }
      if (delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  return { error: lastError, attempts: retries };
}

