import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { LoggerService } from './logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    const req = context.switchToHttp().getRequest();
    return next.handle().pipe(
      tap(() => {
        const latency = Date.now() - start;
        const res = context.switchToHttp().getResponse();
        this.logger.log({
          event: 'request_completed',
          latency_ms: latency,
          statusCode: res.statusCode,
          route: req.route?.path,
          method: req.method,
          contentLength: res.getHeader('content-length'),
        });
      }),
    );
  }
}
