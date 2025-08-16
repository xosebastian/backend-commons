import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { loadYamlEnvironments } from './environments-loader';
import { AppConfigService } from './app-config.service';

/**
 * Global configuration module using @nestjs/config with validation hooks ready.
 */
@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: false,
      expandVariables: true,
      load: [loadYamlEnvironments],
    }),
  ],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class AppConfigModule {}

export interface AppConfigModuleOptions {
  readonly validationSchema?: unknown;
  readonly validate?: (config: Record<string, unknown>) => Record<string, unknown>;
  readonly load?: Array<() => Record<string, unknown>>;
  readonly ignoreEnvFile?: boolean;
  readonly expandVariables?: boolean;
}

export class AppConfigModuleFactory {
  public static register(options?: AppConfigModuleOptions): DynamicModule {
    return {
      module: AppConfigModule,
      global: true,
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: options?.ignoreEnvFile ?? false,
          expandVariables: options?.expandVariables ?? true,
          load: [loadYamlEnvironments, ...(options?.load ?? [])],
          // Typed as unknown to avoid forcing consumers to depend on Joi
          validationSchema: options?.validationSchema as unknown,
          validate: options?.validate,
        }),
      ],
      providers: [AppConfigService],
      exports: [AppConfigService],
    };
  }
}

