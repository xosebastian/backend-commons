import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  ContextInterceptor,
  LoggingInterceptor,
  HttpExceptionFilter,
  GcpLoggerService,
  createGcfHttpHandler,
  createGcfBackgroundHandler,
} from '@epago/backend-commons';
import { AppModule } from './app.module';

let app: INestApplication | undefined;
async function getApp(): Promise<INestApplication> {
  if (!app) {
    app = await NestFactory.create(AppModule, { bufferLogs: true });
    const logger = app.get(GcpLoggerService);
    app.useLogger(logger);
    app.useGlobalInterceptors(app.get(ContextInterceptor), app.get(LoggingInterceptor));
    app.useGlobalFilters(app.get(HttpExceptionFilter));
    await app.init();
  }
  return app;
}

export const httpFunction = async (req: unknown, res: unknown) => {
  const application = await getApp();
  return createGcfHttpHandler(application)(req as any, res as any);
};

export const backgroundFunction = async (event: any) => {
  const application = await getApp();
  const handler = createGcfBackgroundHandler(application, async (e) => {
    const logger = application.get(GcpLoggerService);
    logger.log({ msg: 'background:event', event: e });
  });
  return handler(event);
};
