import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { GcpLoggerService } from '../logger/gcp-logger.service';

/**
 * Global HTTP exception filter that normalizes error responses and logs details.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: GcpLoggerService) {}

  public catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const body = exception instanceof HttpException ? exception.getResponse() : { message: 'Internal server error' };
    this.logger.error({ msg: 'http:error', status, error: body, path: request?.url });
    if (response) {
      response.status(status).json({ statusCode: status, error: body, path: request?.url });
    }
  }
}

