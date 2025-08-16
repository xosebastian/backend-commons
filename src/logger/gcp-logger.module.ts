import { Module, DynamicModule, Provider } from '@nestjs/common';
import { GcpLoggerService, GcpLoggerOptions } from './gcp-logger.service';

@Module({})
export class GcpLoggerModule {
  static forRoot(options: GcpLoggerOptions): DynamicModule {
    return {
      module: GcpLoggerModule,
      providers: [{ provide: GcpLoggerService, useValue: new GcpLoggerService(options) }],
      exports: [GcpLoggerService],
    };
  }

  static forRootAsync(factory: () => Promise<GcpLoggerOptions> | GcpLoggerOptions): DynamicModule {
    const provider: Provider = {
      provide: GcpLoggerService,
      useFactory: async () => {
        const opts = await factory();
        return new GcpLoggerService(opts);
      },
    };
    return {
      module: GcpLoggerModule,
      providers: [provider],
      exports: [GcpLoggerService],
    };
  }
}
