import type { INestApplication } from '@nestjs/common';
import { RequestContextService } from '../context/request-context.service';
import { GcpLoggerService } from '../logger/gcp-logger.service';

interface HttpRequestLike {
  readonly headers?: Record<string, string | string[] | undefined>;
  readonly method?: string;
  readonly url?: string;
  readonly [key: string]: unknown;
}

type HttpResponseLike = Record<string, unknown>;

/**
 * Crea un handler HTTP para Google Cloud Functions a partir de una app NestJS.
 * Inicializa el contexto y el logger usando headers estándares (`x-request-id` y `x-cloud-trace-context`).
 */
export function createGcfHttpHandler(app: INestApplication): (req: HttpRequestLike, res: HttpResponseLike) => unknown {
  const httpInstance = app.getHttpAdapter().getInstance();
  const requestContext = app.get(RequestContextService);
  const logger = app.get(GcpLoggerService);

  return (req: HttpRequestLike, res: HttpResponseLike): unknown => {
    const headers = req?.headers ?? {};
    const requestId = (headers['x-request-id'] as string | undefined) ?? undefined;
    const traceHeader = headers['x-cloud-trace-context'] as string | undefined;
    const traceId = traceHeader?.split('/')?.[0];
    return requestContext.runInContext({ requestId, traceId }, () => {
      logger.setBindings({ requestId: requestId || '', traceId });
      return (httpInstance as (r: HttpRequestLike, s: HttpResponseLike) => unknown)(req, res);
    });
  };
}


