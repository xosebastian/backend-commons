import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import pino, { LoggerOptions } from 'pino';
import { AsyncLocalStorage } from 'node:async_hooks';

export interface RequestContext {
  requestId: string;
  method: string;
  path: string;
  userId?: string;
  ip: string;
  userAgent?: string;
  trace?: string;
  spanId?: string;
}

export const als = new AsyncLocalStorage<Record<string, any>>();

export interface GcpLoggerOptions {
  serviceName: string;
  projectId?: string;
  level?: string;
  redact?: string[];
  env?: string;
  sampleDebugRate?: number;
}

@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly logger: pino.Logger;

  constructor(private readonly options: GcpLoggerOptions, stream?: pino.DestinationStream) {
    const level = options.level ?? 'info';
    const redact =
      options.redact ?? ['password', 'token', 'authorization', 'cookie', '["set-cookie"]'];
    const env = options.env ?? process.env.NODE_ENV ?? 'development';
    const transport = env !== 'production'
      ? { target: 'pino-pretty', options: { singleLine: true } }
      : undefined;

    const opts: LoggerOptions = {
      level,
      redact,
      messageKey: 'message',
      transport,
      formatters: {
        level(label) {
          const map: Record<string, string> = {
            trace: 'DEBUG',
            debug: 'DEBUG',
            verbose: 'DEBUG',
            info: 'INFO',
            log: 'INFO',
            warn: 'WARNING',
            error: 'ERROR',
            fatal: 'CRITICAL',
          };
          return { severity: map[label] ?? 'DEFAULT' };
        },
        log(object) {
          const store = als.getStore() || {};
          const { trace, spanId, ...rest } = store;
          return {
            ...rest,
            ...(trace ? { 'logging.googleapis.com/trace': trace } : {}),
            ...(spanId ? { 'logging.googleapis.com/spanId': spanId } : {}),
            ...object,
          };
        },
      },
    };
    this.logger = pino(opts, stream);
  }

  log(message: any, ...optionalParams: any[]) {
    this.logger.info(message, ...optionalParams);
  }
  error(message: any, ...optionalParams: any[]) {
    this.logger.error(message, ...optionalParams);
  }
  warn(message: any, ...optionalParams: any[]) {
    this.logger.warn(message, ...optionalParams);
  }
  debug(message: any, ...optionalParams: any[]) {
    this.logger.debug(message, ...optionalParams);
  }
  verbose(message: any, ...optionalParams: any[]) {
    this.logger.debug(message, ...optionalParams);
  }

  child(bindings: Record<string, any>) {
    return this.logger.child(bindings);
  }
}
