import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface AppConfig {
  readonly nodeEnv: string;
  readonly projectId?: string;
  readonly serviceName?: string;
  readonly logLevel?: string;
}

/**
 * Typed facade over Nest ConfigService.
 */
@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  public getAll(): AppConfig {
    const nodeEnv = this.readValue<string>('NODE_ENV', 'development') || 'development';
    const gcpProject = this.readValue<string>('GCP_PROJECT');
    const gcloudProject = this.readValue<string>('GCLOUD_PROJECT');
    const serviceName = this.readValue<string>('SERVICE_NAME');
    const logLevel = this.readValue<string>('LOG_LEVEL', 'info') || 'info';
    return {
      nodeEnv,
      projectId: gcpProject || gcloudProject,
      serviceName,
      logLevel,
    };
  }

  public get<T = string>(key: string, defaultValue?: T): T {
    const value = this.readValue<T>(key, defaultValue);
    return value as T;
  }

  private readValue<T>(key: string, defaultValue?: T): T | undefined {
    if (this.configService) {
      const value = this.configService.get<T>(key);
      return (value ?? defaultValue) as T | undefined;
    }
    const envKey = key.toUpperCase();
    const raw = process.env[envKey];
    return (raw as unknown as T) ?? defaultValue;
  }
}

