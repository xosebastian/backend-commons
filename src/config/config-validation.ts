import { plainToInstance, instanceToPlain } from 'class-transformer';
import { validateSync } from 'class-validator';

export type ClassType<T> = new (...args: unknown[]) => T;

export function validateConfigWithClassValidator<T>(cls: ClassType<T>, plainConfig: Record<string, unknown>): T {
  const instance = plainToInstance(cls, plainConfig, { enableImplicitConversion: true });
  const errors = validateSync(instance as object, { whitelist: true, forbidNonWhitelisted: true });
  if (errors.length > 0) {
    const messages = errors.map((e) => Object.values(e.constraints ?? {}).join(', ')).filter(Boolean);
    throw new Error(`Invalid configuration: ${messages.join('; ')}`);
  }
  return instance;
}

export function createClassValidatorValidateFn<T>(cls: ClassType<T>): (config: Record<string, unknown>) => Record<string, unknown> {
  return (config: Record<string, unknown>): Record<string, unknown> => {
    const instance = validateConfigWithClassValidator(cls, config);
    return instanceToPlain(instance) as Record<string, unknown>;
  };
}


