import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

export interface LoadedEnvironmentConfig {
  readonly [key: string]: unknown;
}

/**
 * Loads environment configuration from environments/<ENV>.env.yaml at runtime.
 * - Uses ENVIRONMENT env var (default: DEV) to select the file.
 * - Can be overridden via ENV_FILE absolute or relative path.
 * - Returns a plain record to be merged into @nestjs/config store.
 */
export function loadYamlEnvironments(): LoadedEnvironmentConfig {
  const explicitPath: string | undefined = process.env.ENV_FILE;
  const envNameRaw: string = process.env.ENVIRONMENT ?? 'DEV';
  const envName: string = envNameRaw.trim().toLowerCase();
  const cwd: string = process.cwd();
  const defaultPath: string = join(cwd, 'environments', `${envName}.env.yaml`);
  const filePath: string = explicitPath ? (explicitPath.startsWith('/') ? explicitPath : join(cwd, explicitPath)) : defaultPath;
  if (!existsSync(filePath)) {
    return {};
  }
  const content: string = readFileSync(filePath, 'utf8');
  const parsed = parse(content) as unknown;
  return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : {};
}


