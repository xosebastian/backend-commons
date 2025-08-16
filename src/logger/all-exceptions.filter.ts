import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { LoggerService } from './logger.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const stack = process.env.NODE_ENV !== 'production' ? exception.stack : undefined;
    this.logger.error({
      event: 'exception',
      name: exception.name,
      message: exception.message,
      statusCode: status,
      stack,
    });
    res.status(status).json({ statusCode: status, message: 'Internal error' });
  }
}
