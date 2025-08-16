import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';

@Injectable()
export class MockLoggerService implements NestLoggerService {
  logs: any[][] = [];
  errors: any[][] = [];
  warnings: any[][] = [];
  debugs: any[][] = [];
  verboses: any[][] = [];
  bindings: Record<string, any> = {};

  log(message: any, ...optionalParams: any[]) {
    this.logs.push([message, ...optionalParams]);
  }
  error(message: any, ...optionalParams: any[]) {
    this.errors.push([message, ...optionalParams]);
  }
  warn(message: any, ...optionalParams: any[]) {
    this.warnings.push([message, ...optionalParams]);
  }
  debug(message: any, ...optionalParams: any[]) {
    this.debugs.push([message, ...optionalParams]);
  }
  verbose(message: any, ...optionalParams: any[]) {
    this.verboses.push([message, ...optionalParams]);
  }

  setBindings(bindings: Record<string, any>) {
    this.bindings = bindings;
  }

  child(bindings: Record<string, any>) {
    this.bindings = { ...this.bindings, ...bindings };
    return this;
  }
}
