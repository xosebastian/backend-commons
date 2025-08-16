import { ERROR_CODES, ErrorCode } from './error-codes';

export interface AppErrorOptions {
  readonly code?: ErrorCode;
  readonly details?: unknown;
  readonly cause?: unknown;
}

/**
 * Domain error with machine-friendly code and optional details.
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly details?: unknown;

  constructor(message: string, options: AppErrorOptions = {}) {
    super(message, { cause: options.cause as Error });
    this.name = 'AppError';
    this.code = options.code ?? ERROR_CODES.UNKNOWN;
    this.details = options.details;
  }
}

