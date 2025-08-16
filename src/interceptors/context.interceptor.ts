import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { RequestContextService } from '../context/request-context.service';
import { tap } from 'rxjs/operators';

/**
 * Initializes request context per invocation. Works for HTTP and background function handlers.
 */
@Injectable()
export class ContextInterceptor implements NestInterceptor {
  constructor(private readonly requestContextService: RequestContextService) {}

  public intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const req = http.getRequest?.();
    const headers = req?.headers ?? {};
    const xRequestId = headers['x-request-id'] as string | undefined;
    const traceHeader = headers['x-cloud-trace-context'] as string | undefined;
    const traceId = traceHeader?.split('/')?.[0];

    return this.requestContextService.runInContext(
      { requestId: xRequestId, traceId },
      () =>
        next.handle().pipe(
          tap(() => {
            // no-op end hook; context ends when Observable completes
          }),
        ),
    );
  }
}

