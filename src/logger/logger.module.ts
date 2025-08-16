import { Module, DynamicModule, Provider } from '@nestjs/common';
import { LoggerService, GcpLoggerOptions } from './logger.service';

@Module({})
export class GcpLoggerModule {
  static forRoot(options: GcpLoggerOptions): DynamicModule {
    return {
      module: GcpLoggerModule,
      providers: [{ provide: LoggerService, useValue: new LoggerService(options) }],
      exports: [LoggerService],
    };
  }

  static forRootAsync(factory: () => Promise<GcpLoggerOptions> | GcpLoggerOptions): DynamicModule {
    const provider: Provider = {
      provide: LoggerService,
      useFactory: async () => {
        const opts = await factory();
        return new LoggerService(opts);
      },
    };
    return {
      module: GcpLoggerModule,
      providers: [provider],
      exports: [LoggerService],
    };
  }
}
