import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { GcpLoggerService } from '../logger/gcp-logger.service';
import { RequestContextService } from '../context/request-context.service';

/**
 * Logs request start/finish with context correlation.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly logger: GcpLoggerService,
    private readonly requestContextService: RequestContextService,
  ) {}

  public intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const req = http.getRequest?.();
    const method: string | undefined = req?.method;
    const url: string | undefined = req?.url;
    const start = Date.now();
    const ctx = this.requestContextService.getContext();
    if (ctx) {
      this.logger.setBindings({ requestId: ctx.requestId, traceId: ctx.traceId });
    }
    this.logger.log({ msg: 'request:start', method, url });
    return next.handle().pipe(
      tap({
        next: () => {
          const durationMs = Date.now() - start;
          this.logger.log({ msg: 'request:finish', method, url, durationMs });
        },
        error: (err: unknown) => {
          const durationMs = Date.now() - start;
          this.logger.error({ msg: 'request:error', method, url, durationMs, err });
        },
      }),
    );
  }
}

