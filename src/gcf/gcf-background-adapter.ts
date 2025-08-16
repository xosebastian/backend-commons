import type { INestApplication } from '@nestjs/common';
import { RequestContextService } from '../context/request-context.service';
import { GcpLoggerService } from '../logger/gcp-logger.service';
import { randomUUID } from 'node:crypto';

export interface BackgroundEvent<T = unknown> {
  readonly data?: T;
  readonly context?: {
    readonly eventId?: string;
    readonly traceId?: string;
    readonly timestamp?: string;
    readonly [key: string]: unknown;
  };
}

/**
 * Crea un handler para eventos background (Pub/Sub, Storage, etc.) con contexto y logging.
 */
export function createGcfBackgroundHandler<T = unknown>(
  app: INestApplication,
  handler: (event: BackgroundEvent<T>) => Promise<unknown> | unknown,
): (event: BackgroundEvent<T>) => Promise<unknown> {
  const requestContext = app.get(RequestContextService);
  const logger = app.get(GcpLoggerService);
  return async (event: BackgroundEvent<T>): Promise<unknown> => {
    const requestId = event?.context?.eventId ?? randomUUID();
    const traceId = event?.context?.traceId;
    return requestContext.runInContext({ requestId, traceId }, async () => {
      logger.setBindings({ requestId, traceId });
      return handler(event);
    });
  };
}


