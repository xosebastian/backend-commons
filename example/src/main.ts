import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import {
  ContextInterceptor,
  LoggingInterceptor,
  HttpExceptionFilter,
  GcpLoggerService,
} from '@epago/backend-commons';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = app.get(GcpLoggerService);
  app.useLogger(logger);
  app.useGlobalInterceptors(app.get(ContextInterceptor), app.get(LoggingInterceptor));
  app.useGlobalFilters(app.get(HttpExceptionFilter));
  await app.listen(3000);
}

bootstrap();
